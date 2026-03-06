const mongoose = require("mongoose");
const createExecutionModel = require("../../shared/models/Execution");

const Execution = createExecutionModel(mongoose);

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
