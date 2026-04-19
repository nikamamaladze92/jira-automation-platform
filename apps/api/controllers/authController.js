const mongoose = require("mongoose");
const createUserModel = require("../models/userModel");

const User = createUserModel(mongoose);

const signTokenResponse = (user, statusCode, res) => {
  const token = user.signToken();

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: "staff",
    });

    signTokenResponse(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    signTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      data: {
        user: req.user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// for admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("+active");

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

//only admin can change role
exports.updateUserRole = async (req, res, next) => {
  try {
    const allowedRoles = ["admin", "manager", "staff"];

    if (!allowedRoles.includes(req.body.role)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid role value",
      });
    }

    if (req.user.id === req.params.id && req.body.role !== "admin") {
      return res.status(400).json({
        status: "fail",
        message: "Admins can't remove their own admin role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// admin updates active of user
exports.updateUserActive = async (req, res, next) => {
  try {
    if (typeof req.body.active !== "boolean") {
      return res.status(400).json({
        status: "fail",
        message: "Active must be true or false",
      });
    }
    if (req.user.id === req.params.id && req.body.active === false) {
      return res.status(400).json({
        status: "fail",
        message: "Admins can't deactivate their own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: req.body.active },
      {
        new: true,
        runValidators: true,
      },
    ).select("+active");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};
