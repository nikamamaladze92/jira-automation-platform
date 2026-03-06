const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const executionRouter = require("./routes/executionRoutes");
const jobRouter = require("./routes/jobRoutes");

const app = express();

app.use(express.json());

app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/executions", executionRouter);

app.use(errorHandler);

module.exports = app;
