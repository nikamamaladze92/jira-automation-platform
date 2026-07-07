//main layout
// users link for admin only

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f7f8fa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1a1a1a",
  },
  header: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e5e5",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontWeight: 700,
    fontSize: "16px",
    color: "#1a1a1a",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
    marginLeft: "32px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    whiteSpace: "nowrap",
  },
  userName: {
    fontSize: "14px",
    color: "#666",
  },
  logoutBtn: {
    fontSize: "14px",
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    cursor: "pointer",
    color: "#1a1a1a",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 32px",
  },
};

function navLinkStyle({ isActive }) {
  return {
    fontSize: "14px",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#1a1a1a" : "#666",
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    backgroundColor: isActive ? "#f0f0f0" : "transparent",
    transition: "background-color 0.15s, color 0.15s",
  };
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <NavLink to="/" style={styles.brand}>
          Jira Automation
        </NavLink>

        <nav style={styles.nav}>
          <NavLink to="/" end style={navLinkStyle}>
            Overview
          </NavLink>

          <NavLink to="/tickets" style={navLinkStyle}>
            Create Ticket
          </NavLink>

          {(user?.role === "manager" || user?.role === "admin") && (
            <NavLink to="/rules" style={navLinkStyle}>
              Rules
            </NavLink>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink to="/jobs" style={navLinkStyle}>
                Jobs
              </NavLink>

              <NavLink to="/executions" style={navLinkStyle}>
                Executions
              </NavLink>

              <NavLink to="/events" style={navLinkStyle}>
                Events
              </NavLink>

              <NavLink to="/demo" style={navLinkStyle}>
                Demo
              </NavLink>

              <NavLink to="/users" style={navLinkStyle}>
                Users
              </NavLink>
            </>
          )}
        </nav>

        <div style={styles.userInfo}>
          {user && (
            <span style={styles.userName}>
              {user.name} · {user.role}
            </span>
          )}
          {user ? (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <NavLink to="/login" style={navLinkStyle}>
              Login
            </NavLink>
          )}
        </div>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}
