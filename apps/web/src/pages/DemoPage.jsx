// trigger demo automation events from  UI, show matched rules and jobs results

import { useState } from "react";
import client from "../api/client";

const initialForm = {
  eventType: "issue_created",
  issueKey: "TEST-100",
  priority: "high",
  department: "warehouse",
};

function formatDepartment(value) {
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

function formatJobType(type) {
  switch (type) {
    case "ADD_COMMENT":
      return "Add Jira comment";
    case "SEND_EMAIL":
      return "Send manager email";
    default:
      return type;
  }
}

export default function DemoPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      setSubmitting(true);
      const res = await client.post("/demo/events", form);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to trigger simulation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Simulation</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Simulate an inbound ticket event to validate rule matching, job creation
        and worker execution
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "8px" }}>
            Trigger Simulation
          </h2>
          <p style={{ marginTop: 0, color: "#666", marginBottom: "16px" }}>
            Use controlled test values to run the automation pipeline without
            creating a real user ticket from the main workflow
          </p>

          <form
            onSubmit={handleTrigger}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Event Type
              </div>
              <select
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
              >
                <option value="issue_created">Issue created</option>
              </select>
            </div>

            <div>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Issue Key
              </div>
              <input
                name="issueKey"
                value={form.issueKey}
                onChange={handleChange}
              />
            </div>

            <div>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Priority
              </div>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Department
              </div>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="warehouse">Warehouse</option>
                <option value="mechanic">Mechanic</option>
                <option value="body_shop">Body Shop</option>
                <option value="painting">Painting</option>
                <option value="inspection">Inspection</option>
                <option value="customer_service">Customer Service</option>
              </select>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Running Simulation..." : "Run Simulation"}
            </button>
          </form>

          {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Simulation Result</h2>

          {!result ? (
            <p>No simulation has been run yet.</p>
          ) : (
            <div>
              <p style={{ margin: "6px 0" }}>
                <strong>Issue Key:</strong> {result.event?.issueKey || "-"}
              </p>
              <p style={{ margin: "6px 0" }}>
                <strong>Department:</strong>{" "}
                {formatDepartment(result.event?.department)}
              </p>
              <p style={{ margin: "6px 0" }}>
                <strong>Matched Rules:</strong>{" "}
                {result.matchedRules?.length || 0}
              </p>
              <p style={{ margin: "6px 0" }}>
                <strong>Triggered Actions:</strong> {result.jobs?.length || 0}
              </p>

              {result.matchedRules?.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Matched Rule Names:</strong>
                  <ul style={{ marginTop: "8px" }}>
                    {result.matchedRules.map((rule) => (
                      <li key={rule._id}>{rule.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.jobs?.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <strong>Triggered Action Types:</strong>
                  <ul style={{ marginTop: "8px" }}>
                    {result.jobs.map((job) => (
                      <li key={job._id || `${job.type}-${job.issueKey}`}>
                        {formatJobType(job.type)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
