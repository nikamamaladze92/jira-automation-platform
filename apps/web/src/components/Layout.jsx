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

        <nav style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Link to="/">Overview</Link>
          <Link to="/tickets">Create Ticket</Link>
          <Link to="/rules">Automation Rules</Link>
          <Link to="/executions">Execution History</Link>
          <Link to="/events">Event Stream</Link>
          <Link to="/demo">Demo Trigger</Link>
          {user?.role === "admin" && <Link to="/users">User Admin</Link>}
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
