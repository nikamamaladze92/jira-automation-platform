const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");
const createJobModel = require("../../shared/models/jobModel");
const createEventModel = require("../../shared/models/eventModel");

const Rule = createRuleModel(mongoose);
const Job = createJobModel(mongoose);
const Event = createEventModel(mongoose);

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

function matchesCondition(event, condition) {
  const actualValue = event[condition.field];

  switch (condition.operator) {
    case "equals":
      return normalizeValue(actualValue) === normalizeValue(condition.value);
    default:
      return false;
  }
}

function ruleMatchesEvent(rule, event) {
  if (normalizeValue(rule.trigger) !== normalizeValue(event.eventType)) {
    return false;
  }

  return rule.conditions.every((condition) =>
    matchesCondition(event, condition),
  );
}

async function createJobsFromMatchedRules(savedEvent, matchedRules) {
  const jobs = [];

  for (const rule of matchedRules) {
    for (
      let actionIndex = 0;
      actionIndex < rule.actions.length;
      actionIndex++
    ) {
      const action = rule.actions[actionIndex];

      const job = await Job.create({
        type: action.type,
        issueKey: savedEvent.issueKey,
        payload: action.payload,
        status: "queued",
        eventId: savedEvent._id,
        ruleId: rule._id,
        actionIndex,
      });

      jobs.push(job);
    }
  }

  return jobs;
}

async function processIncomingEvent({
  source,
  eventType,
  issueKey,
  priority,
  department,
  payload,
}) {
  const savedEvent = await Event.create({
    source,
    eventType,
    issueKey,
    priority: normalizeValue(priority),
    department: normalizeValue(department),
    payload,
    processed: false,
  });

  const rules = await Rule.find({
    enabled: true,
    isDeleted: false,
    trigger: savedEvent.eventType,
  });

  const matchedRules = rules.filter((rule) =>
    ruleMatchesEvent(rule, savedEvent),
  );

  const jobs = await createJobsFromMatchedRules(savedEvent, matchedRules);

  savedEvent.processed = true;
  await savedEvent.save();

  return {
    event: savedEvent,
    matchedRules,
    jobs,
  };
}

module.exports = {
  processIncomingEvent,
  normalizeValue,
  matchesCondition,
  ruleMatchesEvent,
};
