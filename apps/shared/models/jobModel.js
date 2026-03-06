// apps/shared/models/jobModel.js
module.exports = function createJobModel(mongoose) {
  const jobSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        enum: [
          "ADD_COMMENT",
          "TRANSITION_ISSUE",
          "ASSIGN_ISSUE",
          "UPDATE_FIELD",
        ],
      },
      lockedBy: String,
      lockedAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      issueKey: { type: String, required: true },
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
      status: {
        type: String,
        enum: ["queued", "processing", "succeeded", "failed"],
        default: "queued",
        index: true,
      },
      attempts: { type: Number, default: 0 },
      error: String,
    },
    { timestamps: true },
  );

  // Prevent OverwriteModelError on hot reload
  return mongoose.models.Job || mongoose.model("Job", jobSchema);
};
