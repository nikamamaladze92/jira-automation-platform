import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "48px", margin: "0 0 8px", color: "#1a1a1a" }}>
        404
      </h1>
      <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
        This page doesn't exist.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 24px",
          fontSize: "14px",
          fontWeight: 600,
          background: "#1a1a1a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Go to Overview
      </button>
    </div>
  );
}
