const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");

const jobRouter = require("./routes/jobRoutes");
const ruleRouter = require("./routes/ruleRoutes");
const demoRouter = require("./routes/demoRoutes");
const executionRouter = require("./routes/executionRoutes");
const errorHandler = require("./middleware/errorHandler");
const authRouter = require("./routes/authRoutes");
const eventRouter = require("./routes/eventRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const webhookRouter = require("./routes/webhookRoutes");
const healthRouter = require("./routes/healthRoutes");
const ticketRouter = require("./routes/ticketRoutes");

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/rules", ruleRouter);
app.use("/api/v1/demo", demoRouter);
app.use("/api/v1/executions", executionRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/webhooks", webhookRouter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/tickets", ticketRouter);

app.use((req, res, next) => {
  next(new AppError(`can not find the ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
