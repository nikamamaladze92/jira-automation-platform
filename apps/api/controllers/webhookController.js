require("dotenv").config();

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { processIncomingEvent } = require("../services/automationService");

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
  const priority = jiraPayload.issue?.fields?.priority?.name;
  const department =
    jiraPayload.issue?.fields?.customfield_department ||
    jiraPayload.department ||
    "";

  const result = await processIncomingEvent({
    source: "jira",
    eventType,
    issueKey,
    priority,
    department,
    payload: jiraPayload,
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
      ? "duplicate webhook event ignored"
      : "webhook event processed successfully",
  });
});
