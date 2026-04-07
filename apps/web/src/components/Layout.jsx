//main layout

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

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
        }}
      >
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link to="/">Dashboard</Link>
          <Link to="/rules">Rules</Link>
          <Link to="/tickets">Tickets</Link>
        </nav>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span>{user ? `${user.name} (${user.role})` : "Not logged in"}</span>
          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
