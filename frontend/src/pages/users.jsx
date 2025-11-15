import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

function Users() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/users");
      setUsers(data.users || []);
    } catch (e) {
      setStatus("Failed to load users");
    }
  };

  const toggleActive = async (id) => {
    try {
      await apiClient.put(`/api/v1/users/${id}/toggle-active`);
      fetchUsers();
    } catch {
      setStatus("Activation error");
    }
  };

  const toggleRole = async (id) => {
    try {
      await apiClient.put(`/api/v1/users/${id}/toggle-role`);
      fetchUsers();
    } catch {
      setStatus("Role change error");
    }
  };

  // Helper: avatar or fallback
  const renderAvatar = (user) => {
    const avatarUrl = user?.avatar?.url || user?.avatarUrl;
    const initials = user?.username?.[0]?.toUpperCase() || "?";

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={user.username}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid #333",
          }}
        />
      );
    } else {
      return (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#222",
            color: "#bbb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            fontWeight: "bold",
            border: "1px solid #333",
          }}
        >
          {initials}
        </div>
      );
    }
  };

  return (
    <div>
      <AdminHeader
        onLogout={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
        }}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />

      {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}

      <div className="row" style={{ alignItems: "flex-start" }}>
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
        />

        <main className="container" style={{ padding: 16 }}>
          <div className="card col" style={{ maxWidth: 900, margin: "32px auto" }}>
            <h1 className="text-center mb-16">Users Management</h1>
            {status && <p style={{ color: "#f99" }}>{status}</p>}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#111", borderBottom: "1px solid #333" }}>
                    <th>Avatar</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: "1px solid #222" }}>
                        <td style={{ padding: "8px", textAlign: "center" }}>{renderAvatar(u)}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.isAdmin ? "Admin" : "User"}</td>
                        <td>{u.isActive ? "Active" : "Deactivated"}</td>
                        <td>
                          <button
                            className="btn outline"
                            onClick={() => toggleActive(u._id)}
                            style={{ marginRight: 4 }}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn outline" onClick={() => toggleRole(u._id)}>
                            Change Role
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "16px" }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Users;
