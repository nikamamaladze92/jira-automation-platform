const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");

const Rule = createRuleModel(mongoose);

// Create a new automation rule
exports.createRule = async (req, res, next) => {
  try {
    const rule = await Rule.create(req.body);

    res.status(201).json({
      status: "success",
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
};

// Get all automation rules
exports.getRules = async (req, res, next) => {
  try {
    const rules = await Rule.find().sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: rules.length,
      data: { rules },
    });
  } catch (err) {
    next(err);
  }
};

// Get one rule by id
exports.getRule = async (req, res, next) => {
  try {
    const rule = await Rule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        status: "fail",
        message: "No rule found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
};

// Update an existing rule
exports.updateRule = async (req, res, next) => {
  try {
    const rule = await Rule.findOneAndUpdate({ _id: req.params.id }, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!rule) {
      return res.status(404).json({
        status: "fail",
        message: "No rule found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
};

// Delete a rule
exports.deleteRule = async (req, res, next) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        status: "fail",
        message: "No rule found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
