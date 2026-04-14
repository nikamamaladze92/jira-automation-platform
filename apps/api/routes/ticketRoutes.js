// const express = require("express");
// const { body } = require("express-validator");

// const ticketController = require("../controllers/ticketController");
// const authMiddleware = require("../middleware/authMiddleware");
// const validate = require("../middleware/validate");

// const router = express.Router();

// router.use(authMiddleware.protect);

// router.post(
//   "/",
//   [
//     body("summary").trim().notEmpty().withMessage("Summary is required"),
//     body("description")
//       .trim()
//       .notEmpty()
//       .withMessage("Description is required"),
//     body("priority")
//       .trim()
//       .notEmpty()
//       .withMessage("Priority is required")
//       .isIn(["Highest", "High", "Medium", "Low", "Lowest"])
//       .withMessage("Priority must be Highest, High, Medium, Low, or Lowest"),
//   ],
//   validate,
//   ticketController.createTicket,
// );

// module.exports = router;

//
//
//

const express = require("express");
const { body } = require("express-validator");

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware.protect);

router.post(
  "/",
  [
    body("summary").trim().notEmpty().withMessage("Summary is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("priority")
      .trim()
      .notEmpty()
      .withMessage("Priority is required")
      .isIn(["Highest", "High", "Medium", "Low", "Lowest"])
      .withMessage("Priority must be Highest, High, Medium, Low, or Lowest"),
    body("department")
      .trim()
      .notEmpty()
      .withMessage("Department is required")
      .isIn([
        "warehouse",
        "mechanic",
        "body_shop",
        "painting",
        "inspection",
        "customer_service",
      ])
      .withMessage("Department is invalid"),
  ],
  validate,
  ticketController.createTicket,
);

module.exports = router;
