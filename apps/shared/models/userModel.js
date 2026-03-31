module.exports = function createUserModel(mongoose) {
  const validator = require("validator");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");

  const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "User must have a name"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "User must have an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
      },
      role: {
        type: String,
        enum: ["admin", "manager", "staff"],
        default: "staff",
      },
      password: {
        type: String,
        required: [true, "User must have a password"],
        minlength: 8,
        select: false,
      },
    },
    { timestamps: true },
  );

  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });

  userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword,
  ) {
    return bcrypt.compare(candidatePassword, userPassword);
  };

  userSchema.methods.signToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  };

  return mongoose.models.User || mongoose.model("User", userSchema);
};
