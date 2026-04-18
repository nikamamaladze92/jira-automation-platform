//main layout
// users link for admin only

// Main layout
// Purpose:
// - shared navigation/header
// - cleaner product-style navigation

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "12px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Jira Automation Platform</h2>
          <p style={{ margin: "4px 0 0", color: "#666" }}>
            Internal operations dashboard for ticket automation
          </p>
        </div>

        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>
            Overview
          </Link>

          <Link to="/tickets" style={{ marginRight: "15px" }}>
            Create Ticket
          </Link>

          {(user?.role === "manager" || user?.role === "admin") && (
            <Link to="/rules" style={{ marginRight: "15px" }}>
              Automation Rules
            </Link>
          )}

          {user?.role === "admin" && (
            <>
              <Link to="/jobs" style={{ marginRight: "15px" }}>
                Automation Jobs
              </Link>

              <Link to="/executions" style={{ marginRight: "15px" }}>
                Execution History
              </Link>

              <Link to="/events" style={{ marginRight: "15px" }}>
                Events
              </Link>

              <Link to="/demo" style={{ marginRight: "15px" }}>
                Demo
              </Link>

              <Link to="/users" style={{ marginRight: "15px" }}>
                User Admin
              </Link>
            </>
          )}
        </nav>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span>{user ? `${user.name} (${user.role})` : "Not logged in"}</span>
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
