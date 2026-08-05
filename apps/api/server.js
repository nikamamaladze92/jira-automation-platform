require("dotenv").config();

const requiredEnvVars = ["JWT_SECRET", "JIRA_PROJECT_KEY", "DATABASE_ATLAS"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = require("./app");
const connectDB = require("../shared/db/mongoose");

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled rejection — shutting down:", err.message);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception — shutting down:", err.message);
  process.exit(1);
});

startServer();
