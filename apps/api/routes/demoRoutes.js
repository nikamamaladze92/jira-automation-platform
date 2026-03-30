const express = require("express");
const demoController = require("../controllers/demoController");

const router = express.Router();

router.post("/events", demoController.triggerDemoEvent);

module.exports = router;
