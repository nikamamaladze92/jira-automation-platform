require("dotenv").config();
const connectDB = require("../shared/db/mongoose");

const mongoose = require("mongoose");
const createJobModel = require("../shared/models/jobModel");
const createExecutionModel = require("../shared/models/Execution");
const jira = require("./services/jiraService");
const WORKER_ID = `worker-${process.pid}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startWorker() {
  console.log(`Worker started: ${WORKER_ID}`);
  try {
    await connectDB();
    // Make buffering fail fast so we see real connection errors
    mongoose.set("bufferCommands", false);

    // await mongoose.connect(process.env.DATABASE_ATLAS, {
    //   serverSelectionTimeoutMS: 5000,
    // });

    // console.log("Worker connected to MongoDB");

    const Job = createJobModel(mongoose);
    const Execution = createExecutionModel(mongoose);

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
        const result = await executeJob(job);

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
async function executeJob(job) {
  switch (job.type) {
    case "ADD_COMMENT":
      await jira.addComment(job.issueKey, job.payload.comment);
      return { action: "ADD_COMMENT" };

    case "ASSIGN_ISSUE":
      await jira.assignIssue(job.issueKey, job.payload.accountId);
      return { action: "ASSIGN_ISSUE" };

    case "TRANSITION_ISSUE":
      await jira.transitionIssue(job.issueKey, job.payload.transitionId);
      return { action: "TRANSITION_ISSUE" };

    case "UPDATE_FIELD":
      await jira.updateField(job.issueKey, job.payload.fields);
      return { action: "UPDATE_FIELD" };

    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

startWorker();
