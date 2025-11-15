import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import apiClient from "../api/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyStartDate, setDailyStartDate] = useState('');
  const [dailyEndDate, setDailyEndDate] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters for date filtering
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        // Fetch all dashboard data at once
        const response = await apiClient.get(`/api/v1/dashboard/all?${params.toString()}`);

        console.log('Dashboard API Response:', response.data); // Debug log

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to load data');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate]);

  // Separate effect for monthly sales year filtering
  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const params = new URLSearchParams();
        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear + 1, 0, 1);
        params.append('startDate', yearStart.toISOString().split('T')[0]);
        params.append('endDate', yearEnd.toISOString().split('T')[0]);

        const response = await apiClient.get(`/api/v1/dashboard/monthly-sales?${params.toString()}`);
        if (response.data.success) {
          setDashboardData(prev => ({
            ...prev,
            monthlySales: response.data.salesData
          }));
        }
      } catch (error) {
        console.error('Failed to fetch monthly sales:', error);
      }
    };

    fetchMonthlySales();
  }, [selectedYear]);

  // Separate effect for daily sales filtering
  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const params = new URLSearchParams();
        if (dailyStartDate) params.append('startDate', dailyStartDate);
        if (dailyEndDate) params.append('endDate', dailyEndDate);

        const response = await apiClient.get(`/api/v1/dashboard/daily-sales?${params.toString()}`);
        if (response.data.success) {
          setDashboardData(prev => ({
            ...prev,
            dailySales: response.data.dailySales
          }));
        }
      } catch (error) {
        console.error('Failed to fetch daily sales:', error);
      }
    };

    if (dailyStartDate || dailyEndDate) {
      fetchDailySales();
    }
  }, [dailyStartDate, dailyEndDate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/login");
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <AdminHeader
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0088FE',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ fontSize: '18px', color: '#666' }}>Loading dashboard data...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <AdminHeader
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</p>
            <p style={{ fontSize: '18px', color: '#d32f2f', marginBottom: '16px' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                backgroundColor: '#0088FE',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe data access with defaults
  const stats = dashboardData?.stats || {};
  const monthlySales = dashboardData?.monthlySales || [];
  const dailySales = dashboardData?.dailySales || [];
  const categoryDistribution = dashboardData?.categoryDistribution || [];
  const orderStatusDistribution = dashboardData?.orderStatusDistribution || [];
  const revenueByCategory = dashboardData?.revenueByCategory || [];
  const mostOrderedProducts = dashboardData?.mostOrderedProducts || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];

  return (
    <div>
      <style>{`
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }
      `}</style>

      <AdminHeader
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      {isSidebarOpen && (
        <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className="row" style={{ alignItems: "flex-start" }}>
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className="container" style={{ padding: 16 }}>
          <div style={{ maxWidth: 1400, margin: "32px auto" }}>
            <h1 className="text-center mb-16">Admin Dashboard ⚙️</h1>
            <p className="text-center">Welcome back, <strong>{user?.username || 'Admin'}</strong> (Admin)</p>
            <p className="text-center mb-32">Email: {user?.email || ''}</p>



            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px',
              marginBottom: '32px' 
            }}>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Sales</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#0088FE' }}>
                  ₱{(stats.totalSales || 0).toLocaleString()}
                </p>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Orders</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#00C49F' }}>
                  {stats.totalOrders || 0}
                </p>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Users</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#FFBB28' }}>
                  {stats.totalUsers || 0}
                </p>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Products</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#FF8042' }}>
                  {stats.totalProducts || 0}
                </p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {/* Monthly Sales Chart */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: 'black' }}>Monthly Sales</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Year:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
                {monthlySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No sales data available
                  </div>
                )}
              </div>

              {/* Daily Sales Chart */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: 'black' }}>Sales Overview</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>From:</label>
                    <input
                      type="date"
                      value={dailyStartDate}
                      onChange={(e) => setDailyStartDate(e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>To:</label>
                    <input
                      type="date"
                      value={dailyEndDate}
                      onChange={(e) => setDailyEndDate(e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                </div>
                {dailySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="_id"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#00C49F" strokeWidth={2} name="Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No daily sales data available
                  </div>
                )}
              </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {/* Category Distribution */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', color: 'black' }}>Products by Category</h3>
                {categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry._id}: ${entry.count}`}
                      >
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No category data available
                  </div>
                )}
              </div>

              {/* Order Status Distribution */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', color: 'black' }}>Order Status Distribution</h3>
                {orderStatusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={orderStatusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No order status data available
                  </div>
                )}
              </div>
            </div>

            {/* Charts Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Revenue by Category */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', color: 'black' }}>Revenue by Category</h3>
                {revenueByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            {/* Tables Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '16px' }}>
              {/* Most Ordered Products */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', color: 'black' }}>Top 10 Most Ordered Products</h3>
                <div style={{ overflowX: 'auto' }}>
                  {mostOrderedProducts.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: 'black' }}>Product</th>
                          <th style={{ padding: '8px', textAlign: 'right', color: 'black' }}>Quantity</th>
                          <th style={{ padding: '8px', textAlign: 'right', color: 'black' }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mostOrderedProducts.map((product, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px', color: 'black' }}>{product.name}</td>
                            <td style={{ padding: '8px', textAlign: 'right', color: 'black' }}>{product.totalQuantity}</td>
                            <td style={{ padding: '8px', textAlign: 'right', color: 'black' }}>₱{product.totalRevenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No product data available
                    </div>
                  )}
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px', color: '#FF8042' }}>⚠️ Low Stock Products</h3>
                <div style={{ overflowX: 'auto' }}>
                  {lowStockProducts.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '8px', textAlign: 'left', color: 'black' }}>Product</th>
                          <th style={{ padding: '8px', textAlign: 'left', color: 'black' }}>Category</th>
                          <th style={{ padding: '8px', textAlign: 'right', color: 'black' }}>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px', color: 'black' }}>{product.name}</td>
                            <td style={{ padding: '8px', color: 'black' }}>{product.category}</td>
                            <td style={{
                              padding: '8px',
                              textAlign: 'right',
                              color: 'black',
                              fontWeight: 'bold'
                            }}>
                              {product.stock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No low stock products
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;