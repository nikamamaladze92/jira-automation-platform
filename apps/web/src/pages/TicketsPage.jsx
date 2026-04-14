// import { useState } from "react";
// import client from "../api/client";

// const departmentOptions = [
//   "warehouse",
//   "mechanic",
//   "body_shop",
//   "painting",
//   "inspection",
//   "customer_service",
// ];

// const initialForm = {
//   summary: "",
//   description: "",
//   priority: "High",
//   department: "warehouse",
// };

// export default function TicketsPage() {
//   const [form, setForm] = useState(initialForm);
//   const [createdTicket, setCreatedTicket] = useState(null);
//   const [ticketMetadata, setTicketMetadata] = useState(null);
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [rawResponse, setRawResponse] = useState(null);

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setCreatedTicket(null);
//     setTicketMetadata(null);
//     setRawResponse(null);

//     try {
//       setSubmitting(true);

//       const res = await client.post("/tickets", {
//         summary: form.summary.trim(),
//         description: form.description.trim(),
//         priority: form.priority,
//         department: form.department,
//       });

//       setRawResponse(res.data);
//       setCreatedTicket(res.data.data.ticket);
//       setTicketMetadata(res.data.data.metadata || null);
//       setForm(initialForm);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to create ticket");
//       setRawResponse(err.response?.data || null);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div>
//       <h1 style={{ marginBottom: "8px" }}>Create Ticket</h1>
//       <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
//         Create a Jira service ticket from a clean internal form.
//       </p>

//       <div
//         style={{
//           maxWidth: "700px",
//           background: "#fff",
//           border: "1px solid #e5e5e5",
//           borderRadius: "12px",
//           padding: "20px",
//         }}
//       >
//         <form
//           onSubmit={handleSubmit}
//           style={{ display: "flex", flexDirection: "column", gap: "12px" }}
//         >
//           <label>
//             <div style={{ marginBottom: "6px", fontWeight: 600 }}>Summary</div>
//             <input
//               name="summary"
//               placeholder="Brake inspection request"
//               value={form.summary}
//               onChange={handleChange}
//               required
//             />
//           </label>

//           <label>
//             <div style={{ marginBottom: "6px", fontWeight: 600 }}>
//               Description
//             </div>
//             <textarea
//               name="description"
//               placeholder="Customer reports brake noise during driving."
//               value={form.description}
//               onChange={handleChange}
//               rows={5}
//               required
//             />
//           </label>

//           <label>
//             <div style={{ marginBottom: "6px", fontWeight: 600 }}>Priority</div>
//             <select
//               name="priority"
//               value={form.priority}
//               onChange={handleChange}
//             >
//               <option value="Highest">Highest</option>
//               <option value="High">High</option>
//               <option value="Medium">Medium</option>
//               <option value="Low">Low</option>
//               <option value="Lowest">Lowest</option>
//             </select>
//           </label>

//           <label>
//             <div style={{ marginBottom: "6px", fontWeight: 600 }}>
//               Department
//             </div>
//             <select
//               name="department"
//               value={form.department}
//               onChange={handleChange}
//             >
//               {departmentOptions.map((department) => (
//                 <option key={department} value={department}>
//                   {department}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <button type="submit" disabled={submitting}>
//             {submitting ? "Creating..." : "Create Ticket"}
//           </button>
//         </form>

//         {error && (
//           <div
//             style={{
//               color: "red",
//               marginTop: "14px",
//               background: "#fff5f5",
//               border: "1px solid #f3c2c2",
//               borderRadius: "10px",
//               padding: "12px",
//             }}
//           >
//             <strong>Ticket creation failed:</strong>
//             <div style={{ marginTop: "6px" }}>{error}</div>
//           </div>
//         )}

//         {createdTicket && (
//           <div
//             style={{
//               marginTop: "18px",
//               padding: "14px",
//               background: "#f6fff6",
//               border: "1px solid #cdeccd",
//               borderRadius: "10px",
//             }}
//           >
//             <h3 style={{ marginTop: 0 }}>Ticket Created</h3>
//             <p style={{ margin: "6px 0" }}>
//               <strong>Key:</strong> {createdTicket.key}
//             </p>
//             <p style={{ margin: "6px 0" }}>
//               <strong>ID:</strong> {createdTicket.id}
//             </p>
//             {ticketMetadata && (
//               <>
//                 <p style={{ margin: "6px 0" }}>
//                   <strong>Priority:</strong> {ticketMetadata.priority}
//                 </p>
//                 <p style={{ margin: "6px 0" }}>
//                   <strong>Department:</strong> {ticketMetadata.department}
//                 </p>
//               </>
//             )}
//           </div>
//         )}

