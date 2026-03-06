const express = require("express");
const jobController = require("../controllers/jobController");

const router = express.Router();

router.post("/", jobController.createJob);
router.get("/", jobController.getJobs);

module.exports = router;
