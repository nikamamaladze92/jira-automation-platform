const express = require("express");
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route("/")
  .get(authMiddleware.restrictTo("admin"), jobController.getJobs)
  .post(authMiddleware.restrictTo("admin"), jobController.createJob);

module.exports = router;
