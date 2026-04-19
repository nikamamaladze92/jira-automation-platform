const express = require("express");
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("admin"));

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEvent);

module.exports = router;
