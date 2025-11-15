import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

function ArchivedProducts() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchArchives();
  }, []);
  const fetchArchives = async () => {
    try {
      // Products: backend returns all, so we filter here
      const { data: prodData } = await apiClient.get("/api/v1/products");
      setArchivedProducts((prodData.products || []).filter(p => p.isArchived));
    } catch (e) { setStatus("Failed to load archives"); }
  };
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  const restoreProduct = async (p) => {
    setStatus("Restoring product...");
    try {
      await apiClient.put(`/api/v1/products/${p._id}/archive`);
      fetchArchives();
      setStatus("Product restored ✅");
    } catch (err) { setStatus("Product restore failed"); }
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
          <button className="btn outline mb-16" onClick={()=>window.location.href='/admin/products'}>Back to Products</button>
          <div className="card col" style={{ maxWidth: 900, margin: "32px auto" }}>
            <h1 className="text-center mb-16">Archived Products</h1>
            {status && <p style={{ color: '#f99' }}>{status}</p>}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: '#111', borderBottom: '1px solid #333' }}>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedProducts.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #222' }}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.price}</td>
                      <td style={{ minWidth: 96 }}>
                        <div className="row" style={{ gap:2 }}>
                          {p.images && p.images.map((img, i) => (
                            <img key={i} src={img.url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #333' }} />
                          ))}
                        </div>
                      </td>
                      <td><button className="btn outline" onClick={() => restoreProduct(p)}>Restore</button></td>
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
export default ArchivedProducts;
