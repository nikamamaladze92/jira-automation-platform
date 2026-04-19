require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbUri = process.env.DATABASE_ATLAS;

    if (!dbUri) {
      throw new Error("DATABASE_ATLAS  must be defined");
    }

    await mongoose.connect(dbUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
