//  receive Jira webhook events
//  store event in db
//  matching rules
//  create jobs for worker
require("dotenv").config();
const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");
const createJobModel = require("../../shared/models/jobModel");
const createEventModel = require("../../shared/models/eventModel");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const Rule = createRuleModel(mongoose);
const Job = createJobModel(mongoose);
const Event = createEventModel(mongoose);

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

exports.handleJiraWebhook = catchAsync(async (req, res, next) => {
  const incomingSecret = req.headers["x-webhook-secret"];

  if (incomingSecret !== process.env.JIRA_WEBHOOK_SECRET) {
    return next(new AppError("Invalid webhook secret", 401));
  }

  const jiraPayload = req.body;

  const eventType =
    jiraPayload.webhookEvent === "jira:issue_created" ? "issue_created" : null;

  if (!eventType) {
    return res.status(200).json({
      status: "success",
      message: "Webhook received but ignored",
    });
  }

  const issueKey = jiraPayload.issue?.key;
  const priority = jiraPayload.issue?.fields?.priority?.name?.toLowerCase();
  const department =
    jiraPayload.issue?.fields?.customfield_department?.toLowerCase?.() ||
    jiraPayload.department ||
    "";

  const savedEvent = await Event.create({
    source: "jira",
    eventType,
    issueKey,
    priority,
    department,
    payload: jiraPayload,
    processed: false,
  });

  const rules = await Rule.find({
    enabled: true,
    isDeleted: false,
    trigger: eventType,
  });

  const matchedRules = rules.filter((rule) =>
    ruleMatchesEvent(rule, savedEvent),
  );

  const jobs = [];

  for (const rule of matchedRules) {
    for (const action of rule.actions) {
      const job = await Job.create({
        type: action.type,
        issueKey: savedEvent.issueKey,
        payload: action.payload,
        status: "queued",
      });

      jobs.push(job);
    }
  }

  savedEvent.processed = true;
  await savedEvent.save();

  res.status(200).json({
    status: "success",
    results: jobs.length,
    data: {
      event: savedEvent,
      matchedRules: matchedRules.map((rule) => ({
        id: rule._id,
        name: rule.name,
      })),
      jobs,
    },
  });
});
