const crypto = require("crypto");
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
  const normalizedActual = normalizeValue(actualValue);
  const normalizedExpected = normalizeValue(condition.value);

  console.log("Checking condition:", {
    field: condition.field,
    operator: condition.operator,
    actualValue,
    normalizedActual,
    expectedValue: condition.value,
    normalizedExpected,
  });

  switch (condition.operator) {
    case "equals":
      return normalizedActual === normalizedExpected;
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

function buildEventFingerprint({
  source,
  eventType,
  issueKey,
  priority,
  department,
}) {
  const raw = JSON.stringify({
    source: normalizeValue(source),
    eventType: normalizeValue(eventType),
    issueKey: normalizeValue(issueKey),
    priority: normalizeValue(priority),
    department: normalizeValue(department),
  });
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function buildJobDedupeKey({ eventId, ruleId, actionIndex, type, issueKey }) {
  const raw = JSON.stringify({
    eventId: String(eventId),
    ruleId: String(ruleId),
    actionIndex,
    type: normalizeValue(type),
    issueKey: normalizeValue(issueKey),
  });
  return crypto.createHash("sha256").update(raw).digest("hex");
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
      const dedupeKey = buildJobDedupeKey({
        eventId: savedEvent._id,
        ruleId: rule._id,
        actionIndex,
        type: action.type,
        issueKey: savedEvent.issueKey,
      });

      try {
        const job = await Job.create({
          type: action.type,
          issueKey: savedEvent.issueKey,
          payload: action.payload,
          status: "queued",
          eventId: savedEvent._id,
          ruleId: rule._id,
          actionIndex,
          dedupeKey,
        });

        jobs.push(job);
      } catch (err) {
        if (err.code === 11000) {
          const existingJob = await Job.findOne({ dedupeKey });
          if (existingJob) {
            jobs.push(existingJob);
            continue;
          }
        }
        throw err;
      }
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
  const normalizedEvent = {
    source: normalizeValue(source),
    eventType: normalizeValue(eventType),
    issueKey: issueKey ? String(issueKey).trim() : "",
    priority: normalizeValue(priority),
    department: normalizeValue(department),
    payload,
  };

  console.log("=== PROCESS INCOMING EVENT ===");
  console.log("Normalized event:", normalizedEvent);

  const eventFingerprint = buildEventFingerprint(normalizedEvent);

  let savedEvent;

  try {
    savedEvent = await Event.create({
      ...normalizedEvent,
      processed: false,
      eventFingerprint,
    });
  } catch (err) {
    if (err.code === 11000) {
      const existingEvent = await Event.findOne({ eventFingerprint });

      console.log("Duplicate event detected:", eventFingerprint);

      return {
        event: existingEvent,
        matchedRules: [],
        jobs: [],
        duplicate: true,
      };
    }

    throw err;
  }

  const rules = await Rule.find({
    enabled: true,
    isDeleted: false,
    trigger: normalizedEvent.eventType,
  });

  console.log(
    "Candidate rules:",
    rules.map((rule) => ({
      id: rule._id,
      name: rule.name,
      trigger: rule.trigger,
      enabled: rule.enabled,
      isDeleted: rule.isDeleted,
      conditions: rule.conditions,
      actions: rule.actions,
    })),
  );

  const matchedRules = rules.filter((rule) =>
    ruleMatchesEvent(rule, normalizedEvent),
  );

  console.log(
    "Matched rules:",
    matchedRules.map((rule) => ({
      id: rule._id,
      name: rule.name,
    })),
  );

  const jobs = await createJobsFromMatchedRules(savedEvent, matchedRules);

  console.log(
    "Created jobs:",
    jobs.map((job) => ({
      id: job._id,
      type: job.type,
      issueKey: job.issueKey,
      status: job.status,
    })),
  );

  savedEvent.processed = true;
  await savedEvent.save();

  return {
    event: savedEvent,
    matchedRules,
    jobs,
    duplicate: false,
  };
}

module.exports = {
  processIncomingEvent,
  normalizeValue,
  matchesCondition,
  ruleMatchesEvent,
  buildEventFingerprint,
  buildJobDedupeKey,
};