//         {rawResponse && (
//           <div
//             style={{
//               marginTop: "16px",
//               background: "#f8f8f8",
//               border: "1px solid #e5e5e5",
//               borderRadius: "8px",
//               padding: "10px",
//             }}
//           >
//             <strong>Latest API Response:</strong>
//             <pre
//               style={{
//                 marginTop: "8px",
//                 whiteSpace: "pre-wrap",
//                 wordBreak: "break-word",
//                 fontSize: "12px",
//               }}
//             >
//               {JSON.stringify(rawResponse, null, 2)}
//             </pre>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

//
//
//

import { useState } from "react";
import client from "../api/client";

const departmentOptions = [
  "warehouse",
  "mechanic",
  "body_shop",
  "painting",
  "inspection",
  "customer_service",
];

const initialForm = {
  summary: "",
  description: "",
  priority: "High",
  department: "warehouse",
};

export default function TicketsPage() {
  const [form, setForm] = useState(initialForm);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [ticketMetadata, setTicketMetadata] = useState(null);
  const [automationData, setAutomationData] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedTicket(null);
    setTicketMetadata(null);
    setAutomationData(null);
    setRawResponse(null);

    try {
      setSubmitting(true);

      const res = await client.post("/tickets", {
        summary: form.summary.trim(),
        description: form.description.trim(),
        priority: form.priority,
        department: form.department,
      });

      setRawResponse(res.data);
      setCreatedTicket(res.data.data.ticket);
      setTicketMetadata(res.data.data.metadata || null);
      setAutomationData(res.data.data.automation || null);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
      setRawResponse(err.response?.data || null);
    } finally {
      setSubmitting(false);
    }
  };

  const matchedRulesCount = automationData?.matchedRules?.length || 0;
  const jobsCreatedCount = automationData?.jobs?.length || 0;

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Create Ticket</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Create a Jira service ticket from a clean internal form and immediately
        evaluate automation rules.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "start",
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
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Summary
              </div>
              <input
                name="summary"
                placeholder="Brake inspection request"
                value={form.summary}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Description
              </div>
              <textarea
                name="description"
                placeholder="Customer reports brake noise during driving."
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </label>

            <label>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Priority
              </div>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            </label>

            <label>
              <div style={{ marginBottom: "6px", fontWeight: 600 }}>
                Department
              </div>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </form>

          {error && (
            <div
              style={{
                color: "red",
                marginTop: "14px",
                background: "#fff5f5",
                border: "1px solid #f3c2c2",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <strong>Ticket creation failed:</strong>
              <div style={{ marginTop: "6px" }}>{error}</div>
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
          <h2 style={{ marginTop: 0 }}>Creation Result</h2>

          {!createdTicket ? (
            <p style={{ color: "#666" }}>
              After you create a ticket, this panel will show the Jira issue key
              and the automation result.
            </p>
          ) : (
            <>
              <div
                style={{
                  marginTop: "8px",
                  padding: "14px",
                  background: "#f6fff6",
                  border: "1px solid #cdeccd",
                  borderRadius: "10px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Ticket Created</h3>
                <p style={{ margin: "6px 0" }}>
                  <strong>Key:</strong> {createdTicket.key}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>ID:</strong> {createdTicket.id}
                </p>
                {ticketMetadata && (
                  <>
                    <p style={{ margin: "6px 0" }}>
                      <strong>Priority:</strong> {ticketMetadata.priority}
                    </p>
                    <p style={{ margin: "6px 0" }}>
                      <strong>Department:</strong> {ticketMetadata.department}
                    </p>
                  </>
                )}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  background: "#f8fbff",
                  border: "1px solid #d5e6ff",
                  borderRadius: "10px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Automation Result</h3>
                <p style={{ margin: "6px 0" }}>
                  <strong>Duplicate Event:</strong>{" "}
                  {automationData?.duplicate ? "Yes" : "No"}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Matched Rules:</strong> {matchedRulesCount}
                </p>
                <p style={{ margin: "6px 0" }}>
                  <strong>Jobs Created:</strong> {jobsCreatedCount}
                </p>

                <div style={{ marginTop: "10px" }}>
                  <strong>Matched Rule Names:</strong>
                  {matchedRulesCount === 0 ? (
                    <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                      No rules matched this ticket.
                    </p>
                  ) : (
                    <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                      {automationData.matchedRules.map((rule) => (
                        <li key={rule.id}>{rule.name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ marginTop: "10px" }}>
                  <strong>Created Jobs:</strong>
                  {jobsCreatedCount === 0 ? (
                    <p style={{ margin: "6px 0 0 0", color: "#666" }}>
                      No jobs were created.
                    </p>
                  ) : (
                    <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                      {automationData.jobs.map((job) => (
                        <li key={job._id}>
                          {job.type} — {job.status} — {job.issueKey}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {rawResponse && (
            <div
              style={{
                marginTop: "16px",
                background: "#f8f8f8",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <strong>Latest API Response:</strong>
              <pre
                style={{
                  marginTop: "8px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
