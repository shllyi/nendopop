import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
  Button
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import apiClient from "../api/client";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff8c00",
      light: "#ffa500",
      dark: "#e67e00",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ffa500",
      light: "#ffb733",
      dark: "#cc8400",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    success: {
      main: "#4caf50",
    },
    error: {
      main: "#f44336",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  },
});

const COLORS = ['#ff8c00', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiClient.get(`/api/v1/dashboard/all?${params.toString()}`);

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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
          <AdminHeader
            onLogout={handleLogout}
            onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          />
          <Container maxWidth={false} sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={60} sx={{ color: 'primary.main' }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Loading dashboard data...
              </Typography>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
          <AdminHeader
            onLogout={handleLogout}
            onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          />
          <Container maxWidth={false} sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                Unable to load dashboard
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                size="large"
              >
                Retry
              </Button>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  const stats = dashboardData?.stats || {};
  const monthlySales = dashboardData?.monthlySales || [];
  const dailySales = dashboardData?.dailySales || [];
  const categoryDistribution = dashboardData?.categoryDistribution || [];
  const orderStatusDistribution = dashboardData?.orderStatusDistribution || [];
  const revenueByCategory = dashboardData?.revenueByCategory || [];
  const mostOrderedProducts = dashboardData?.mostOrderedProducts || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
        <AdminHeader
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Container maxWidth="xl">
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Welcome back, <strong>{user?.username || 'Admin'}</strong>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user?.email || ''}
                </Typography>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card elevation={2}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                        ₱{(stats.totalSales || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Total Sales
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card elevation={2}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <ShoppingCartIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                        {stats.totalOrders || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Total Orders
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card elevation={2}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <PeopleIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 0.5 }}>
                        {stats.totalUsers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Total Users
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card elevation={2}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', mb: 0.5 }}>
                        {stats.totalProducts || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Total Products
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Sales Analytics Section */}
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                Sales Analytics
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Monthly Sales Chart */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Monthly Sales Trend
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Year</InputLabel>
                          <Select
                            value={selectedYear}
                            label="Year"
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          >
                            {Array.from({ length: 5 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return <MenuItem key={year} value={year}>{year}</MenuItem>;
                            })}
                          </Select>
                        </FormControl>
                      </Box>
                      {monthlySales.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={monthlySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                              formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              stroke="#ff8c00"
                              strokeWidth={3}
                              name="Monthly Sales"
                              dot={{ fill: '#ff8c00', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">No sales data for this year</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Daily Sales Chart */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Daily Sales Overview
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <TextField
                            type="date"
                            label="Start"
                            size="small"
                            value={dailyStartDate}
                            onChange={(e) => setDailyStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                          />
                          <TextField
                            type="date"
                            label="End"
                            size="small"
                            value={dailyEndDate}
                            onChange={(e) => setDailyEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                          />
                        </Box>
                      </Box>
                      {dailySales.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={dailySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                              formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              stroke="#00C49F"
                              strokeWidth={3}
                              name="Daily Sales"
                              dot={{ fill: '#00C49F', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">No daily sales data</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Business Insights Section */}
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                Business Insights
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Category Distribution */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Product Categories
                      </Typography>
                      {categoryDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <PieChart>
                            <Pie
                              data={categoryDistribution}
                              dataKey="count"
                              nameKey="_id"
                              cx="50%"
                              cy="50%"
                              outerRadius={110}
                              label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {categoryDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={40} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">No category data</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Order Status Distribution */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Order Status Overview
                      </Typography>
                      {orderStatusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={orderStatusDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Orders" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">No order status data</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Revenue Analysis Section */}
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                Revenue Analysis
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Revenue by Category
                      </Typography>
                      {revenueByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={revenueByCategory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="_id" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#00C49F" name="Revenue" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">No revenue data</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tables Section */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Most Ordered Products */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Top 10 Products
                      </Typography>
                      {mostOrderedProducts.length > 0 ? (
                        <Box sx={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Product</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Qty</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mostOrderedProducts.map((product, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                  <td style={{ padding: '12px', fontSize: '13px' }}>{product.name}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 500 }}>{product.totalQuantity}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: 500, color: '#00C49F' }}>₱{product.totalRevenue.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">No product data</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Low Stock Products */}
                <Grid item xs={12} lg={6}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WarningIcon sx={{ color: 'error.main', mr: 1, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                          Low Stock Alert
                        </Typography>
                      </Box>
                      {lowStockProducts.length > 0 ? (
                        <Box sx={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#fff5f5' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Product</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Category</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lowStockProducts.map((product, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                  <td style={{ padding: '12px', fontSize: '13px' }}>{product.name}</td>
                                  <td style={{ padding: '12px', fontSize: '13px' }}>{product.category}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#d32f2f', fontSize: '13px' }}>
                                    {product.stock}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography color="text.secondary">All products well stocked</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;