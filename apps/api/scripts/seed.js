require("dotenv").config();

// Safety guard.. never run seed in production
if (process.env.NODE_ENV === "production") {
  console.error("Seeding is disabled in production. Exiting.");
  process.exit(1);
}

const mongoose = require("mongoose");
const connectDB = require("../../shared/db/mongoose");
const createUserModel = require("../../shared/models/userModel");
const createRuleModel = require("../../shared/models/ruleModel");

const User = createUserModel(mongoose);
const Rule = createRuleModel(mongoose);

async function seed() {
  try {
    await connectDB();

    console.log("Clearing existing users and rules...");
    await User.deleteMany({});
    await Rule.deleteMany({});

    await User.create([
      {
        name: "Admin User",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
        active: true,
      },
      {
        name: "Manager User",
        // Replace with a real email address to receive manager notifications
        email: "nikamamaladze92@gmail.com",
        password: "password123",
        role: "manager",
        department: "mechanic",
        active: true,
      },
      {
        name: "Staff User",
        email: "staff@test.com",
        password: "password123",
        role: "staff",
        active: true,
      },
    ]);

    await Rule.create([
      {
        name: "Add comment for high priority mechanic tickets",
        trigger: "issue_created",
        conditions: [
          { field: "priority", operator: "equals", value: "high" },
          { field: "department", operator: "equals", value: "mechanic" },
        ],
        actions: [
          {
            type: "ADD_COMMENT",
            payload: {
              comment:
                "High priority mechanic ticket detected. Manager notification workflow has been triggered.",
            },
          },
        ],
        enabled: true,
      },
      {
        name: "Notify mechanic manager for high priority tickets",
        trigger: "issue_created",
        conditions: [
          { field: "priority", operator: "equals", value: "high" },
          { field: "department", operator: "equals", value: "mechanic" },
        ],
        actions: [
          {
            type: "SEND_EMAIL",
            payload: { department: "mechanic" },
          },
        ],
        enabled: true,
      },
    ]);

    console.log("Seed completed successfully.");
    console.log(
      "Note: Update manager@test.com to a real email to test email notifications.",
    );
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
