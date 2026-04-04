const express = require("express");
const { body } = require("express-validator");

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware.protect);

router.post(
  "/",
  body("projectKey").notEmpty().withMessage("Project key is required"),
  body("summary").notEmpty().withMessage("Summary is required"),
  body("description").notEmpty().withMessage("Description is required"),

  validate,
  ticketController.createTicket,
);

module.exports = router;
