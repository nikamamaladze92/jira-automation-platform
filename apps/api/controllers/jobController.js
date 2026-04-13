const catchAsync = require("../utils/catchAsync");

const mongoose = require("mongoose");
const createJobModel = require("../../shared/models/jobModel");

const Job = createJobModel(mongoose);

// create new job
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        job,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getJobs = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.issueKey) {
    filter.issueKey = req.query.issueKey.trim();
  }

  const limit = Number(req.query.limit) || 50;

  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(limit);

  res.status(200).json({
    status: "success",
    results: jobs.length,
    data: {
      jobs,
    },
  });
});
