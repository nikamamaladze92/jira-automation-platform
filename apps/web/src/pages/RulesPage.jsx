import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const triggerOptions = [{ value: "issue_created", label: "Issue Created" }];

const priorityOptions = ["high", "medium", "low"];

const departmentOptions = [
  "warehouse",
  "mechanic",
  "body_shop",
  "painting",
  "inspection",
  "customer_service",
];

const actionOptions = [
  { value: "ADD_COMMENT", label: "Add Comment" },
  { value: "ASSIGN_ISSUE", label: "Assign Issue" },
];

const initialForm = {
  name: "",
  trigger: "issue_created",
  priority: "high",
  department: "warehouse",
  actionType: "ADD_COMMENT",
  comment: "",
  accountId: "",
};

function buildActionPayload(form) {
  switch (form.actionType) {
    case "ADD_COMMENT":
      return {
        comment: form.comment,
      };

    case "ASSIGN_ISSUE":
      return {
        accountId: form.accountId,
      };

    default:
      return {};
  }
}

function getActionSummary(action) {
  switch (action.type) {
    case "ADD_COMMENT":
      return `Comment: ${action.payload?.comment || "-"}`;
    case "ASSIGN_ISSUE":
      return `Account ID: ${action.payload?.accountId || "-"}`;
    default:
      return "Unknown action";
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

  const actionHelpText = useMemo(() => {
    switch (form.actionType) {
      case "ADD_COMMENT":
        return "Adds a Jira comment to the matched issue. Use this for team coordination, notes, or audit trail messages.";
      case "ASSIGN_ISSUE":
        return "Assigns the matched issue to a specific Jira user by account ID. Use this for routing work to the correct owner.";
      default:
        return "";
    }
  }, [form.actionType]);

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

    try {
      setSubmitting(true);

      const actionPayload = buildActionPayload(form);

      await client.post("/rules", {
        name: form.name.trim(),
        trigger: form.trigger,
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
        actions: [
          {
            type: form.actionType,
            payload: actionPayload,
          },
        ],
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
        Rules define when the system should react to an event and what action it
        should perform on the matched Jira issue.
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
                  placeholder="High priority warehouse routing"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Trigger
                </div>
                <select
                  name="trigger"
                  value={form.trigger}
                  onChange={handleChange}
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Priority Condition
                </div>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Department Condition
                </div>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                  Action Type
                </div>
                <select
                  name="actionType"
                  value={form.actionType}
                  onChange={handleChange}
                >
                  {actionOptions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </label>

              <p
                style={{
                  margin: 0,
                  color: "#666",
                  fontSize: "14px",
                  background: "#f8f8f8",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                {actionHelpText}
              </p>

              {form.actionType === "ADD_COMMENT" && (
                <label>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                    Comment
                  </div>
                  <textarea
                    name="comment"
                    placeholder="Warehouse manager has been notified."
                    value={form.comment}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </label>
              )}

              {form.actionType === "ASSIGN_ISSUE" && (
                <label>
                  <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                    Jira Account ID
                  </div>
                  <input
                    name="accountId"
                    placeholder="5b10a2844c20165700ede21g"
                    value={form.accountId}
                    onChange={handleChange}
                    required
                  />
                </label>
              )}

              <button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Rule"}
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
          <h2 style={{ marginTop: 0 }}>Existing Rules</h2>

          {loading ? (
            <p>Loading rules...</p>
          ) : rules.length === 0 ? (
            <p>No rules found.</p>
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
                    <strong>Trigger:</strong> {rule.trigger}
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
                            {condition.field} {condition.operator}{" "}
                            {condition.value}
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
                          <li key={`${action.type}-${index}`}>
                            {action.type} — {getActionSummary(action)}
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
                        {rule.enabled ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleDeleteRule(rule._id)}>
                        Delete
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
