// get dashboard ticket requests, crate the issue and return issue info

const catchAsync = require("../utils/catchAsync");
const jiraTicketService = require("../services/jiraTicketService");

exports.createTicket = catchAsync(async (req, res, next) => {
  const jiraIssue = await jiraTicketService.createIssue({
    projectKey: req.body.projectKey,
    summary: req.body.summary,
    description: req.body.description,
    issueType: req.body.issueType || "Task",
    priority: req.body.priority,
  });

  res.status(201).json({
    status: "success",
    data: {
      ticket: jiraIssue,
    },
  });
});
