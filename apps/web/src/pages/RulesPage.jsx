import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const priorityOptions = ["high", "medium", "low"];

const departmentOptions = [
  "warehouse",
  "mechanic",
  "body_shop",
  "painting",
  "inspection",
  "customer_service",
];

const initialForm = {
  name: "",
  priority: "",
  department: "",
  comment: "",
  actionType: "ADD_COMMENT",
};

function formatConditionField(field) {
  switch (field) {
    case "priority":
      return "Priority";
    case "department":
      return "Department";
    case "eventType":
      return "Event type";
    default:
      return field;
  }
}

function formatConditionOperator(operator) {
  switch (operator) {
    case "equals":
      return "is";
    default:
      return operator;
  }
}

function formatConditionValue(field, value) {
  if (field === "priority") {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  if (field === "department") {
    switch (value) {
      case "warehouse":
        return "Warehouse";
      case "mechanic":
        return "Mechanic";
      case "body_shop":
        return "Body Shop";
      case "painting":
        return "Painting";
      case "inspection":
        return "Inspection";
      case "customer_service":
        return "Customer Service";
      default:
        return value;
    }
  }
  return value;
}
function getActionLabel(type) {
  switch (type) {
    case "ADD_COMMENT":
      return "Add Jira comment";
    case "SEND_EMAIL":
      return "Send manager email";
    default:
      return type;
  }
}

function getActionSummary(action) {
  switch (action.type) {
    case "ADD_COMMENT":
      return action.payload?.comment
        ? `Comment text: ${action.payload.comment}`
        : "Comment text not provided";
    case "SEND_EMAIL":
      return "Send the email notification to the department manager";
    default:
      return "Action details unavailable";
  }
}

function formatTrigger(trigger) {
  switch (trigger) {
    case "issue_created":
      return "Issue created";
    default:
      return trigger;
  }
}

export default function RulesPage() {
  const { user } = useAuth();

  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canManageRules = user?.role === "admin" || user?.role === "manager";

  const loadRules = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await client.get("/rules");
      setRules(res.data.data.rules);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setError("");
    if (form.actionType === "ADD_COMMENT" && !form.comment.trim()) {
      setError("Jira comment is required for comment actions");
      return;
    }

    if (form.actionType === "SEND_EMAIL" && !form.department) {
      setError("Department is required for manager email actions");
      return;
    }
    const action =
      form.actionType === "SEND_EMAIL"
        ? {
            type: "SEND_EMAIL",
            payload: {
              department: form.department,
            },
          }
        : {
            type: "ADD_COMMENT",
            payload: {
              comment: form.comment.trim(),
            },
          };
    try {
      setSubmitting(true);

      await client.post("/rules", {
        name: form.name.trim(),
        trigger: "issue_created",
        conditions: [
          {
            field: "priority",
            operator: "equals",
            value: form.priority,
          },
          {
            field: "department",
            operator: "equals",
            value: form.department,
          },
        ],
        actions: [action],
        enabled: true,
      });

      setForm(initialForm);
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create rule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      setError("");
      await client.patch(`/rules/${rule._id}`, {
        enabled: !rule.enabled,
      });
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update rule");
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      setError("");
      await client.delete(`/rules/${id}`);
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete rule");
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Automation Rules</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Configure rule based actions that run automatically after ticket events
        enter the platform
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: canManageRules ? "1fr 1.4fr" : "1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {canManageRules && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Create Rule</h2>
            <p style={{ marginTop: 0, color: "#666", marginBottom: "16px" }}>
              Define when automation should run and what action should be
              triggered
            </p>
            <form
              onSubmit={handleCreateRule}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Rule Name
                </div>
                <input
                  name="name"
                  placeholder=""
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Priority
                </div>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select priority</option>
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Department
                </div>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {formatConditionValue("department", department)}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Action Type
                </div>
                <select
                  name="actionType"
                  value={form.actionType}
                  onChange={handleChange}
                >
                  <option value="ADD_COMMENT">Add Jira comment</option>
                  <option value="SEND_EMAIL">Send manager email</option>
                </select>
              </div>
              {form.actionType === "ADD_COMMENT" && (
                <label>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                    Jira Comment
                  </div>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add a comment that will be posted to the Jira issue"
                  />
                </label>
              )}
              <button type="submit" disabled={submitting}>
                {submitting ? "Creating Rule" : "Create Rule"}
              </button>
            </form>
            {error && (
              <p style={{ color: "red", marginTop: "12px" }}>{error}</p>
            )}
          </div>
        )}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Current Rules</h2>

          {loading ? (
            <p>Loading rules</p>
          ) : rules.length === 0 ? (
            <p>No rules found</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {rules.map((rule) => (
                <div
                  key={rule._id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "14px",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
                    {rule.name}
                  </h3>

                  <p style={{ margin: "6px 0" }}>
                    <strong>Trigger:</strong> {formatTrigger(rule.trigger)}
                  </p>

                  <p style={{ margin: "6px 0" }}>
                    <strong>Status:</strong>{" "}
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </p>

                  <div style={{ marginTop: "10px" }}>
                    <strong>Conditions:</strong>
                    {rule.conditions?.length ? (
                      <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                        {rule.conditions.map((condition, index) => (
                          <li key={`${condition.field}-${index}`}>
                            {formatConditionField(condition.field)}{" "}
                            {formatConditionOperator(condition.operator)}{" "}
                            {formatConditionValue(
                              condition.field,
                              condition.value,
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: "6px 0" }}>No conditions</p>
                    )}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <strong>Actions:</strong>
                    {rule.actions?.length ? (
                      <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                        {rule.actions.map((action, index) => (
                          <li key={`${action.type}: ${index}`}>
                            {getActionLabel(action.type)}:{" "}
                            {getActionSummary(action)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: "6px 0" }}>No actions</p>
                    )}
                  </div>
                  {canManageRules && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "12px",
                      }}
                    >
                      <button onClick={() => handleToggleRule(rule)}>
                        {rule.enabled ? "Disable Rule" : "Enable Rule"}
                      </button>
                      <button onClick={() => handleDeleteRule(rule._id)}>
                        Delete Rule
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
