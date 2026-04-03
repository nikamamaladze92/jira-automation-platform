const express = require("express");
const { body } = require("express-validator");
const ruleController = require("../controllers/ruleController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route("/")
  .get(ruleController.getRules)
  .post(
    authMiddleware.restrictTo("admin", "manager"),
    body("name").notEmpty().withMessage("Rule name is required"),
    body("trigger").notEmpty().withMessage("Trigger is required"),
    body("actions")
      .isArray({ min: 1 })
      .withMessage("At least one action is required"),

    validate,
    ruleController.createRule,
  );
router
  .route("/:id")
  .get(ruleController.getRule)
  .patch(
    authMiddleware.restrictTo("admin", "manager"),
    ruleController.updateRule,
  )
  .delete(
    authMiddleware.restrictTo("admin", "manager"),
    ruleController.deleteRule,
  );

module.exports = router;
