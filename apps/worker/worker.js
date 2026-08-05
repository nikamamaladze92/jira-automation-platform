require("dotenv").config();

const connectDB = require("../shared/db/mongoose");
const mongoose = require("mongoose");
const createJobModel = require("../shared/models/jobModel");
const createExecutionModel = require("../shared/models/execution");
const createUserModel = require("../shared/models/userModel");
const jira = require("./services/jiraService");
const emailService = require("./services/emailService");

const WORKER_ID = `worker-${process.pid}`;
const MAX_ATTEMPTS = 3;
const STALE_LOCK_MS = 5 * 60 * 1000; // 5 minutes

function formatDepartment(value) {
  const map = {
    warehouse: "Warehouse",
    mechanic: "Mechanic",
    body_shop: "Body Shop",
    painting: "Painting",
    inspection: "Inspection",
    customer_service: "Customer Service",
  };
  return map[value] ?? value ?? "Unknown";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Recover jobs that were locked by a crashed worker and never finished.
// If a job has been in "processing" for more than STALE_LOCK_MS, requeue it.
async function recoverStaleJobs(Job) {
  const staleLockTime = new Date(Date.now() - STALE_LOCK_MS);

  const result = await Job.updateMany(
    {
      status: "processing",
      lockedAt: { $lt: staleLockTime },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    {
      $set: { status: "queued", lockedBy: null, lockedAt: null },
    },
  );

  if (result.modifiedCount > 0) {
    console.log(`Recovered ${result.modifiedCount} stale job(s).`);
  }
}

async function startWorker() {
  console.log(`Worker started: ${WORKER_ID}`);

  try {
    await connectDB();
    mongoose.set("bufferCommands", false);

    const Job = createJobModel(mongoose);
    const Execution = createExecutionModel(mongoose);
    const User = createUserModel(mongoose);

    // Run stale job recovery every 2 minutes in the background
    setInterval(() => recoverStaleJobs(Job), 2 * 60 * 1000);

    // Run once immediately on startup
    await recoverStaleJobs(Job);

    while (true) {
      const job = await Job.findOneAndUpdate(
        {
          status: "queued",
          attempts: { $lt: MAX_ATTEMPTS },
        },
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
      } catch (err) {
        const permanentlyFailed = job.attempts >= MAX_ATTEMPTS;

        job.status = permanentlyFailed ? "failed" : "queued";
        job.error = err.message;
        job.lockedBy = null;
        job.lockedAt = null;
        await job.save();

        execution.status = "failed";
        execution.finishedAt = new Date();
        execution.durationMs = Date.now() - startedAt;
        execution.error = err.message;
        execution.result = err.response?.data || null;
        await execution.save();

        if (permanentlyFailed) {
          console.error(
            `Job ${job._id} failed permanently after ${MAX_ATTEMPTS} attempts: ${err.message}`,
          );
        }
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
      const { department } = job.payload;

      if (!department) {
        throw new Error("SEND_EMAIL job is missing department");
      }

      const manager = await User.findOne({
        role: "manager",
        department,
        active: true,
      });

      if (!manager) {
        throw new Error(
          `No active manager found for department: ${department}`,
        );
      }

      const formattedDept = formatDepartment(department);

      const subject = `New Jira ticket requires attention: ${job.issueKey}`;
      const text = [
        `A high-priority Jira ticket was created for ${formattedDept}.`,
        ``,
        `Issue Key: ${job.issueKey}`,
        `Department: ${formattedDept}`,
        ``,
        `Please review this ticket in Jira.`,
      ].join("\n");

      const html = `
        <p>A high-priority Jira ticket was created for <strong>${formattedDept}</strong>.</p>
        <p><strong>Issue Key:</strong> ${job.issueKey}</p>
        <p><strong>Department:</strong> ${formattedDept}</p>
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
