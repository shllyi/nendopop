import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

function Archives() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [archivedCategories, setArchivedCategories] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchArchives();
  }, []);
  const fetchArchives = async () => {
    try {
      // Categories: backend endpoint
      const { data: catData } = await apiClient.get("/api/v1/categories/archived");
      setArchivedCategories(catData.categories || []);
    } catch (e) { setStatus("Failed to load archives"); }
  };
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  const restoreCategory = async (c) => {
    setStatus("Restoring category...");
    try {
      await apiClient.put(`/api/v1/categories/${c._id}/archive`);
      fetchArchives();
      setStatus("Category restored ✅");
    } catch (err) { setStatus("Category restore failed"); }
  };

  return (
    <div>
      <AdminHeader
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}
      <div className="row" style={{ alignItems: "flex-start" }}>
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className="container" style={{ padding: 16 }}>
          <button className="btn outline mb-16" onClick={()=>window.location.href='/admin/categories'}>Back to Categories</button>
          <div className="card col" style={{ maxWidth: 900, margin: "32px auto" }}>
            <h1 className="text-center mb-16">Archived Categories</h1>
            {status && <p style={{ color: '#f99' }}>{status}</p>}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: '#111', borderBottom: '1px solid #333' }}>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedCategories.map((cat) => (
                    <tr key={cat._id} style={{ borderBottom: '1px solid #222' }}>
                      <td>{cat.name}</td>
                      <td>{cat.description}</td>
                      <td><button className="btn outline" onClick={() => restoreCategory(cat)}>Restore</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Archives;

