const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");
const createJobModel = require("../../shared/models/jobModel");

const Rule = createRuleModel(mongoose);
const Job = createJobModel(mongoose);

function matchesCondition(event, condition) {
  const actualValue = event[condition.field];

  switch (condition.operator) {
    case "equals":
      return String(actualValue) === String(condition.value);
    default:
      return false;
  }
}

function ruleMatchesEvent(rule, event) {
  if (rule.trigger !== event.eventType) return false;

  return rule.conditions.every((condition) =>
    matchesCondition(event, condition),
  );
}

exports.triggerDemoEvent = async (req, res) => {
  try {
    const event = req.body;

    const rules = await Rule.find({
      enabled: true,
      trigger: event.eventType,
    });

    const matchedRules = rules.filter((rule) => ruleMatchesEvent(rule, event));

    const jobs = [];

    for (const rule of matchedRules) {
      for (const action of rule.actions) {
        const job = await Job.create({
          type: action.type,
          issueKey: event.issueKey,
          department: event.department,
          payload: action.payload,
          status: "queued",
        });

        jobs.push(job);
      }
    }

    res.status(200).json({
      status: "success",
      results: jobs.length,
      data: {
        matchedRules: matchedRules.map((rule) => ({
          id: rule._id,
          name: rule.name,
        })),
        jobs,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
