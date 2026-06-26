// // execution history display job done and errors

// import { useEffect, useState } from "react";
// import client from "../api/client";

// function formatExecutionType(type) {
//   switch (type) {
//     case "ADD_COMMENT":
//       return "Add Jira comment";
//     case "SEND_EMAIL":
//       return "Send manager email";
//     default:
//       return type;
//   }
// }

// function formatDepartment(value) {
//   switch (value) {
//     case "warehouse":
//       return "Warehouse";
//     case "mechanic":
//       return "Mechanic";
//     case "body_shop":
//       return "Body Shop";
//     case "painting":
//       return "Painting";
//     case "inspection":
//       return "Inspection";
//     case "customer_service":
//       return "Customer Service";
//     default:
//       return value || "-";
//   }
// }

// function formatExecutionStatus(status) {
//   switch (status) {
//     case "succeeded":
//       return "Succeeded";
//     case "failed":
//       return "Failed";
//     default:
//       return status;
//   }
// }

// function getStatusColor(status) {
//   switch (status) {
//     case "failed":
//       return "red";
//     case "succeeded":
//       return "green";
//     default:
//       return "#333";
//   }
// }

// export default function ExecutionsPage() {
//   const [executions, setExecutions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadExecutions = async () => {
//       try {
//         const res = await client.get("/executions");
//         setExecutions(res.data.data || []);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to load executions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadExecutions();
//   }, []);

//   if (loading) return <p>Loading executions...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div>
//       <h1 style={{ marginBottom: "8px" }}>Execution History</h1>
//       <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
//         Review completed automation attempts, worker outcomes, and failure
//         details.
//       </p>

//       <div
//         style={{
//           background: "#fff",
//           border: "1px solid #e5e5e5",
//           borderRadius: "12px",
//           padding: "20px",
//         }}
//       >
//         {executions.length === 0 ? (
//           <p>No execution history found.</p>
//         ) : (
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "12px" }}
//           >
//             {executions.map((execution) => (
//               <div
//                 key={execution._id}
//                 style={{
//                   border: "1px solid #eee",
//                   borderRadius: "10px",
//                   padding: "14px",
//                 }}
//               >
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Issue:</strong> {execution.issueKey || "-"}
//                 </p>

//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Action:</strong> {formatExecutionType(execution.type)}
//                 </p>

//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Status:</strong>{" "}
//                   <span style={{ color: getStatusColor(execution.status) }}>
//                     {formatExecutionStatus(execution.status)}
//                   </span>
//                 </p>

//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Worker:</strong> {execution.workerId || "-"}
//                 </p>

//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Duration:</strong> {execution.durationMs ?? 0} ms
//                 </p>

//                 {execution.result?.recipient && (
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Recipient:</strong> {execution.result.recipient}
//                   </p>
//                 )}

//                 {execution.result?.department && (
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Department:</strong>{" "}
//                     {formatDepartment(execution.result.department)}
//                   </p>
//                 )}

//                 {execution.result?.messageId && (
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Email Message ID:</strong>{" "}
//                     {execution.result.messageId}
//                   </p>
//                 )}

//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Completed:</strong>{" "}
//                   {execution.createdAt
//                     ? new Date(execution.createdAt).toLocaleString()
//                     : "-"}
//                 </p>

//                 {execution.error && (
//                   <p style={{ margin: "4px 0", color: "red" }}>
//                     <strong>Error:</strong> {execution.error}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

//
//
//

// import { useEffect, useState } from "react";
// import client from "../api/client";

// function formatExecutionType(type) {
//   switch (type) {
//     case "ADD_COMMENT":
//       return "Add Jira comment";
//     case "SEND_EMAIL":
//       return "Send manager email";
//     default:
//       return type;
//   }
// }

// function formatStatus(status) {
//   switch (status) {
//     case "succeeded":
//       return "Succeeded";
//     case "failed":
//       return "Failed";
//     case "running":
//       return "Running";
//     default:
//       return status;
//   }
// }

// function getStatusStyle(status) {
//   const base = {
//     display: "inline-block",
//     padding: "4px 10px",
//     borderRadius: "999px",
//     fontSize: "13px",
//     fontWeight: 700,
//   };

//   if (status === "succeeded") {
//     return {
//       ...base,
//       background: "#e8f7ee",
//       color: "#137333",
//     };
//   }

//   if (status === "failed") {
//     return {
//       ...base,
//       background: "#fdecea",
//       color: "#b3261e",
//     };
//   }

//   return {
//     ...base,
//     background: "#f1f3f4",
//     color: "#333",
//   };
// }

