import { useEffect, useState } from "react";
import client from "../api/client";
import Summary from "../components/Summary";
import { useAuth } from "../context/AuthContext";
import {
  formatEventType,
  formatSource,
  formatDepartment,
  formatJobType,
  statusColor,
} from "../styles/tokens";

// Subcomponents

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "14px",
          background: "#f0f0f0",
          borderRadius: "6px",
          marginBottom: "12px",
        }}
      />
      <div
        style={{
          width: "60%",
          height: "12px",
          background: "#f5f5f5",
          borderRadius: "6px",
          marginBottom: "8px",
        }}
      />
      <div
        style={{
          width: "50%",
          height: "12px",
          background: "#f5f5f5",
          borderRadius: "6px",
        }}
      />
    </div>
  );
}

function ExecutionItem({ execution }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>
          {execution.issueKey || "—"}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: statusColor(execution.status),
          }}
        >
          {execution.status}
        </span>
      </div>
      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
        {formatJobType(execution.type)}
      </p>
    </div>
  );
}

function EventItem({ event }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>
          {event.issueKey || "—"}
        </span>
        <span style={{ fontSize: "13px", color: "#666" }}>
          {formatSource(event.source)}
        </span>
      </div>
      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
        {formatEventType(event.eventType)} ·{" "}
        {formatDepartment(event.department)}
      </p>
    </div>
  );
}

// Main Component

export default function DashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      try {
        if (user.role === "admin") {
          const [summaryRes, executionsRes, eventsRes] = await Promise.all([
            client.get("/dashboard/summary"),
            client.get("/executions"),
            client.get("/events"),
          ]);
          setSummary(summaryRes.data.data);
          setExecutions((executionsRes.data.data || []).slice(0, 5));
          setEvents((eventsRes.data.data.events || []).slice(0, 5));
        } else if (user.role === "manager") {
          const summaryRes = await client.get("/dashboard/summary");
          setSummary(summaryRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: "8px" }}>Operations Overview</h1>
        <p style={{ marginTop: 0, color: "#666", marginBottom: "24px" }}>
          Monitor ticket automation activity based on your level of access.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#fff5f5",
          border: "1px solid #f3c2c2",
          borderRadius: "10px",
          padding: "16px",
          color: "#c0392b",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Operations Overview</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "24px" }}>
        Monitor ticket automation activity based on your level of access.
      </p>

      {/* Staff view */}
      {user?.role === "staff" && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "8px" }}>
            Welcome, {user.name}
          </h2>
          <p style={{ margin: 0, color: "#666" }}>
            Use the <strong>Create Ticket</strong> page to submit new Jira
            requests. Automation results for your latest submission will appear
            after creation.
          </p>
        </div>
      )}

      {/* Manager + Admin view */}
      {(user?.role === "manager" || user?.role === "admin") && summary && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <Summary title="Total Jobs" value={summary.jobs.total} />
            <Summary title="Failed Jobs" value={summary.jobs.failed} />
            <Summary title="Executions" value={summary.executions.total} />
            <Summary title="Rules" value={summary.rules.total} />
            <Summary title="Events" value={summary.events.total} />
          </div>

          {/* Admin-only activity panels */}
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
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: "16px",
                    fontSize: "16px",
                  }}
                >
                  Recent Executions
                </h2>
                {executions.length === 0 ? (
                  <p style={{ color: "#999", fontSize: "14px" }}>
                    No recent executions found.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {executions.map((execution) => (
                      <ExecutionItem
                        key={execution._id}
                        execution={execution}
                      />
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
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: "16px",
                    fontSize: "16px",
                  }}
                >
                  Recent Inbound Events
                </h2>
                {events.length === 0 ? (
                  <p style={{ color: "#999", fontSize: "14px" }}>
                    No recent events found.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {events.map((event) => (
                      <EventItem key={event._id} event={event} />
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
