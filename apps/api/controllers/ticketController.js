const catchAsync = require("../utils/catchAsync");
const jiraTicketService = require("../services/jiraTicketService");

exports.createTicket = catchAsync(async (req, res) => {
  const jiraIssue = await jiraTicketService.createIssue({
    projectKey: "KAN",
    summary: req.body.summary,
    description: req.body.description,
    issueType: "Task",
    priority: req.body.priority,
  });

  res.status(201).json({
    status: "success",
    data: {
      ticket: jiraIssue,
    },
  });
});
