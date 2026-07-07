import { useEffect, useState } from "react";
import client from "../api/client";
import {
  formatEventType,
  formatSource,
  formatDepartment,
} from "../styles/tokens";

// subcomponents

function SkeletonRow() {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      {[50, 70, 40].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}%`,
            height: "13px",
            background: "#f0f0f0",
            borderRadius: "6px",
            marginBottom: i < 2 ? "8px" : 0,
          }}
        />
      ))}
    </div>
  );
}

function EventCard({ event }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "15px" }}>
          {event.issueKey || "—"}
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "20px",
            background: event.processed ? "#f0faf0" : "#f5f5f5",
            color: event.processed ? "#2d7a2d" : "#999",
            border: `1px solid ${event.processed ? "#b8e0b8" : "#e5e5e5"}`,
          }}
        >
          {event.processed ? "Processed" : "Pending"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "6px",
        }}
      >
        <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
          <strong>Event:</strong> {formatEventType(event.eventType)}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
          <strong>Source:</strong> {formatSource(event.source)}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "6px",
        }}
      >
        <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
          <strong>Priority:</strong> {event.priority || "—"}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
          <strong>Department:</strong> {formatDepartment(event.department)}
        </p>
      </div>

      <p style={{ margin: 0, fontSize: "13px", color: "#999" }}>
        {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}
      </p>
    </div>
  );
}

// main Component

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
        setError(err.response?.data?.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Inbound Events</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Review ticket events received by the platform before automation rules
        are evaluated.
      </p>

      {error && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #f3c2c2",
            borderRadius: "8px",
            padding: "12px 14px",
            color: "#c0392b",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
          Event Log{" "}
          {!loading && (
            <span style={{ fontWeight: 400, color: "#999", fontSize: "14px" }}>
              ({events.length})
            </span>
          )}
        </h2>

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[...Array(4)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>
            No inbound events found.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
