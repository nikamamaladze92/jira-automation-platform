module.exports = function createJobModel(mongoose) {
  // Return cached model if already registered to avoid re-registration errors
  if (mongoose.models.Job) {
    return mongoose.models.Job;
  }

  const jobSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        enum: ["ADD_COMMENT", "SEND_EMAIL"],
      },
      lockedBy: String,
      lockedAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
      issueKey: {
        type: String,
        required: true,
        index: true,
      },
      department: {
        type: String,
        enum: [
          "mechanic",
          "body_shop",
          "painting",
          "warehouse",
          "inspection",
          "customer_service",
        ],
      },
      payload: Object,
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        index: true,
      },
      ruleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rule",
        index: true,
      },
      actionIndex: {
        type: Number,
      },
      dedupeKey: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
      },
      status: {
        type: String,
        enum: ["queued", "processing", "succeeded", "failed"],
        default: "queued",
        index: true,
      },
      error: String,
    },
    { timestamps: true },
  );

  return mongoose.model("Job", jobSchema);
};
