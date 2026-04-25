module.exports = function createRuleModel(mongoose) {
  const conditionSchema = new mongoose.Schema(
    {
      field: {
        type: String,
        required: true,
        enum: ["priority", "department", "eventType"],
      },
      operator: {
        type: String,
        required: true,
        enum: ["equals"],
      },
      value: {
        type: String,
        required: true,
      },
    },
    { _id: false },
  );

  const actionSchema = new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        enum: ["ADD_COMMENT", "SEND_EMAIL"],
      },
      payload: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    { _id: false },
  );

  const ruleSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      trigger: {
        type: String,
        required: true,
        enum: ["issue_created"],
        index: true,
      },
      conditions: {
        type: [conditionSchema],
        default: [],
      },
      actions: {
        type: [actionSchema],
        validate: [(v) => v.length > 0, "Rule must have at least one action"],
      },
      enabled: {
        type: Boolean,
        default: true,
        index: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
    },
    { timestamps: true },
  );

  //PREVENT OLDER SCHEMA ERROR IN MEMORY
  if (mongoose.models.Rule) {
    delete mongoose.models.Rule;
  }
  return mongoose.model("Rule", ruleSchema);
};
