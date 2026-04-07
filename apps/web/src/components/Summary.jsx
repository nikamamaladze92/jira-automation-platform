export default function Summary({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "20px",
        minWidth: "180px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{title}</p>
      <h2 style={{ margin: "8px 0 0", fontSize: "28px" }}>{value}</h2>
    </div>
  );
}
