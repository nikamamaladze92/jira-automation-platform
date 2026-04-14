const catchAsync = require("../utils/catchAsync");
const jiraTicketService = require("../services/jiraTicketService");
const { processIncomingEvent } = require("../services/automationService");

exports.createTicket = catchAsync(async (req, res) => {
  const { summary, description, priority, department } = req.body;

  const jiraIssue = await jiraTicketService.createIssue({
    projectKey: "KAN",
    summary,
    description,
    issueType: "Task",
    priority,
  });

  const automationResult = await processIncomingEvent({
    source: "jira",
    eventType: "issue_created",
    issueKey: jiraIssue.key,
    priority,
    department,
    payload: {
      source: "internal_ticket_creation",
      summary,
      description,
      priority,
      department,
      jiraIssueId: jiraIssue.id,
      jiraIssueKey: jiraIssue.key,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      ticket: jiraIssue,
      metadata: {
        department,
        priority,
      },
      automation: {
        duplicate: automationResult.duplicate,
        matchedRules: automationResult.matchedRules.map((rule) => ({
          id: rule._id,
          name: rule.name,
        })),
        jobs: automationResult.jobs,
      },
    },
  });
});
