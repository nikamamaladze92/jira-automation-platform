//  create manual jobs
//  list jobs for dashboard/admin view
//  allow filtering by status and limiting result size

const mongoose = require("mongoose");
const createJobModel = require("../../shared/models/jobModel");

const Job = createJobModel(mongoose);

// Create a new job manually.
// This is useful for testing the worker directly.
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

exports.getJobs = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
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
  } catch (err) {
    next(err);
  }
};
