import { useState, useEffect } from "react";
import client from "../api/client";
import {
  formatDepartment,
  formatJobType,
  formatJobStatus,
  statusColor,
} from "../styles/tokens";

const priorityOptions = ["High", "Medium", "Low"];
const departmentOptions = [
  "warehouse",
  "mechanic",
  "body_shop",
  "painting",
  "inspection",
  "customer_service",
];
const initialForm = {
  summary: "",
  description: "",
  priority: "",
  department: "",
};
const STORAGE_KEY = "ticketResult";

//  subcomponents

function TicketResult({ createdTicket, ticketMetadata, automationData }) {
  const matchedRules = automationData?.matchedRules || [];
  const jobs = automationData?.jobs || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Ticket info */}
      <div
        style={{
          padding: "16px",
          background: "#f0faf0",
          border: "1px solid #b8e0b8",
          borderRadius: "10px",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontWeight: 600,
            fontSize: "14px",
            color: "#2d7a2d",
          }}
        >
          ✓ Ticket created successfully
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>
            <strong>Key:</strong> {createdTicket.key}
          </p>
          <p style={{ margin: 0, fontSize: "14px" }}>
            <strong>ID:</strong> {createdTicket.id}
          </p>
          {ticketMetadata && (
            <>
              <p style={{ margin: 0, fontSize: "14px" }}>
                <strong>Priority:</strong> {ticketMetadata.priority}
              </p>
              <p style={{ margin: 0, fontSize: "14px" }}>
                <strong>Department:</strong>{" "}
                {formatDepartment(ticketMetadata.department)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Automation summary */}
      <div
        style={{
          padding: "16px",
          background: "#f0f6ff",
          border: "1px solid #ccdeff",
          borderRadius: "10px",
        }}
      >
        <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: "14px" }}>
          Automation Summary
        </p>

        <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            <strong style={{ color: "#1a1a1a" }}>{matchedRules.length}</strong>{" "}
            rule{matchedRules.length !== 1 ? "s" : ""} matched
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            <strong style={{ color: "#1a1a1a" }}>{jobs.length}</strong> job
            {jobs.length !== 1 ? "s" : ""} created
          </p>
        </div>

        {matchedRules.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600 }}>
              Matched Rules
            </p>
            {matchedRules.map((rule) => (
              <p
                key={rule.id}
                style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}
              >
                · {rule.name}
              </p>
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600 }}>
              Triggered Actions
            </p>
            {jobs.map((job) => (
              <p
                key={job._id}
                style={{ margin: "2px 0", fontSize: "13px", color: "#555" }}
              >
                · {formatJobType(job.type)}{" "}
                <span
                  style={{ fontWeight: 600, color: statusColor(job.status) }}
                >
                  {formatJobStatus(job.status)}
                </span>
              </p>
            ))}
          </div>
        )}

        {matchedRules.length === 0 && (
          <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>
            No rules matched this ticket. Check your active rules configuration.
          </p>
        )}
      </div>
    </div>
  );
}

// Main Component

export default function TicketsPage() {
  const [form, setForm] = useState(initialForm);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [ticketMetadata, setTicketMetadata] = useState(null);
  const [automationData, setAutomationData] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setCreatedTicket(parsed.createdTicket || null);
      setTicketMetadata(parsed.ticketMetadata || null);
      setAutomationData(parsed.automationData || null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedTicket(null);
    setTicketMetadata(null);
    setAutomationData(null);
    localStorage.removeItem(STORAGE_KEY);

    try {
      setSubmitting(true);
      const res = await client.post("/tickets", {
        summary: form.summary.trim(),
        description: form.description.trim(),
        priority: form.priority,
        department: form.department,
      });

      const { ticket, metadata, automation } = res.data.data;
      setCreatedTicket(ticket);
      setTicketMetadata(metadata || null);
      setAutomationData(automation || null);
      setForm(initialForm);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          createdTicket: ticket,
          ticketMetadata: metadata || null,
          automationData: automation || null,
        }),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket.");
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
      <h1 style={{ marginBottom: "8px" }}>Create Ticket</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Submit a Jira ticket and review the automation result for the most
        recent request.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
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
          <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
            Ticket Details
          </h2>

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
                Summary
              </div>
              <input
                name="summary"
                value={form.summary}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Brief description of the issue"
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
                Description
              </div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Provide more detail about the issue"
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
                    {p}
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
              {submitting ? "Creating…" : "Create Ticket"}
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
              <strong>Error:</strong> {error}
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
            Result
          </h2>
          {createdTicket ? (
            <TicketResult
              createdTicket={createdTicket}
              ticketMetadata={ticketMetadata}
              automationData={automationData}
            />
          ) : (
            <p style={{ color: "#999", fontSize: "14px" }}>
              Your most recent ticket result will appear here after submission.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
