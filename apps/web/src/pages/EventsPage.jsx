// show incoming events display info

import { useEffect, useState } from "react";
import client from "../api/client";

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

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Events</h1>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
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
                  padding: "14px",
                }}
              >
                <p>
                  <strong>Issue:</strong> {event.issueKey}
                </p>
                <p>
                  <strong>Source:</strong> {event.source}
                </p>
                <p>
                  <strong>Event Type:</strong> {event.eventType}
                </p>
                <p>
                  <strong>Priority:</strong> {event.priority || "-"}
                </p>
                <p>
                  <strong>Department:</strong> {event.department || "-"}
                </p>
                <p>
                  <strong>Processed:</strong> {event.processed ? "Yes" : "No"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
