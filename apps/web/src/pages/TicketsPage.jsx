// create jira tickets from dashboard

import { useState } from "react";
import client from "../api/client";

const initialForm = {
  projectKey: "",
  summary: "",
  description: "",
  issueType: "Task",
  priority: "High",
};

export default function TicketsPage() {
  const [form, setForm] = useState(initialForm);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    try {
      setSubmitting(true);

      const res = await client.post("/tickets", {
        projectKey: form.projectKey,
        summary: form.summary,
        description: form.description,
        issueType: form.issueType,
        priority: form.priority,
      });

      setCreatedTicket(res.data.data.ticket);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Create Ticket</h1>

      <div
        style={{
          maxWidth: "700px",
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
          <input
            name="projectKey"
            placeholder="Project Key (example: CAR)"
            value={form.projectKey}
            onChange={handleChange}
          />

          <input
            name="summary"
            placeholder="Ticket summary"
            value={form.summary}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Ticket description"
            value={form.description}
            onChange={handleChange}
            rows={5}
          />

          <select
            name="issueType"
            value={form.issueType}
            onChange={handleChange}
          >
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
          </select>

          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "14px" }}>{error}</p>}

        {createdTicket && (
          <div
            style={{
              marginTop: "18px",
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
          </div>
        )}
      </div>
    </div>
  );
}
