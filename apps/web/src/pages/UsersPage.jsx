import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatRole, formatDepartment } from "../styles/tokens";

const departmentOptions = [
  { value: "", label: "Not assigned" },
  { value: "warehouse", label: "Warehouse" },
  { value: "mechanic", label: "Mechanic" },
  { value: "body_shop", label: "Body Shop" },
  { value: "painting", label: "Painting" },
  { value: "inspection", label: "Inspection" },
  { value: "customer_service", label: "Customer Service" },
];

const roleColors = {
  admin: { background: "#f0f0ff", color: "#3a3ab0", border: "#c8c8f0" },
  manager: { background: "#f0faf0", color: "#2d7a2d", border: "#b8e0b8" },
  staff: { background: "#f5f5f5", color: "#555", border: "#e5e5e5" },
};

// sub components

function SkeletonRow() {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      {[40, 60, 30].map((w, i) => (
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

function RoleBadge({ role }) {
  const c = roleColors[role] ?? roleColors.staff;
  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "20px",
        background: c.background,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {formatRole(role)}
    </span>
  );
}

function UserCard({ u, onRoleChange, onDepartmentChange, onActiveChange }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <div>
          <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: "15px" }}>
            {u.name}
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            {u.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <RoleBadge role={u.role} />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "20px",
              background: u.active ? "#f0faf0" : "#fff5f5",
              color: u.active ? "#2d7a2d" : "#c0392b",
              border: `1px solid ${u.active ? "#b8e0b8" : "#f3c2c2"}`,
            }}
          >
            {u.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Department row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <span style={{ fontSize: "13px", color: "#666", whiteSpace: "nowrap" }}>
          Department:
        </span>
        <select
          value={u.department || ""}
          onChange={(e) => onDepartmentChange(u._id, e.target.value)}
          style={{
            fontSize: "13px",
            padding: "4px 8px",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {departmentOptions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["staff", "manager", "admin"].map((role) => (
          <button
            key={role}
            onClick={() => onRoleChange(u._id, role)}
            disabled={u.role === role}
            style={{
              padding: "5px 12px",
              fontSize: "13px",
              borderRadius: "6px",
              cursor: u.role === role ? "default" : "pointer",
              border: "1px solid #e5e5e5",
              background: u.role === role ? "#f5f5f5" : "#fff",
              color: u.role === role ? "#999" : "#1a1a1a",
            }}
          >
            {formatRole(role)}
          </button>
        ))}

        <button
          onClick={() => onActiveChange(u._id, !u.active)}
          style={{
            padding: "5px 12px",
            fontSize: "13px",
            borderRadius: "6px",
            cursor: "pointer",
            border: `1px solid ${u.active ? "#f3c2c2" : "#b8e0b8"}`,
            background: u.active ? "#fff5f5" : "#f0faf0",
            color: u.active ? "#c0392b" : "#2d7a2d",
            marginLeft: "auto",
          }}
        >
          {u.active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

//  main Component

export default function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await client.get("/auth/users");
      setUsers(res.data.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRoleChange = async (id, role) => {
    try {
      setError("");
      await client.patch(`/auth/users/${id}/role`, { role });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleDepartmentChange = async (id, department) => {
    try {
      setError("");
      await client.patch(`/auth/users/${id}/department`, { department });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update department.");
    }
  };

  const handleActiveChange = async (id, active) => {
    try {
      setError("");
      await client.patch(`/auth/users/${id}/active`, { active });
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update account status.",
      );
    }
  };

  if (user?.role !== "admin") {
    return (
      <div
        style={{
          background: "#fff5f5",
          border: "1px solid #f3c2c2",
          borderRadius: "10px",
          padding: "16px",
          color: "#c0392b",
          fontSize: "14px",
        }}
      >
        Only admins can access this page.
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>User Administration</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Manage platform access, user roles, and account status for internal
        users.
      </p>

      {error && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #f3c2c2",
            borderRadius: "8px",
            padding: "12px 14px",
            color: "#c0392b",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px" }}>
          All Users{" "}
          {!loading && (
            <span style={{ fontWeight: 400, color: "#999", fontSize: "14px" }}>
              ({users.length})
            </span>
          )}
        </h2>

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[...Array(3)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>No users found.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {users.map((u) => (
              <UserCard
                key={u._id}
                u={u}
                onRoleChange={handleRoleChange}
                onDepartmentChange={handleDepartmentChange}
                onActiveChange={handleActiveChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
