const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }
  next();
};

// const { body } = require("express-validator");

// exports.createTicketValidation = [
//   body("summary").trim().notEmpty().withMessage("Summary is required"),
//   body("description").trim().notEmpty().withMessage("Description is required"),
//   body("priority")
//     .trim()
//     .notEmpty()
//     .withMessage("Priority is required")
//     .isIn(["high", "medium", "low"])
//     .withMessage("Priority must be high, medium, or low"),
//   body("department")
//     .trim()
//     .notEmpty()
//     .withMessage("Department is required")
//     .isIn([
//       "warehouse",
//       "mechanic",
//       "body_shop",
//       "painting",
//       "inspection",
//       "customer_service",
//     ])
//     .withMessage("Department is invalid"),
// ];
