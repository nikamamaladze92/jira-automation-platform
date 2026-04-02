const mongoose = require("mongoose");
const createExecutionModel = require("../../shared/models/execution");

const Execution = createExecutionModel(mongoose);

// Get latest executions
exports.getExecutions = async (req, res, next) => {
  try {
    const executions = await Execution.find().sort({ startedAt: -1 }).limit(50);

    res.status(200).json({
      status: "success",
      results: executions.length,
      data: executions,
    });
  } catch (err) {
    next(err);
  }
};

// Get one execution by id
exports.getExecution = async (req, res, next) => {
  try {
    const execution = await Execution.findById(req.params.id);

    if (!execution) {
      return res.status(404).json({
        status: "fail",
        message: "No execution found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        execution,
      },
    });
  } catch (err) {
    next(err);
  }
};
