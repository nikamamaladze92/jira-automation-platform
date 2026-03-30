const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");

const Rule = createRuleModel(mongoose);

exports.createRule = async (req, res) => {
  try {
    const rule = await Rule.create(req.body);

    res.status(201).json({
      status: "success",
      data: { rule },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getRules = async (req, res) => {
  try {
    const rules = await Rule.find().sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: rules.length,
      data: { rules },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