// function formatDepartment(value) {
//   switch (value) {
//     case "warehouse":
//       return "Warehouse";
//     case "mechanic":
//       return "Mechanic";
//     case "body_shop":
//       return "Body Shop";
//     case "painting":
//       return "Painting";
//     case "inspection":
//       return "Inspection";
//     case "customer_service":
//       return "Customer Service";
//     default:
//       return value || "-";
//   }
// }

// export default function ExecutionsPage() {
//   const [executions, setExecutions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadExecutions = async () => {
//       try {
//         const res = await client.get("/executions");
//         setExecutions(res.data.data || []);
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to load executions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadExecutions();
//   }, []);

//   if (loading) return <p>Loading execution history...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div>
//       <h1 style={{ marginBottom: "8px" }}>Execution History</h1>
//       <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
//         Review completed automation actions, delivery outcomes, worker activity,
//         and failure details.
//       </p>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//           gap: "16px",
//           marginBottom: "24px",
//         }}
//       >
//         <div style={summaryCardStyle}>
//           <div style={summaryLabelStyle}>Total Executions</div>
//           <div style={summaryValueStyle}>{executions.length}</div>
//         </div>

//         <div style={summaryCardStyle}>
//           <div style={summaryLabelStyle}>Succeeded</div>
//           <div style={summaryValueStyle}>
//             {executions.filter((item) => item.status === "succeeded").length}
//           </div>
//         </div>

//         <div style={summaryCardStyle}>
//           <div style={summaryLabelStyle}>Failed</div>
//           <div style={summaryValueStyle}>
//             {executions.filter((item) => item.status === "failed").length}
//           </div>
//         </div>
//       </div>

//       <div
//         style={{
//           background: "#fff",
//           border: "1px solid #e5e5e5",
//           borderRadius: "14px",
//           padding: "20px",
//         }}
//       >
//         <h2 style={{ marginTop: 0 }}>Recent Automation Outcomes</h2>

//         {executions.length === 0 ? (
//           <p>No execution history found.</p>
//         ) : (
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "14px" }}
//           >
//             {executions.map((execution) => (
//               <div
//                 key={execution._id}
//                 style={{
//                   border: "1px solid #eee",
//                   borderRadius: "12px",
//                   padding: "16px",
//                   background: "#fff",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     gap: "12px",
//                     alignItems: "flex-start",
//                     marginBottom: "12px",
//                   }}
//                 >
//                   <div>
//                     <h3 style={{ margin: 0 }}>
//                       {formatExecutionType(execution.type)}
//                     </h3>
//                     <p style={{ margin: "6px 0 0", color: "#666" }}>
//                       Issue {execution.issueKey || "-"}
//                     </p>
//                   </div>

//                   <span style={getStatusStyle(execution.status)}>
//                     {formatStatus(execution.status)}
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//                     gap: "10px",
//                     marginTop: "12px",
//                   }}
//                 >
//                   <Info label="Worker" value={execution.workerId || "-"} />
//                   <Info
//                     label="Duration"
//                     value={`${execution.durationMs ?? 0} ms`}
//                   />
//                   <Info
//                     label="Completed"
//                     value={
//                       execution.finishedAt || execution.createdAt
//                         ? new Date(
//                             execution.finishedAt || execution.createdAt,
//                           ).toLocaleString()
//                         : "-"
//                     }
//                   />

//                   {execution.result?.recipient && (
//                     <Info
//                       label="Recipient"
//                       value={execution.result.recipient}
//                     />
//                   )}

//                   {execution.result?.department && (
//                     <Info
//                       label="Department"
//                       value={formatDepartment(execution.result.department)}
//                     />
//                   )}

//                   {execution.result?.messageId && (
//                     <Info
//                       label="Email Message ID"
//                       value={execution.result.messageId}
//                     />
//                   )}
//                 </div>

//                 {execution.error && (
//                   <div
//                     style={{
//                       marginTop: "12px",
//                       padding: "12px",
//                       borderRadius: "10px",
//                       background: "#fdecea",
//                       color: "#b3261e",
//                     }}
//                   >
//                     <strong>Error:</strong> {execution.error}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function Info({ label, value }) {
//   return (
//     <div
//       style={{
//         background: "#fafafa",
//         border: "1px solid #eee",
//         borderRadius: "10px",
//         padding: "10px",
//       }}
//     >
//       <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
//         {label}
//       </div>
//       <div style={{ fontWeight: 600, wordBreak: "break-word" }}>{value}</div>
//     </div>
//   );
// }

