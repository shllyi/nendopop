import React, { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/orders");
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      const { data } = await apiClient.put(
        `/api/v1/orders/${orderId}/status`,
        { status: nextStatus }
      );
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="container">Loading orders...</div>;

  if (error)
    return (
      <div className="container" style={{ color: "#f99" }}>
        {error}
      </div>
    );

  return (
    <div>
      <AdminHeader
        onLogout={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate("/login");
        }}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate("/login");
        }}
      />
      <div className="container" style={{ padding: 16 }}>
      <h2 className="mb-16">Admin Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Order</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>User</th>
                <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #333" }}>Total</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Placed</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Items</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Shipping</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Address</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Phone</th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #333" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>#{order._id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                    {order.userId?.username || order.userId?.email || "-"}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222", textAlign: "right" }}>
                    ₱{order.totalAmount?.toFixed(2)}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                    {order.items?.length || 0}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                    {order.shipping} (₱{order.shippingFee})
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {order.address}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                    {order.phone}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="input"
                      style={{ maxWidth: 180 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminOrders;


