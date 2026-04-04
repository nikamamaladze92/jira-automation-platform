const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const mongoose = require("mongoose");
const createUserModel = require("../../shared/models/userModel");

const User = createUserModel(mongoose);
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    //console.log("AUTH HEADER:", req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select("+active");

    if (!currentUser || currentUser.active === false) {
      return res.status(401).json({
        status: "fail",
        message: "User is inactive or does not exist",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
