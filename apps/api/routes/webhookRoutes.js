const express = require("express");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

router.post("/jira", webhookController.handleJiraWebhook);

module.exports = router;
