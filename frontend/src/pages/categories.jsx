import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

function Categories() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [archivedCategories, setArchivedCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => { fetchCategories(); }, []);
  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/categories");
      setCategories(data.categories || []);
    } catch (e) { setStatus("Failed to load categories"); }
  };

  const fetchArchivedCategories = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/categories/archived");
      setArchivedCategories(data.categories || []);
    } catch (e) { setStatus("Failed to load archived categories"); }
  };

  const navigate = useNavigate();
  const handleNavigate = (path) => navigate(path);
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openAddModal = () => {
    setEditCategory(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };
  const openEditModal = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name || '', description: cat.description || '' });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setForm({ name: '', description: '' });
    setEditCategory(null);
    setStatus("");
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      if (editCategory) {
        await apiClient.put(`/api/v1/categories/${editCategory._id}`, form);
        setStatus("Category updated ✅");
      } else {
        await apiClient.post("/api/v1/categories", form);
        setStatus("Category added ✅");
      }
      fetchCategories(); closeModal();
    } catch (err) { setStatus(err.response?.data?.message || "Save failed"); }
  };
  const handleArchive = async (cat) => {
    setStatus("Archiving...");
    try {
      await apiClient.put(`/api/v1/categories/${cat._id}/archive`);
      // Refresh both lists to keep UI in sync
      await fetchCategories();
      await fetchArchivedCategories();
      setStatus(cat.isArchived ? "Restored ✅" : "Archived ✅");
    } catch (err) { setStatus("Archive failed"); }
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
          <div className="card col" style={{ maxWidth: 700, margin: "32px auto" }}>
            <h1 className="text-center mb-16">Category Management</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div>
                <button className={"btn " + (activeTab === 'active' ? '' : 'outline')} onClick={() => setActiveTab('active')}>Active</button>
                <button className={"btn " + (activeTab === 'archived' ? '' : 'outline')} style={{ marginLeft: 8 }} onClick={async () => { setActiveTab('archived'); await fetchArchivedCategories(); }}>Archived</button>
              </div>
              <div style={{ flex: 1 }} />
              <button className="btn" onClick={openAddModal}>Add Category</button>
            </div>
            {status && <p style={{ color: '#f99' }}>{status}</p>}
            {activeTab === 'active' && (
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
                    {categories.map((cat) => (
                      <tr key={cat._id} style={{ borderBottom: '1px solid #222' }}>
                        <td>{cat.name}</td>
                        <td>{cat.description}</td>
                        <td>
                          <button className="btn outline" onClick={() => openEditModal(cat)} style={{ marginRight: 4 }}>Edit</button>
                          <button className="btn outline" onClick={() => handleArchive(cat)}>{cat.isArchived ? "Restore" : "Archive"}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'archived' && (
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
                        <td>
                          <button className="btn outline" onClick={() => handleArchive(cat)}>Restore</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {modalOpen && (<div className="backdrop" style={{ zIndex: 99 }} onClick={closeModal} />)}
            {modalOpen && (
              <div className="card col" style={{ zIndex: 100, position: "fixed", top: "10%", left: 0, right: 0, maxWidth: 420, margin: "auto", background: "#111", border: "2px solid #444" }}>
                <h2>{editCategory ? "Edit Category" : "Add Category"}</h2>
                <form onSubmit={handleSubmit} className="col">
                  <label>Name<input name="name" className="input" value={form.name} onChange={handleFormChange} required /></label>
                  <label>Description<input name="description" className="input" value={form.description} onChange={handleFormChange} /></label>
                  <button className="btn mt-16" type="submit">{editCategory ? "Save Changes" : "Add Category"}</button>
                  <button type="button" className="btn outline" onClick={closeModal}>Cancel</button>
                  {status && <p className="text-center mt-16" style={{ fontSize: "0.875rem", color: '#f99' }}>{status}</p>}
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default Categories;
