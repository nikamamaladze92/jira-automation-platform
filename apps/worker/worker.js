require("dotenv").config({ path: "../api/.env" });

const mongoose = require("mongoose");
const createJobModel = require("../shared/models/jobModel");
const jira = require("./services/jiraService");
async function startWorker() {
  try {
    // Make buffering fail fast so we see real connection errors
    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.DATABASE_LOCAL, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Worker connected to MongoDB");

    const Job = createJobModel(mongoose);

    while (true) {
      const job = await Job.findOneAndUpdate(
        { status: "queued" },
        { status: "processing", $inc: { attempts: 1 } },
        { returnDocument: "after" },
      );

      if (!job) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      console.log(
        "Processing job:",
        job._id.toString(),
        job.type,
        job.issueKey,
      );

      try {
        await executeJob(job);

        job.status = "succeeded";
        await job.save();

        console.log("Job completed");
      } catch (err) {
        job.status = "failed";
        job.error = err.message;
        await job.save();

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
      break;

    case "ASSIGN_ISSUE":
      await jira.assignIssue(job.issueKey, job.payload.accountId);
      break;

    case "TRANSITION_ISSUE":
      await jira.transitionIssue(job.issueKey, job.payload.transitionId);
      break;

    case "UPDATE_FIELD":
      await jira.updateField(job.issueKey, job.payload.fields);
      break;

    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

startWorker();
