// module.exports = function createEventModel(mongoose) {
//   const eventSchema = new mongoose.Schema(
//     {
//       source: {
//         type: String,
//         required: true,
//         default: "demo",
//         enum: ["demo", "jira"],
//       },
//       eventType: {
//         type: String,
//         required: true,
//         index: true,
//       },
//       issueKey: {
//         type: String,
//         required: true,
//         index: true,
//       },
//       priority: String,
//       department: String,
//       payload: {
//         type: mongoose.Schema.Types.Mixed,
//         default: {},
//       },
//       processed: {
//         type: Boolean,
//         default: false,
//         index: true,
//       },
//     },
//     { timestamps: true },
//   );

//   return mongoose.models.Event || mongoose.model("Event", eventSchema);
// };

//
//
//

module.exports = function createEventModel(mongoose) {
  const eventSchema = new mongoose.Schema(
    {
      source: {
        type: String,
        required: true,
        enum: ["jira", "demo"],
      },
      eventType: {
        type: String,
        required: true,
        enum: ["issue_created", "issue_updated"],
      },
      issueKey: {
        type: String,
        required: true,
        index: true,
      },
      priority: {
        type: String,
      },
      department: {
        type: String,
      },
      payload: {
        type: Object,
      },
      processed: {
        type: Boolean,
        default: false,
      },
      eventFingerprint: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
    },
    { timestamps: true },
  );

  return mongoose.models.Event || mongoose.model("Event", eventSchema);
};
