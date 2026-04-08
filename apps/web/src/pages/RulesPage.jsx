// list automation rules, create new rule, sofr delte, restrict admin actions in ui

import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  trigger: "issue_created",
  priority: "high",
  department: "warehouse",
  comment: "",
};

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
      const res = await client.get("/rules");
      setRules(res.data.data.rules);
    } catch (err) {
      setError(err.response?.data?.message || "failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      await client.post("/rules", {
        name: form.name,
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
            type: "ADD_COMMENT",
            payload: {
              comment: form.comment,
            },
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
      await client.delete(`/rules/${id}`);
      await loadRules();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete rule");
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Rules</h1>

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
            <h2>Create Rule</h2>
            <form
              onSubmit={handleCreateRule}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                name="name"
                placeholder="Rule name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                name="trigger"
                value={form.trigger}
                onChange={handleChange}
              />
              <input
                name="priority"
                placeholder="Priority"
                value={form.priority}
                onChange={handleChange}
              />
              <input
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
              />
              <textarea
                name="comment"
                placeholder="Comment to add"
                value={form.comment}
                onChange={handleChange}
                rows={4}
              />
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
          <h2>Existing Rules</h2>
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
                  <h3 style={{ marginTop: 0 }}>{rule.name}</h3>
                  <p style={{ margin: "6px 0" }}>
                    <strong>Trigger:</strong> {rule.trigger}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <strong>Status:</strong>{" "}
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </p>
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
