const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");
const {
  normalizeValue,
  ruleMatchesEvent,
} = require("../services/automationService");

const Rule = createRuleModel(mongoose);

// Demo controller runs a read only simulation.
// It matches rules against the incoming event but does NOT create
// real jobs or events  so the worker never picks anything up.

exports.triggerDemoEvent = async (req, res) => {
  try {
    const { eventType, priority, department } = req.body;

    const normalizedEvent = {
      eventType: normalizeValue(eventType),
      priority: normalizeValue(priority),
      department: normalizeValue(department),
      issueKey: req.body.issueKey || "DEMO",
    };

    const rules = await Rule.find({
      enabled: true,
      isDeleted: false,
      trigger: normalizedEvent.eventType,
    });

    const matchedRules = rules.filter((rule) =>
      ruleMatchesEvent(rule, normalizedEvent),
    );

    // Build simulated jobs — not saved to DB, just for display
    const simulatedJobs = matchedRules.flatMap((rule) =>
      rule.actions.map((action, index) => ({
        _id: `sim-${rule._id}-${index}`,
        type: action.type,
        issueKey: normalizedEvent.issueKey,
        status: "queued",
      })),
    );

    res.status(200).json({
      status: "success",
      data: {
        event: {
          issueKey: normalizedEvent.issueKey,
          eventType: normalizedEvent.eventType,
          priority: normalizedEvent.priority,
          department: normalizedEvent.department,
          source: "demo",
        },
        matchedRules: matchedRules.map((rule) => ({
          _id: rule._id,
          name: rule.name,
        })),
        jobs: simulatedJobs,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// const { processIncomingEvent } = require("../services/automationService");

// exports.triggerDemoEvent = async (req, res) => {
//   try {
//     const incomingEvent = req.body;

//     const result = await processIncomingEvent({
//       source: "demo",
//       eventType: incomingEvent.eventType,
//       issueKey: incomingEvent.issueKey,
//       priority: incomingEvent.priority,
//       department: incomingEvent.department,
//       payload: incomingEvent,
//     });

//     res.status(200).json({
//       status: "success",
//       duplicate: result.duplicate,
//       results: result.jobs.length,
//       data: {
//         event: result.event,
//         matchedRules: result.matchedRules.map((rule) => ({
//           id: rule._id,
//           name: rule.name,
//         })),
//         jobs: result.jobs,
//       },
//       message: result.duplicate
//         ? "Duplicate event ignored"
//         : "Event processed successfully",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };
