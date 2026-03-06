const mongoose = require("mongoose");
const createJobModel = require("../../shared/models/jobModel");
const Job = createJobModel(mongoose);

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      type: req.body.type,
      issueKey: req.body.issueKey,
      department: req.body.department,
      payload: req.body.payload,
      status: "queued",
    });

    res.status(201).json({
      status: "success",
      data: {
        job,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getJobs = async (req, res) => {
  const jobs = await Job.find().sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: jobs.length,
    data: {
      jobs,
    },
  });
};
