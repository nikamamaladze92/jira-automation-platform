import { useEffect, useState } from "react";
import client from "../api/client";
import Summary from "../components/Summary";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await client.get("/dashboard/summary");
        setSummary(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) return <p>Loading dashboard</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        <Summary title="Total Jobs" value={summary.jobs.total} />
        <Summary title="Queued Jobs" value={summary.jobs.queued} />
        <Summary title="Processing Jobs" value={summary.jobs.processing} />
        <Summary title="Failed Jobs" value={summary.jobs.failed} />
        <Summary title="Succeeded Jobs" value={summary.jobs.succeeded} />
        <Summary title="Executions" value={summary.executions.total} />
        <Summary title="Rules" value={summary.rules.total} />
        <Summary title="Enabled Rules" value={summary.rules.enabled} />
        <Summary title="Events" value={summary.events.total} />
      </div>
    </div>
  );
}
