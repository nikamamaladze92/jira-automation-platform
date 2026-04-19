require("dotenv").config();
//const mongoose = require("mongoose");

const requiredEnvVars = ["JWT_SECRET", "JIRA_PROJECT_KEY"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const connectDB = require("../shared/db/mongoose");

connectDB();

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");

// const DB =
//   process.env.NODE_ENV === "production"
//     ? process.env.DATABASE_ATLAS
//     : process.env.DATABASE_LOCAL;

// mongoose.connect(DB).then(() => {
//   console.log("connected");
// });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Error! Shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
