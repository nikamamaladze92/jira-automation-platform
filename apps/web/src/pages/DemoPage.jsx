// trigger demo automation events from  UI, show matched rules and jobs results

import { useState } from "react";
import client from "../api/client";

const initialForm = {
  eventType: "issue_created",
  issueKey: "TEST-100",
  priority: "high",
  department: "warehouse",
};

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
      setError(err.response?.data?.message || "Failed to trigger demo event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <div>
    //   <h1 style={{ marginBottom: "20px" }}>Demo Event Trigger</h1>
    <div>
      <h1 style={{ marginBottom: "8px" }}>Demo Trigger</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Use this page to simulate an incoming event and show the full automation
        flow: rule match → job creation → worker execution.
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
          <h2>Trigger Event</h2>

          <form
            onSubmit={handleTrigger}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
            />
            <input
              name="issueKey"
              value={form.issueKey}
              onChange={handleChange}
            />
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? "Triggering..." : "Trigger Demo Event"}
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
          <h2>Result</h2>

          {!result ? (
            <p>No event triggered yet.</p>
          ) : (
            <div>
              <p>
                <strong>Event ID:</strong> {result.event?._id}
              </p>
              <p>
                <strong>Issue Key:</strong> {result.event?.issueKey}
              </p>
              <p>
                <strong>Matched Rules:</strong>{" "}
                {result.matchedRules?.length || 0}
              </p>
              <p>
                <strong>Jobs Created:</strong> {result.jobs?.length || 0}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
