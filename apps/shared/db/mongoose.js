require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_ATLAS);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error");
    process.exit(1);
  }
};

module.exports = connectDB;
