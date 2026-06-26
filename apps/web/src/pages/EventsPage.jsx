// show incoming events display info

import { useEffect, useState } from "react";
import client from "../api/client";

function formatEventType(type) {
  switch (type) {
    case "issue_created":
      return "Issue created";
    default:
      return type;
  }
}



function formatSource(source) {
  switch (source) {
    case "jira":
      return "Jira";
    default:
      return source || "-";
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

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await client.get("/events");
        setEvents(res.data.data.events || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) return <p>Loading inbound events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Inbound Events</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Review ticket events received by the platform before automation rules
        are evaluated.
      </p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        {events.length === 0 ? (
          <p>No inbound events found.</p>
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
                  padding: "14px",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Issue:</strong> {event.issueKey || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Source:</strong> {formatSource(event.source)}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Event:</strong> {formatEventType(event.eventType)}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Priority:</strong> {event.priority || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Department:</strong>{" "}
                  {formatDepartment(event.department)}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Processed:</strong> {event.processed ? "Yes" : "No"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Received:</strong>{" "}
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
