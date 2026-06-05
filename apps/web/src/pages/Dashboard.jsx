import { useEffect, useState } from "react";
import client from "../api/client";
import Summary from "../components/Summary";
import { useAuth } from "../context/AuthContext";

function formatExecutionType(type) {
  switch (type) {
    case "ADD_COMMENT":
      return "Add Jira comment";
    case "SEND_EMAIL":
      return "Send manager email";
    default:
      return type;
  }
}

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
//delete later

function formatEventType(type) {
  switch (type) {
    case "issue_created":
      return "Issue created";
    default:
      return type;
  }
}

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
      return value || "-";
  }
}

function formatSource(source) {
  switch (source) {
    case "jira":
      return "Jira";
    case "demo":
      return "Simulation";
    default:
      return source || "-";
  }
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (user?.role === "admin") {
          const [summaryRes, executionsRes, eventsRes] = await Promise.all([
            client.get("/dashboard/summary"),
            client.get("/executions"),
            client.get("/events"),
          ]);

          setSummary(summaryRes.data.data);
          setExecutions((executionsRes.data.data || []).slice(0, 5));
          setEvents((eventsRes.data.data.events || []).slice(0, 5));
        } else if (user?.role === "manager") {
          const summaryRes = await client.get("/dashboard/summary");
          setSummary(summaryRes.data.data);
          setExecutions([]);
          setEvents([]);
        } else {
          setSummary(null);
          setExecutions([]);
          setEvents([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Operations Overview</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Monitor ticket automation activity based on your level of access.
      </p>

      {user?.role === "staff" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Welcome</h2>
          <p style={{ marginBottom: 0 }}>
            Use the ticket page to submit new Jira requests. Automation results
            for your latest submission will appear there after creation.
          </p>
        </div>
      )}

      {(user?.role === "manager" || user?.role === "admin") && summary && (
        <>
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

          {user?.role === "admin" && (
            <div
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
                  <p>No recent executions found.</p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
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
                          <strong>{execution.issueKey || "-"}</strong> —{" "}
                          {formatExecutionType(execution.type)}
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
                <h2 style={{ marginTop: 0 }}>Recent Inbound Events</h2>

                {events.length === 0 ? (
                  <p>No recent events found.</p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
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
                          <strong>{event.issueKey || "-"}</strong> —{" "}
                          {formatEventType(event.eventType)}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          Source: {formatSource(event.source)} | Department:{" "}
                          {formatDepartment(event.department)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
