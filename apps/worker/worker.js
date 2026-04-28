require("dotenv").config();

const connectDB = require("../shared/db/mongoose");

const mongoose = require("mongoose");
const createJobModel = require("../shared/models/jobModel");
const createExecutionModel = require("../shared/models/execution");
const jira = require("./services/jiraService");
const createUserModel = require("../shared/models/userModel");
const emailService = require("./services/emailService");

const WORKER_ID = `worker-${process.pid}`;

function formatDepartment(value) {
  switch (value) {
    case "warehouse":
      return "Warehouse";
    case "mechanic":
      return "Mechanic";
    case "body_shop":
      return "Body Shop";
    case "painting":
      return "Painting";
    case "inspection":
      return "Inspection";
    case "customer_service":
      return "Customer Service";
    default:
      return value || "Unknown";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startWorker() {
  console.log(`Worker started: ${WORKER_ID}`);
  try {
    await connectDB();
    // make buffering fail fast so we see real connection errors
    mongoose.set("bufferCommands", false);

    // await mongoose.connect(process.env.DATABASE_ATLAS, {
    //   serverSelectionTimeoutMS: 5000,
    // });

    // console.log("Worker connected to MongoDB");

    const Job = createJobModel(mongoose);
    const Execution = createExecutionModel(mongoose);
    const User = createUserModel(mongoose);

    while (true) {
      // const job = await Job.findOneAndUpdate(
      //   { status: "queued" },
      //   { status: "processing", $inc: { attempts: 1 } },
      //   { returnDocument: "after" },
      // );
      const job = await Job.findOneAndUpdate(
        { status: "queued" },
        {
          status: "processing",
          lockedBy: WORKER_ID,
          lockedAt: new Date(),
          $inc: { attempts: 1 },
        },
        {
          sort: { createdAt: 1 },
          returnDocument: "after",
        },
      );

      if (!job) {
        await sleep(1000);
        continue;
      }

      console.log(
        "Processing job:",
        job._id.toString(),
        job.type,
        job.issueKey,
      );

      const startedAt = Date.now();

      const execution = await Execution.create({
        jobId: job._id,
        issueKey: job.issueKey,
        type: job.type,
        status: "running",
        workerId: WORKER_ID,
        startedAt: new Date(startedAt),
      });

      try {
        const result = await executeJob(job, User);

        job.status = "succeeded";
        job.error = undefined;
        await job.save();

        execution.status = "succeeded";
        execution.finishedAt = new Date();
        execution.durationMs = Date.now() - startedAt;
        execution.result = result || { ok: true };
        await execution.save();

        console.log("Job completed");
      } catch (err) {
        job.status = "failed";
        job.error = err.message;
        await job.save();

        execution.status = "failed";
        execution.finishedAt = new Date();
        execution.durationMs = Date.now() - startedAt;
        execution.error = err.message;
        execution.result = err.response?.data || null;
        await execution.save();

        console.log("Job failed:");
        console.log(err.response?.data || err.message);
      }
    }
  } catch (err) {
    console.error("Worker startup error:", err.message);
    process.exit(1);
  }
}

async function executeJob(job, User) {
  switch (job.type) {
    case "ADD_COMMENT":
      await jira.addComment(job.issueKey, job.payload.comment);
      return { action: "ADD_COMMENT" };
    case "SEND_EMAIL": {
      const department = job.payload?.department;

      const formattedDepartment = formatDepartment(department);

      if (!department) {
        throw new Error("SEND_EMAIL job is missing department");
      }
      const manager = await User.findOne({
        role: "manager",
        department,
        active: true,
      });
      if (!manager) {
        throw new Error(`No manager found for department: ${department}`);
      }
      const subject =
        job.payload?.subject ||
        `New Jira ticket requires attention: ${job.issueKey}`;
      const text =
        job.payload?.text ||
        [
          `A high-priority Jira ticket was created for ${formattedDepartment}.`,
          ``,
          `Issue Key: ${job.issueKey}`,
          `Department: ${formattedDepartment}`,
          ``,
          `Please review this ticket in Jira.`,
        ].join("\n");

      const html =
        job.payload?.html ||
        `
    <p>A high-priority Jira ticket was created for <strong>${formattedDepartment}</strong>.</p>
    <p><strong>Issue Key:</strong> ${job.issueKey}</p>
    <p><strong>Department:</strong> ${formattedDepartment}</p>
    <p>Please review this ticket in Jira.</p>
  `;
      const emailResult = await emailService.sendEmail({
        to: manager.email,
        subject,
        text,
        html,
      });
      return {
        action: "SEND_EMAIL",
        recipient: manager.email,
        department,
        ...emailResult,
      };
    }
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

startWorker();