// const summaryCardStyle = {
//   background: "#fff",
//   border: "1px solid #e5e5e5",
//   borderRadius: "14px",
//   padding: "18px",
// };

// const summaryLabelStyle = {
//   color: "#666",
//   fontSize: "14px",
//   marginBottom: "8px",
// };

// const summaryValueStyle = {
//   fontSize: "28px",
//   fontWeight: 800,
// };

//delete later

//delete later
//delete later

//delete later
//delete later
//delete later
//delete later
//delete later

import { useEffect, useState, useMemo } from "react";
import client from "../api/client";

//helper functions

function formatActionType(type) {
  switch (type) {
    case "ADD_COMMENT":
      return "Add Jira comment";
    case "SEND_EMAIL":
      return "Send manager email";
    default:
      return type ?? "-";
  }
}

function formatDepartment(value) {
  const map = {
    warehouse: "Warehouse",
    mechanic: "Mechanic",
    body_shop: "Body Shop",
    painting: "Painting",
    inspection: "Inspection",
    customer_service: "Customer Service",
  };
  return map[value] ?? value ?? "-";
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  const styles = {
    succeeded: {
      background: "#e8f5e9",
      color: "#2e7d32",
      border: "1px solid #c8e6c9",
    },
    failed: {
      background: "#fdecea",
      color: "#b71c1c",
      border: "1px solid #f5c6c4",
    },
  };
  const labels = { succeeded: "✓ Succeeded", failed: "✕ Failed" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...styles[status],
      }}
    >
      {labels[status] ?? status}
    </span>
  );
}

