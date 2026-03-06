const express = require("express");
const executionController = require("../controllers/executionController");

const router = express.Router();

router.get("/", executionController.getExecutions);

module.exports = router;
