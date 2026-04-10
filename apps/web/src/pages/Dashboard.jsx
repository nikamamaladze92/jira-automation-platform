import { useEffect, useState } from "react";
import client from "../api/client";
import Summary from "../components/Summary";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryRes, executionsRes, eventsRes] = await Promise.all([
          client.get("/dashboard/summary"),
          client.get("/executions"),
          client.get("/events"),
        ]);

        setSummary(summaryRes.data.data);
        setExecutions((executionsRes.data.data || []).slice(0, 5));
        setEvents((eventsRes.data.data.events || []).slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <p>loading dashboard</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    // <div>
    //   <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>
    <div>
      <h1 style={{ marginBottom: "8px" }}>Operations Overview</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Monitor ticket automation, background jobs, worker executions, and
        incoming events.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Summary title="Total Jobs" value={summary.jobs.total} />
        <Summary title="Failed Jobs" value={summary.jobs.failed} />
        <Summary title="Executions" value={summary.executions.total} />
        <Summary title="Rules" value={summary.rules.total} />
        <Summary title="Events" value={summary.events.total} />
      </div>

      <div
        className="two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
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
          <h2 style={{ marginTop: 0 }}>Recent Executions</h2>

          {executions.length === 0 ? (
            <p>No executions found.</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {executions.map((execution) => (
                <div
                  key={execution._id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <p style={{ margin: "4px 0" }}>
                    <strong>{execution.issueKey}</strong> — {execution.type}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          execution.status === "failed"
                            ? "red"
                            : execution.status === "succeeded"
                              ? "green"
                              : "#333",
                      }}
                    >
                      {execution.status}
                    </span>
                  </p>
                </div>
              ))}
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
          <h2 style={{ marginTop: 0 }}>Recent Events</h2>

          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {events.map((event) => (
                <div
                  key={event._id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "12px",
                  }}
                >
                  <p style={{ margin: "4px 0" }}>
                    <strong>{event.issueKey}</strong> — {event.eventType}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    Source: {event.source} | Department:{" "}
                    {event.department || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
