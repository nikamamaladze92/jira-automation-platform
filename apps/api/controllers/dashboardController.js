const mongoose = require("mongoose");
const createJobModel = require("../../shared/models/jobModel");
const createExecutionModel = require("../../shared/models/Execution");
const createRuleModel = require("../../shared/models/ruleModel");
const createEventModel = require("../../shared/models/eventModel");

const Job = createJobModel(mongoose);
const Execution = createExecutionModel(mongoose);
const Rule = createRuleModel(mongoose);
const Event = createEventModel(mongoose);

exports.getSummary = async (req, res, next) => {
  try {
    const [
      totalJobs,
      queuedJobs,
      processingJobs,
      failedJobs,
      succeededJobs,
      totalExecutions,
      totalRules,
      enabledRules,
      totalEvents,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: "queued" }),
      Job.countDocuments({ status: "processing" }),
      Job.countDocuments({ status: "failed" }),
      Job.countDocuments({ status: "succeeded" }),
      Execution.countDocuments(),
      Rule.countDocuments(),
      Rule.countDocuments({ enabled: true }),
      Event.countDocuments(),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        jobs: {
          total: totalJobs,
          queued: queuedJobs,
          processing: processingJobs,
          failed: failedJobs,
          succeeded: succeededJobs,
        },
        executions: {
          total: totalExecutions,
        },
        rules: {
          total: totalRules,
          enabled: enabledRules,
        },
        events: {
          total: totalEvents,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
