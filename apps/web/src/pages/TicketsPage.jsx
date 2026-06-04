import { useState, useEffect } from "react";
import client from "../api/client";

const priorityOptions = ["High", "Medium", "Low"];

//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later
//delete later

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

function formatJobStatus(status) {
  switch (status) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "succeeded":
      return "Succeeded";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

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

export default function TicketsPage() {
  const [form, setForm] = useState(initialForm);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [ticketMetadata, setTicketMetadata] = useState(null);
  const [automationData, setAutomationData] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  //const [rawResponse, setRawResponse] = useState(null);

  const ticketResult = "ticketResult";

  useEffect(() => {
    const saved = localStorage.getItem(ticketResult);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setCreatedTicket(parsed.createdTicket || null);
      setTicketMetadata(parsed.ticketMetadata || null);
      setAutomationData(parsed.automationData || null);
    } catch (err) {
      console.error("Failed to parse saved ticket result", err);
      localStorage.removeItem(ticketResult);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedTicket(null);
    setTicketMetadata(null);
    setAutomationData(null);
    //setRawResponse(null);

    localStorage.removeItem(ticketResult);

    try {
      setSubmitting(true);
      const res = await client.post("/tickets", {
        summary: form.summary.trim(),
        description: form.description.trim(),
        priority: form.priority,
        department: form.department,
      });
      //setRawResponse(res.data);

      setCreatedTicket(res.data.data.ticket);
      setTicketMetadata(res.data.data.metadata || null);
      setAutomationData(res.data.data.automation || null);
      setForm(initialForm);

      localStorage.setItem(
        ticketResult,
        JSON.stringify({
          createdTicket: res.data.data.ticket,
          ticketMetadata: res.data.data.metadata || null,
          automationData: res.data.data.automation || null,
        }),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
      //setRawResponse(err.response?.data || null);
    } finally {
      setSubmitting(false);
    }
  };

  const matchedRulesCount = automationData?.matchedRules?.length || 0;
  const jobsCreatedCount = automationData?.jobs?.length || 0;

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Create Ticket</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Submit a Jira ticket and review the automation result for the most
        recent request
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
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
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Summary
              </div>
              <input
                name="summary"
                value={form.summary}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Description
              </div>
              <textarea
                name="description"
                value={form.description}
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
                    {priority}
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
                    {formatDepartment(department)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating Ticket" : "Create Ticket"}
            </button>
          </form>
          {error && (
            <div
              style={{
                color: "red",
                marginTop: "14px",
                background: "#fff5f5",
                border: "1px solid #f3c2c2",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <strong>Ticket creation failed:</strong>
              <div style={{ marginTop: "6px" }}>{error}</div>
            </div>
          )}
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Created Ticket</h2>
          {!createdTicket ? (
            <p style={{ color: "#666" }}>
              Your most recent ticket result will appear down here after
              submission
            </p>
          ) : (
            <>
              <div
                style={{
                  marginTop: "8px",
                  padding: "14px",
                  background: "#f6fff6",
                  border: "1px solid #cdeccd",
                  borderRadius: "10px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Ticket Created</h3>
                <p style={{ margin: "6px 0" }}>
                  <strong>Key:</strong> {createdTicket.key}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>ID:</strong> {createdTicket.id}
                </p>
                {ticketMetadata && (
                  <>
                    <p style={{ margin: "6px 0" }}>
                      <strong>Priority:</strong> {ticketMetadata.priority}
                    </p>
                    <p style={{ margin: "6px 0" }}>
                      <strong>Department:</strong>{" "}
                      {formatDepartment(ticketMetadata.department)}
                    </p>
                  </>
                )}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  background: "#f8fbff",
                  border: "1px solid #d5e6ff",
                  borderRadius: "10px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Automation Summary</h3>
                <p style={{ margin: "6px 0" }}>
                  <strong>Matched Rules:</strong> {matchedRulesCount}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Jobs Created:</strong> {jobsCreatedCount}
                </p>

                <div style={{ marginTop: "10px" }}>
                  <strong>Matched Rules:</strong>
                  {matchedRulesCount === 0 ? (
                    <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                      No rules matched this ticket
                    </p>
                  ) : (
                    <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                      {automationData.matchedRules.map((rule) => (
                        <li key={rule.id}>{rule.name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ marginTop: "10px" }}>
                  <strong>Triggered Actions:</strong>
                  {jobsCreatedCount === 0 ? (
                    <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                      No actions were triggered
                    </p>
                  ) : (
                    <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                      {automationData.jobs.map((job) => (
                        <li key={job._id}>
                          {formatJobType(job.type)} —{" "}
                          {formatJobStatus(job.status)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
          {/* {rawResponse && (
            <div
              style={{
                marginTop: "16px",
                background: "#f8f8f8",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <strong> FOR DEV DEBUG: API response</strong>
              <pre
                style={{
                  marginTop: "8px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
