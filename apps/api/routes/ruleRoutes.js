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

module.exports = router;
