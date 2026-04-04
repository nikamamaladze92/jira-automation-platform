const mongoose = require("mongoose");
const createRuleModel = require("../../shared/models/ruleModel");

const Rule = createRuleModel(mongoose);

// create a new automation rule
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

// get all non deleted rules
exports.getRules = async (req, res, next) => {
  try {
    const rules = await Rule.find({ isDeleted: false }).sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: rules.length,
      data: { rules },
    });
  } catch (err) {
    next(err);
  }
};

// get one non deleted rule by id
exports.getRule = async (req, res, next) => {
  try {
    const rule = await Rule.findOne({
      _id: req.params.id,
      isDeleted: false,
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

// update one not deleted rule
exports.updateRule = async (req, res, next) => {
  try {
    const rule = await Rule.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

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

// soft delete rule  mark it as deleted (hide)
exports.deleteRule = async (req, res, next) => {
  try {
    const rule = await Rule.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        isDeleted: true,
        enabled: false,
      },
      {
        returnDocument: "after",
      },
    );

    if (!rule) {
      return res.status(404).json({
        status: "fail",
        message: "No rule found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Rule soft deleted successfully",
      data: { rule },
    });
  } catch (err) {
    next(err);
  }
};
