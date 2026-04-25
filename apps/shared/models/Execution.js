module.exports = function createExecutionModel(mongoose) {
  const executionSchema = new mongoose.Schema(
    {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
      },
      issueKey: {
        type: String,
        required: true,
        index: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["ADD_COMMENT", "SEND_EMAIL"],
      },
      status: {
        type: String,
        required: true,
        enum: ["running", "succeeded", "failed"],
        default: "running",
        index: true,
      },
      workerId: {
        type: String,
        required: true,
      },
      startedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
      finishedAt: Date,
      durationMs: Number,
      error: String,
      result: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true },
  );

  return (
    mongoose.models.Execution || mongoose.model("Execution", executionSchema)
  );
};
