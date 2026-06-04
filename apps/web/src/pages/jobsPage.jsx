import { useEffect, useState, useCallback } from "react";
import client from "../api/client";

const statusOptions = ["", "queued", "processing", "succeeded", "failed"];
const typeOptions = ["", "ADD_COMMENT", "SEND_EMAIL"];

function formatJobType(type) {
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

function formatJobStatus(status) {
  switch (status) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "succeeded":
      return "Succeeded";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

const filters = {
  status: "",
  type: "",
  issueKey: "",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // doesn't trigger fetch
  const [draftFilters, setDraftFilters] = useState(filters);

  // triggers the fetch
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.type) params.type = appliedFilters.type;
      if (appliedFilters.issueKey.trim())
        params.issueKey = appliedFilters.issueKey.trim();

      const res = await client.get("/jobs", { params });
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(filters);
    setAppliedFilters(filters);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "failed":
        return "red";
      case "succeeded":
        return "green";
      case "processing":
        return "#b26b00";
      case "queued":
        return "#555";
      default:
        return "#333";
    }
  };

  if (loading) return <p>Loading jobs</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Automation Jobs</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Review queued and completed automation work generated after inbound
        ticket events match active rules
      </p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Filter Jobs</h2>

        <form
          onSubmit={handleApplyFilters}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <label>
            <div style={{ marginBottom: "6px", fontWeight: 600 }}>Status</div>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              {statusOptions.map((status) => (
                <option key={status || "all-statuses"} value={status}>
                  {status || "All"}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ marginBottom: "6px", fontWeight: 600 }}>Type</div>
            <select name="type" value={filters.type} onChange={handleChange}>
              {typeOptions.map((type) => (
                <option key={type || "all-types"} value={type}>
                  {type ? formatJobType(type) : "All"}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ marginBottom: "6px", fontWeight: 600 }}>
              Issue Key
            </div>
            <input
              name="issueKey"
              //placeholder="KAN-3"
              value={filters.issueKey}
              onChange={handleChange}
            />
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit">Apply</button>
            <button type="button" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Job Activity</h2>

        {jobs.length === 0 ? (
          <p>No automation jobs found</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {jobs.map((job) => (
              <div
                key={job._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Issue:</strong> {job.issueKey}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Action:</strong> {formatJobType(job.type)}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: getStatusColor(job.status) }}>
                    {formatJobStatus(job.status)}
                  </span>
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Attempts:</strong> {job.attempts ?? 0}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Worker lock:</strong> {job.lockedBy || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Event ID:</strong> {job.eventId || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Rule ID:</strong> {job.ruleId || "-"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong>Created:</strong>{" "}
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleString()
                    : "-"}
                </p>

                {job.payload?.comment && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>Comment:</strong> {job.payload.comment}
                  </p>
                )}

                {job.payload?.accountId && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>Account ID:</strong> {job.payload.accountId}
                  </p>
                )}

                {job.error && (
                  <p style={{ margin: "4px 0", color: "red" }}>
                    <strong>Error:</strong> {job.error}
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
