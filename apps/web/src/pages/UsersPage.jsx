// admin only user management
//  change role
// activate and deactivate users

import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await client.get("/auth/users");
      setUsers(res.data.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "failed to load users");
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
      await client.patch(`/auth/users/${id}/role`, { role });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleActiveChange = async (id, active) => {
    try {
      await client.patch(`/auth/users/${id}/active`, { active });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "failed to update active state");
    }
  };

  if (loading) return <p>Loading users...</p>;

  if (user?.role !== "admin") {
    return <p style={{ color: "red" }}>Only admin can access this page.</p>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Users</h1>

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
                <p>
                  <strong>Name:</strong> {u.name}
                </p>
                <p>
                  <strong>Email:</strong> {u.email}
                </p>
                <p>
                  <strong>Role:</strong> {u.role}
                </p>
                <p>
                  <strong>Active:</strong> {u.active ? "Yes" : "No"}
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
                    Make Staff
                  </button>
                  <button onClick={() => handleRoleChange(u._id, "manager")}>
                    Make Manager
                  </button>
                  <button onClick={() => handleRoleChange(u._id, "admin")}>
                    Make Admin
                  </button>

                  {u.active ? (
                    <button onClick={() => handleActiveChange(u._id, false)}>
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => handleActiveChange(u._id, true)}>
                      Activate
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