function ActionBadge({ type }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 20,
        background: "#e8eeff",
        color: "#1a40c8",
        border: "1px solid #c5d0f8",
        whiteSpace: "nowrap",
      }}
    >
      {formatActionType(type)}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        padding: "14px 18px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: color ?? "#111",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ExecutionRow({ execution }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    execution.result?.recipient ||
    execution.result?.department ||
    execution.result?.messageId ||
    execution.error;

  return (
    <div
      onClick={() => hasDetails && setOpen((o) => !o)}
      style={{
        background: "#fff",
        border: "1px solid",
        borderColor: open ? "#d0d5ea" : "#ebebeb",
        borderRadius: 12,
        overflow: "hidden",
        cursor: hasDetails ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: open ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* ── row top ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 16px",
        }}
      >
        {/* status dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              execution.status === "succeeded" ? "#43a047" : "#e53935",
            boxShadow: `0 0 0 3px ${execution.status === "succeeded" ? "#e8f5e9" : "#fdecea"}`,
          }}
        />

        {/* issue + sub */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              {execution.issueKey || "-"}
            </span>
            <ActionBadge type={execution.type} />
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
            {execution.workerId || "-"} · {formatDate(execution.createdAt)}
          </div>
        </div>

        {/* right side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <StatusBadge status={execution.status} />
          <span
            style={{
              fontSize: 12,
              color: "#aaa",
              minWidth: 52,
              textAlign: "right",
            }}
          >
            {(execution.durationMs ?? 0).toLocaleString()} ms
          </span>
          {hasDetails && (
            <span
              style={{
                fontSize: 11,
                color: "#bbb",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </div>

      {/* ── expanded details ── */}
      {open && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            padding: "14px 16px 16px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "10px 24px",
            }}
          >
            {execution.result?.recipient && (
              <DetailField
                label="Recipient"
                value={execution.result.recipient}
              />
            )}
            {execution.result?.department && (
              <DetailField
                label="Department"
                value={formatDepartment(execution.result.department)}
              />
            )}
            {execution.result?.messageId && (
              <DetailField
                label="Message ID"
                value={execution.result.messageId}
                mono
              />
            )}
            <DetailField
              label="Completed"
              value={formatDate(execution.createdAt)}
            />
          </div>

          {execution.error && (
            <div
              style={{
                marginTop: 12,
                background: "#fff5f5",
                border: "1px solid #ffd7d7",
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 12,
                color: "#b91c1c",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 6 }}>Error:</span>
              {execution.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: mono ? 11 : 13,
          color: "#333",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ControlBar({
  search,
  onSearch,
  status,
  onStatus,
  type,
  onType,
  sort,
  onSort,
}) {
  const inputStyle = {
    height: 34,
    padding: "0 11px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 13,
    color: "#222",
    background: "#fff",
    outline: "none",
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <input
        type="text"
        placeholder="Search issue or worker…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{ ...inputStyle, flex: "1 1 180px", minWidth: 160 }}
      />
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        style={inputStyle}
      >
        <option value="">All statuses</option>
        <option value="succeeded">Succeeded</option>
        <option value="failed">Failed</option>
      </select>
      <select
        value={type}
        onChange={(e) => onType(e.target.value)}
        style={inputStyle}
      >
        <option value="">All actions</option>
        <option value="ADD_COMMENT">Add Jira comment</option>
        <option value="SEND_EMAIL">Send manager email</option>
      </select>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        style={inputStyle}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="duration_desc">Slowest first</option>
        <option value="duration_asc">Fastest first</option>
      </select>
    </div>
  );
}

function Pagination({ page, totalPages, total, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  const btnStyle = (disabled) => ({
    height: 30,
    padding: "0 12px",
    border: "1px solid #e0e0e0",
    borderRadius: 7,
    background: "#fff",
    color: disabled ? "#ccc" : "#333",
    fontSize: 13,
    cursor: disabled ? "default" : "pointer",
    fontWeight: 500,
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        fontSize: 13,
        color: "#888",
      }}
    >
      <span>
        {total} result{total !== 1 ? "s" : ""}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={btnStyle(page === 1)}
          onClick={onPrev}
          disabled={page === 1}
        >
          ← Prev
        </button>
        <span style={{ fontSize: 13, color: "#666", padding: "0 4px" }}>
          {page} / {totalPages}
        </span>
        <button
          style={btnStyle(page >= totalPages)}
          onClick={onNext}
          disabled={page >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── skeleton loader ─────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ebebeb",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#f0f0f0",
          flexShrink: 0,
        }}
      />
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
      >
        <div
          style={{
            height: 13,
            width: "35%",
            background: "#f3f3f3",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            height: 11,
            width: "55%",
            background: "#f7f7f7",
            borderRadius: 6,
          }}
        />
      </div>
      <div
        style={{
          width: 80,
          height: 22,
          background: "#f3f3f3",
          borderRadius: 20,
        }}
      />
    </div>
  );
}

//main page

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await client.get("/executions");
        setExecutions(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load executions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let d = [...executions];
    if (q)
      d = d.filter(
        (x) =>
          (x.issueKey || "").toLowerCase().includes(q) ||
          (x.workerId || "").toLowerCase().includes(q),
      );
    if (status) d = d.filter((x) => x.status === status);
    if (type) d = d.filter((x) => x.type === type);
    if (sort === "oldest")
      d.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === "duration_desc")
      d.sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));
    else if (sort === "duration_asc")
      d.sort((a, b) => (a.durationMs ?? 0) - (b.durationMs ?? 0));
    else d.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return d;
  }, [executions, search, status, type, sort]);

  const stats = useMemo(() => {
    const total = executions.length;
    const succ = executions.filter((x) => x.status === "succeeded").length;
    const fail = executions.filter((x) => x.status === "failed").length;
    const avgMs = total
      ? Math.round(
          executions.reduce((s, x) => s + (x.durationMs ?? 0), 0) / total,
        )
      : 0;
    return { total, succ, fail, avgMs };
  }, [executions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  if (error)
    return (
      <div style={{ padding: "32px 0" }}>
        <div
          style={{
            background: "#fdecea",
            border: "1px solid #fbc8c8",
            borderRadius: 12,
            padding: "16px 20px",
            color: "#b71c1c",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Execution history
        </h1>
        <p
          style={{ fontSize: 14, color: "#888", marginTop: 5, marginBottom: 0 }}
        >
          Review completed automation attempts, worker outcomes, and failure
          details.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <StatCard label="Total runs" value={loading ? "—" : stats.total} />
        <StatCard
          label="Succeeded"
          value={loading ? "—" : stats.succ}
          color="#2e7d32"
        />
        <StatCard
          label="Failed"
          value={loading ? "—" : stats.fail}
          color="#b71c1c"
        />
        <StatCard
          label="Avg duration"
          value={loading ? "—" : `${stats.avgMs.toLocaleString()} ms`}
        />
      </div>

      <ControlBar
        search={search}
        onSearch={handleFilterChange(setSearch)}
        status={status}
        onStatus={handleFilterChange(setStatus)}
        type={type}
        onType={handleFilterChange(setType)}
        sort={sort}
        onSort={handleFilterChange(setSort)}
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 0",
            color: "#bbb",
            fontSize: 14,
          }}
        >
          No executions match your filters.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {paginated.map((ex) => (
            <ExecutionRow key={ex._id} execution={ex} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
