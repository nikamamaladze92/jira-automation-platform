// const mongoose = require("mongoose");
// const createRuleModel = require("../../shared/models/ruleModel");
// const createJobModel = require("../../shared/models/jobModel");
// const createEventModel = require("../../shared/models/eventModel");

// const Rule = createRuleModel(mongoose);
// const Job = createJobModel(mongoose);
// const Event = createEventModel(mongoose);

// function matchesCondition(event, condition) {
//   const actualValue = event[condition.field];

//   switch (condition.operator) {
//     case "equals":
//       return String(actualValue) === String(condition.value);
//     default:
//       return false;
//   }
// }

// function ruleMatchesEvent(rule, event) {
//   if (rule.trigger !== event.eventType) return false;

//   return rule.conditions.every((condition) =>
//     matchesCondition(event, condition),
//   );
// }

// exports.triggerDemoEvent = async (req, res) => {
//   try {
//     const incomingEvent = req.body;

//     const savedEvent = await Event.create({
//       source: "demo",
//       eventType: incomingEvent.eventType,
//       issueKey: incomingEvent.issueKey,
//       priority: incomingEvent.priority,
//       department: incomingEvent.department,
//       payload: incomingEvent,
//       processed: false,
//     });

//     const rules = await Rule.find({
//       enabled: true,
//       trigger: savedEvent.eventType,
//     });

//     const matchedRules = rules.filter((rule) =>
//       ruleMatchesEvent(rule, savedEvent),
//     );

//     const jobs = [];

//     for (const rule of matchedRules) {
//       for (const action of rule.actions) {
//         const job = await Job.create({
//           type: action.type,
//           issueKey: savedEvent.issueKey,
//           payload: action.payload,
//           status: "queued",
//         });

//         jobs.push(job);
//       }
//     }

//     savedEvent.processed = true;
//     await savedEvent.save();

//     res.status(200).json({
//       status: "success",
//       results: jobs.length,
//       data: {
//         event: savedEvent,
//         matchedRules: matchedRules.map((rule) => ({
//           id: rule._id,
//           name: rule.name,
//         })),
//         jobs,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };

//
//
//

const { processIncomingEvent } = require("../services/automationService");

exports.triggerDemoEvent = async (req, res) => {
  try {
    const incomingEvent = req.body;

    const result = await processIncomingEvent({
      source: "demo",
      eventType: incomingEvent.eventType,
      issueKey: incomingEvent.issueKey,
      priority: incomingEvent.priority,
      department: incomingEvent.department,
      payload: incomingEvent,
    });

    res.status(200).json({
      status: "success",
      duplicate: result.duplicate,
      results: result.jobs.length,
      data: {
        event: result.event,
        matchedRules: result.matchedRules.map((rule) => ({
          id: rule._id,
          name: rule.name,
        })),
        jobs: result.jobs,
      },
      message: result.duplicate
        ? "Duplicate event ignored"
        : "Event processed successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
