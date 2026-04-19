const express = require("express");
const demoController = require("../controllers/demoController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post(
  "/events",
  authMiddleware.restrictTo("admin"),
  demoController.triggerDemoEvent,
);

module.exports = router;
