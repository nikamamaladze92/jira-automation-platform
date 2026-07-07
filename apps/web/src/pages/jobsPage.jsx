import { useEffect, useState, useCallback } from "react";
import client from "../api/client";
import { formatJobType, formatJobStatus, statusColor } from "../styles/tokens";

const statusOptions = ["", "queued", "processing", "succeeded", "failed"];
const typeOptions = ["", "ADD_COMMENT", "SEND_EMAIL"];

const emptyFilters = { status: "", type: "", issueKey: "" };

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      {[70, 50, 40].map((w, i) => (
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

function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false);

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
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: "15px" }}>
            {job.issueKey || "—"}
          </span>
          <span style={{ marginLeft: "10px", fontSize: "13px", color: "#666" }}>
            {formatJobType(job.type)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: statusColor(job.status),
            }}
          >
            {formatJobStatus(job.status)}
          </span>
          <button
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              fontSize: "12px",
              color: "#666",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {expanded ? "Less" : "More"}
          </button>
        </div>
      </div>

      <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#999" }}>
        Attempts: {job.attempts ?? 0} ·{" "}
        {job.createdAt ? new Date(job.createdAt).toLocaleString() : "—"}
      </p>

      {expanded && (
        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {[
            ["Worker lock", job.lockedBy],
            ["Event ID", job.eventId],
            ["Rule ID", job.ruleId],
            ["Comment", job.payload?.comment],
            ["Account ID", job.payload?.accountId],
          ].map(([label, value]) =>
            value ? (
              <p
                key={label}
                style={{ margin: 0, fontSize: "13px", color: "#555" }}
              >
                <strong>{label}:</strong> {value}
              </p>
            ) : null,
          )}
          {job.error && (
            <p style={{ margin: 0, fontSize: "13px", color: "#c0392b" }}>
              <strong>Error:</strong> {job.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

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
      setError(err.response?.data?.message || "Failed to load jobs.");
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

  const handleApply = (e) => {
    e.preventDefault();
    setAppliedFilters(draftFilters);
  };

  const handleReset = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    fontSize: "14px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    boxSizing: "border-box",
    background: "#fff",
  };

  const btnStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "1px solid #e5e5e5",
  };

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Automation Jobs</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Review queued and completed automation work generated after inbound
        ticket events match active rules.
      </p>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
          Filter Jobs
        </h2>
        <form
          onSubmit={handleApply}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <div
              style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
            >
              Status
            </div>
            <select
              name="status"
              value={draftFilters.status}
              onChange={handleChange}
              style={inputStyle}
            >
              {statusOptions.map((s) => (
                <option key={s || "all"} value={s}>
                  {s ? formatJobStatus(s) : "All"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div
              style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
            >
              Type
            </div>
            <select
              name="type"
              value={draftFilters.type}
              onChange={handleChange}
              style={inputStyle}
            >
              {typeOptions.map((t) => (
                <option key={t || "all"} value={t}>
                  {t ? formatJobType(t) : "All"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div
              style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}
            >
              Issue Key
            </div>
            <input
              name="issueKey"
              placeholder="KAN-3"
              value={draftFilters.issueKey}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                ...btnStyle,
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
              }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{ ...btnStyle, background: "#fff" }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
          Job Activity{" "}
          {!loading && (
            <span style={{ fontWeight: 400, color: "#999", fontSize: "14px" }}>
              ({jobs.length} results)
            </span>
          )}
        </h2>

        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #f3c2c2",
              borderRadius: "8px",
              padding: "12px 14px",
              color: "#c0392b",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[...Array(4)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>
            No automation jobs found.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
