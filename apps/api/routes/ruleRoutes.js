const express = require("express");
const ruleController = require("../controllers/ruleController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route("/")
  .get(ruleController.getRules)
  .post(
    authMiddleware.restrictTo("admin", "manager"),
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
