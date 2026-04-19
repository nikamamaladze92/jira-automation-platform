// execution history display job done and errors

import { useEffect, useState } from "react";
import client from "../api/client";

function formatExecutionType(type) {
  switch (type) {
    case "ADD_COMMENT":
      return "Add Jira comment";
    default:
      return type;
  }
}

function formatExecutionStatus(status) {
  switch (status) {
    case "succeeded":
      return "Succeeded";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function getStatusColor(status) {
  switch (status) {
    case "failed":
      return "red";
    case "succeeded":
      return "green";
    default:
      return "#333";
  }
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExecutions = async () => {
      try {
        const res = await client.get("/executions");
        setExecutions(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load executions");
      } finally {
        setLoading(false);
      }
    };

    loadExecutions();
  }, []);

  if (loading) return <p>Loading executions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Execution History</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Review completed automation attempts, worker outcomes, and failure
        details.
      </p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        {executions.length === 0 ? (
          <p>No execution history found.</p>
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
                  padding: "14px",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Issue:</strong> {execution.issueKey || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Action:</strong> {formatExecutionType(execution.type)}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: getStatusColor(execution.status) }}>
                    {formatExecutionStatus(execution.status)}
                  </span>
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Worker:</strong> {execution.workerId || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Duration:</strong> {execution.durationMs ?? 0} ms
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Completed:</strong>{" "}
                  {execution.createdAt
                    ? new Date(execution.createdAt).toLocaleString()
                    : "-"}
                </p>

                {execution.error && (
                  <p style={{ margin: "4px 0", color: "red" }}>
                    <strong>Error:</strong> {execution.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
