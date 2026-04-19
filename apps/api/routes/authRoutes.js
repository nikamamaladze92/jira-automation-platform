const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/signup",

  // validation
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  validate,
  authController.signup,
);
router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
  authController.login,
);
router.get("/me", authMiddleware.protect, authController.getMe);

router.get(
  "/users",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  authController.getUsers,
);

router.patch(
  "/users/:id/role",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  authController.updateUserRole,
);

router.patch(
  "/users/:id/active",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  authController.updateUserActive,
);

module.exports = router;
