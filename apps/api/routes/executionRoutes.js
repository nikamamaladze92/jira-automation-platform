const express = require("express");
const executionController = require("../controllers/executionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/", executionController.getExecutions);
router.get("/:id", executionController.getExecution);

module.exports = router;
