import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  formatDepartment,
  formatTrigger,
  formatJobType,
} from "../styles/tokens";

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

// helpers

function formatConditionValue(field, value) {
  if (field === "priority")
    return value.charAt(0).toUpperCase() + value.slice(1);
  if (field === "department") return formatDepartment(value);
  return value;
}

function formatConditionField(field) {
  const map = {
    priority: "Priority",
    department: "Department",
    eventType: "Event type",
  };
  return map[field] ?? field;
}

function getActionSummary(action) {
  if (action.type === "ADD_COMMENT")
    return action.payload?.comment
      ? `"${action.payload.comment}"`
      : "Comment text not provided";
  if (action.type === "SEND_EMAIL")
    return "Send email notification to department manager";
  return "Action details unavailable";
}

//  Subcomponents

function SkeletonRow() {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      {[60, 40, 50].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}%`,
            height: "13px",
            background: "#f0f0f0",
            borderRadius: "6px",
            marginBottom: i < 2 ? "8px" : 0,
          }}
        />
      ))}
    </div>
  );
}

function RuleCard({ rule, canManage, onToggle, onDelete }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "15px" }}>{rule.name}</h3>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "20px",
            background: rule.enabled ? "#f0faf0" : "#f5f5f5",
            color: rule.enabled ? "#2d7a2d" : "#999",
            border: `1px solid ${rule.enabled ? "#b8e0b8" : "#e5e5e5"}`,
          }}
        >
          {rule.enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#666" }}>
        Trigger: {formatTrigger(rule.trigger)}
      </p>

      {rule.conditions?.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600 }}>
            Conditions
          </p>
          {rule.conditions.map((c, i) => (
            <p
              key={i}
              style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}
            >
              · {formatConditionField(c.field)} is{" "}
              {formatConditionValue(c.field, c.value)}
            </p>
          ))}
        </div>
      )}

      {rule.actions?.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600 }}>
            Actions
          </p>
          {rule.actions.map((a, i) => (
            <p
              key={i}
              style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}
            >
              · {formatJobType(a.type)}: {getActionSummary(a)}
            </p>
          ))}
        </div>
      )}

      {canManage && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onToggle(rule)}
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              borderRadius: "6px",
              cursor: "pointer",
              border: "1px solid #e5e5e5",
              background: "#fff",
            }}
          >
            {rule.enabled ? "Disable" : "Enable"}
          </button>
          <button
            onClick={() => onDelete(rule._id)}
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              borderRadius: "6px",
              cursor: "pointer",
              border: "1px solid #f3c2c2",
              background: "#fff5f5",
              color: "#c0392b",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

//  main Component

export default function RulesPage() {
  const { user } = useAuth();

  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "manager";

  const loadRules = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await client.get("/rules");
      setRules(res.data.data.rules);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.actionType === "ADD_COMMENT" && !form.comment.trim()) {
      setError("Jira comment is required for comment actions.");
      return;
    }
    if (form.actionType === "SEND_EMAIL" && !form.department) {
      setError("Department is required for manager email actions.");
      return;
    }

    const action =
      form.actionType === "SEND_EMAIL"
        ? { type: "SEND_EMAIL", payload: { department: form.department } }
        : { type: "ADD_COMMENT", payload: { comment: form.comment.trim() } };

    try {
      setSubmitting(true);
      await client.post("/rules", {
        name: form.name.trim(),
        trigger: "issue_created",
        conditions: [
          { field: "priority", operator: "equals", value: form.priority },
          { field: "department", operator: "equals", value: form.department },
        ],
        actions: [action],
        enabled: true,
      });
      setForm(initialForm);
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create rule.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (rule) => {
    try {
      setError("");
      await client.patch(`/rules/${rule._id}`, { enabled: !rule.enabled });
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update rule.");
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await client.delete(`/rules/${id}`);
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete rule.");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    boxSizing: "border-box",
    background: "#fff",
  };

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Automation Rules</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Configure rule-based actions that run automatically after ticket events
        enter the platform.
      </p>

      {error && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #f3c2c2",
            borderRadius: "8px",
            padding: "12px 14px",
            color: "#c0392b",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: canManage ? "1fr 1.4fr" : "1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Create Rule form */}
        {canManage && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "4px", fontSize: "16px" }}>
              Create Rule
            </h2>
            <p
              style={{
                marginTop: 0,
                color: "#666",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              Define when automation should run and what action should be
              triggered.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <div
                  style={{
                    marginBottom: "6px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Rule Name
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="e.g. High priority mechanic alert"
                />
              </div>

              <div>
                <div
                  style={{
                    marginBottom: "6px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Priority
                </div>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select priority</option>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div
                  style={{
                    marginBottom: "6px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Department
                </div>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>
                      {formatDepartment(d)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div
                  style={{
                    marginBottom: "6px",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Action Type
                </div>
                <select
                  name="actionType"
                  value={form.actionType}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="ADD_COMMENT">Add Jira comment</option>
                  <option value="SEND_EMAIL">Send manager email</option>
                </select>
              </div>

              {form.actionType === "ADD_COMMENT" && (
                <div>
                  <div
                    style={{
                      marginBottom: "6px",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    Jira Comment
                  </div>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Comment that will be posted to the Jira issue"
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Creating…" : "Create Rule"}
              </button>
            </form>
          </div>
        )}

        {/* Rules list */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
            Current Rules{" "}
            {!loading && (
              <span
                style={{ fontWeight: 400, color: "#999", fontSize: "14px" }}
              >
                ({rules.length})
              </span>
            )}
          </h2>

          {loading ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[...Array(3)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>
              No rules found. Create one to get started.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {rules.map((rule) => (
                <RuleCard
                  key={rule._id}
                  rule={rule}
                  canManage={canManage}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
