import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

function formatRole(role) {
  switch (role) {
    case "staff":
      return "Staff";
    case "manager":
      return "Manager";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

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
      setError(err.response?.data?.message || "Failed to load users");
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
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleActiveChange = async (id, active) => {
    try {
      setError("");
      await client.patch(`/auth/users/${id}/active`, { active });
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update account status",
      );
    }
  };

  if (loading) return <p>Loading users...</p>;

  if (user?.role !== "admin") {
    return <p style={{ color: "red" }}>Only admins can access this page.</p>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>User Administration</h1>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Manage platform access, user roles, and account status for internal
        users.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {users.map((u) => (
              <div
                key={u._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Name:</strong> {u.name}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Email:</strong> {u.email}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Role:</strong> {formatRole(u.role)}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Status:</strong> {u.active ? "Active" : "Inactive"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "12px",
                  }}
                >
                  <button onClick={() => handleRoleChange(u._id, "staff")}>
                    Set as Staff
                  </button>
                  <button onClick={() => handleRoleChange(u._id, "manager")}>
                    Set as Manager
                  </button>
                  <button onClick={() => handleRoleChange(u._id, "admin")}>
                    Set as Admin
                  </button>

                  {u.active ? (
                    <button onClick={() => handleActiveChange(u._id, false)}>
                      Deactivate Account
                    </button>
                  ) : (
                    <button onClick={() => handleActiveChange(u._id, true)}>
                      Activate Account
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
