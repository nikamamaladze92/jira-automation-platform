import { useState } from "react";
import client from "../api/client";
import { formatDepartment, formatJobType } from "../styles/tokens";

const departmentOptions = [
  "warehouse",
  "mechanic",
  "body_shop",
  "painting",
  "inspection",
  "customer_service",
];

const initialForm = {
  eventType: "issue_created",
  issueKey: "TEST-100",
  priority: "high",
  department: "mechanic",
};

// Sub components

function SimulationResult({ result }) {
  const matchedRules = result.matchedRules || [];
  const jobs = result.jobs || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <div
          style={{
            flex: 1,
            padding: "14px",
            background: matchedRules.length > 0 ? "#f0faf0" : "#f5f5f5",
            border: `1px solid ${matchedRules.length > 0 ? "#b8e0b8" : "#e5e5e5"}`,
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "24px",
              fontWeight: 700,
              color: matchedRules.length > 0 ? "#2d7a2d" : "#999",
            }}
          >
            {matchedRules.length}
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Rules matched
          </p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "14px",
            background: jobs.length > 0 ? "#f0f6ff" : "#f5f5f5",
            border: `1px solid ${jobs.length > 0 ? "#ccdeff" : "#e5e5e5"}`,
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "24px",
              fontWeight: 700,
              color: jobs.length > 0 ? "#1a5fbf" : "#999",
            }}
          >
            {jobs.length}
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Jobs created
          </p>
        </div>
      </div>

      <div
        style={{
          padding: "14px",
          background: "#fafafa",
          border: "1px solid #eee",
          borderRadius: "10px",
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 600 }}>
          Event
        </p>
        <p style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}>
          · Issue key: <strong>{result.event?.issueKey || "—"}</strong>
        </p>
        <p style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}>
          · Department:{" "}
          <strong>{formatDepartment(result.event?.department)}</strong>
        </p>
      </div>

      {matchedRules.length > 0 && (
        <div
          style={{
            padding: "14px",
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 600 }}>
            Matched Rules
          </p>
          {matchedRules.map((rule) => (
            <p
              key={rule._id}
              style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}
            >
              · {rule.name}
            </p>
          ))}
        </div>
      )}

      {jobs.length > 0 && (
        <div
          style={{
            padding: "14px",
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 600 }}>
            Triggered Actions
          </p>
          {jobs.map((job) => (
            <p
              key={job._id || `${job.type}-${job.issueKey}`}
              style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}
            >
              · {formatJobType(job.type)}
            </p>
          ))}
        </div>
      )}

      {matchedRules.length === 0 && (
        <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>
          No rules matched this simulation. Check your active rules
          configuration.
        </p>
      )}
    </div>
  );
}

//  Main Component

export default function DemoPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear previous result when form changes so user sees fresh results
    setResult(null);
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      setSubmitting(true);
      // Use a unique issue key each time to bypass event deduplication
      const uniqueForm = {
        ...form,
        issueKey: `DEMO-${Date.now()}`,
      };
      const res = await client.post("/demo/events", uniqueForm);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to trigger simulation.");
    } finally {
      setSubmitting(false);
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
      <h1 style={{ marginBottom: "8px" }}>Simulation</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Simulate an inbound ticket event to validate rule matching and job
        creation — without creating a real Jira ticket.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Form */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "4px", fontSize: "16px" }}>
            Trigger Simulation
          </h2>
          <p
            style={{
              marginTop: 0,
              color: "#666",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            Run the automation pipeline without creating a real Jira ticket.
          </p>

          <form
            onSubmit={handleTrigger}
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
                Event Type
              </div>
              <select
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="issue_created">Issue created</option>
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
                Priority
              </div>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
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
                style={inputStyle}
              >
                {departmentOptions.map((d) => (
                  <option key={d} value={d}>
                    {formatDepartment(d)}
                  </option>
                ))}
              </select>
            </div>

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
                marginTop: "4px",
              }}
            >
              {submitting ? "Running…" : "Run Simulation"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "14px",
                background: "#fff5f5",
                border: "1px solid #f3c2c2",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#c0392b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
            Simulation Result
          </h2>
          {result ? (
            <SimulationResult result={result} />
          ) : (
            <p style={{ color: "#999", fontSize: "14px" }}>
              Run a simulation to see rule matching and job creation results
              here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
