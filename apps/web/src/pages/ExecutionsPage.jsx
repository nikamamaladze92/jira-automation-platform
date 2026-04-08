// execution history display job done and errors

import { useEffect, useState } from "react";
import client from "../api/client";

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
        setError(err.response?.data?.message || "failed to load executions");
      } finally {
        setLoading(false);
      }
    };

    loadExecutions();
  }, []);

  if (loading) return <p>Loading executions</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Executions</h1>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
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
                  padding: "14px",
                }}
              >
                <p>
                  <strong>Issue:</strong> {execution.issueKey}
                </p>
                <p>
                  <strong>Type:</strong> {execution.type}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
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
                <p>
                  <strong>Worker:</strong> {execution.workerId}
                </p>
                <p>
                  <strong>Duration:</strong> {execution.durationMs || 0} ms
                </p>
                {execution.error && (
                  <p style={{ color: "red" }}>
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
