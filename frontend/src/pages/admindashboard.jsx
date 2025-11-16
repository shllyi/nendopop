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
  Button,
  Chip,
  Avatar,
  Divider
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import apiClient from "../api/client";

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
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#3b82f6",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
  },
});

const COLORS = ['#ff8c00', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const StatCard = ({ icon: Icon, value, label, color, trend, trendValue }) => (
  <Card 
    elevation={0} 
    sx={{ 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`,
      position: 'relative',
      overflow: 'visible',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: color, 
            width: 56, 
            height: 56,
            boxShadow: `0 8px 16px ${color}40`,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Avatar>
        {trend && (
          <Chip 
            icon={trend === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
            label={trendValue}
            size="small"
            sx={{ 
              bgcolor: trend === 'up' ? '#10b98115' : '#ef444415',
              color: trend === 'up' ? '#10b981' : '#ef4444',
              fontWeight: 600,
              border: `1px solid ${trend === 'up' ? '#10b98130' : '#ef444430'}`,
            }}
          />
        )}
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color: color, mb: 0.5, fontSize: '2rem' }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
        {label}
      </Typography>
    </CardContent>
  </Card>
);

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>
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
            <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Unable to load dashboard</Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                size="large"
                sx={{ px: 4 }}
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
          <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 4 } }}>
            <Container maxWidth={false} sx={{ maxWidth: '100%', px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
              {/* Header Section */}
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography 
                      variant="h3" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 800, 
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                      }}
                    >
                      Dashboard Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Welcome back, <strong>{user?.username || 'Admin'}</strong> • {user?.email || ''}
                    </Typography>
                  </Box>
                  <Chip 
                    label={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      fontWeight: 600,
                      px: 2,
                      py: 2.5,
                      fontSize: '0.875rem',
                    }}
                  />
                </Box>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    icon={TrendingUpIcon}
                    value={`₱${(stats.totalSales || 0).toLocaleString()}`}
                    label="Total Sales"
                    color="#ff8c00"
                    trend="up"
                    trendValue="+12.5%"
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    icon={ShoppingCartIcon}
                    value={stats.totalOrders || 0}
                    label="Total Orders"
                    color="#10b981"
                    trend="up"
                    trendValue="+8.2%"
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    icon={PeopleIcon}
                    value={stats.totalUsers || 0}
                    label="Total Users"
                    color="#3b82f6"
                    trend="up"
                    trendValue="+5.7%"
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    icon={InventoryIcon}
                    value={stats.totalProducts || 0}
                    label="Total Products"
                    color="#8b5cf6"
                  />
                </Grid>
              </Grid>

              {/* Sales Analytics Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 4, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Sales Analytics
                </Typography>
                
                {/* Monthly Sales Chart - Full Width */}
                <Card elevation={0} sx={{ width: '100%', mb: 3 }}>
                  <CardContent sx={{ p: 4, pb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                          Monthly Sales Trend
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Track your monthly performance
                        </Typography>
                      </Box>
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
                    <Divider sx={{ mb: 3 }} />
                    {monthlySales.length > 0 ? (
                      <Box sx={{ width: '100%', height: 500 }}>
                        <ResponsiveContainer>
                          <LineChart data={monthlySales} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ff8c00" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 14, fill: '#6b7280' }}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14, fill: '#6b7280' }} 
                              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                              axisLine={false}
                            />
                            <Tooltip
                              formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              stroke="#ff8c00"
                              strokeWidth={4}
                              name="Monthly Sales"
                              dot={{ fill: '#ff8c00', r: 6, strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 8 }}
                              fill="url(#colorSales)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No sales data for this year</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Daily Sales Chart */}
                <Card elevation={0} sx={{ width: '100%' }}>
                  <CardContent sx={{ p: 4, pb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                          Daily Sales Overview
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Day-by-day sales breakdown
                        </Typography>
                      </Box>
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
                    <Divider sx={{ mb: 3 }} />
                    {dailySales.length > 0 ? (
                      <Box sx={{ width: '100%', height: 500 }}>
                        <ResponsiveContainer>
                          <LineChart data={dailySales} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorDailySales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="_id" 
                              tick={{ fontSize: 12, fill: '#6b7280' }} 
                              angle={-45} 
                              textAnchor="end" 
                              height={80}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14, fill: '#6b7280' }} 
                              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                              axisLine={false}
                            />
                            <Tooltip
                              formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales']}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sales"
                              stroke="#10b981"
                              strokeWidth={4}
                              name="Daily Sales"
                              dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 8 }}
                              fill="url(#colorDailySales)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No daily sales data</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Business Insights Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 4, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Business Insights
                </Typography>
                
                {/* Category Distribution */}
                <Card elevation={0} sx={{ width: '100%', mb: 3 }}>
                  <CardContent sx={{ p: 4, pb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Product Categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Distribution of products by category
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    {categoryDistribution.length > 0 ? (
                      <Box sx={{ width: '100%', height: 500 }}>
                        <ResponsiveContainer>
                          <PieChart margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <Pie
                              data={categoryDistribution}
                              dataKey="count"
                              nameKey="_id"
                              cx="50%"
                              cy="50%"
                              outerRadius={150}
                              label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                              labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                            >
                              {categoryDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No category data</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Order Status Distribution */}
                <Card elevation={0} sx={{ width: '100%' }}>
                  <CardContent sx={{ p: 4, pb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Order Status Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Current status of all orders
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    {orderStatusDistribution.length > 0 ? (
                      <Box sx={{ width: '100%', height: 500 }}>
                        <ResponsiveContainer>
                          <BarChart data={orderStatusDistribution} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="_id" 
                              tick={{ fontSize: 13, fill: '#6b7280' }} 
                              angle={-45} 
                              textAnchor="end" 
                              height={80}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14, fill: '#6b7280' }}
                              axisLine={false}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#3b82f6" 
                              name="Orders" 
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No order status data</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Revenue Analysis Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 4, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Revenue Analysis
                </Typography>
                <Card elevation={0} sx={{ width: '100%' }}>
                  <CardContent sx={{ p: 4, pb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Revenue by Category
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Total revenue generated per category
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    {revenueByCategory.length > 0 ? (
                      <Box sx={{ width: '100%', height: 500 }}>
                        <ResponsiveContainer>
                          <BarChart data={revenueByCategory} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="_id" 
                              tick={{ fontSize: 13, fill: '#6b7280' }} 
                              angle={-45} 
                              textAnchor="end" 
                              height={80}
                              axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis 
                              tick={{ fontSize: 14, fill: '#6b7280' }} 
                              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                              axisLine={false}
                            />
                            <Tooltip 
                              formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              }}
                            />
                            <Bar 
                              dataKey="revenue" 
                              fill="#10b981" 
                              name="Revenue" 
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No revenue data</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Tables Section */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ width: 4, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
                  Product Performance
                </Typography>
                <Grid container spacing={3}>
                  {/* Most Ordered Products */}
                  <Grid item xs={12} lg={6}>
                    <Card elevation={0}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Top 10 Products
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Best performing products by sales
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        {mostOrderedProducts.length > 0 ? (
                          <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '13px', color: '#374151' }}>Product</th>
                                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: '13px', color: '#374151' }}>Qty</th>
                                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, fontSize: '13px', color: '#374151' }}>Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mostOrderedProducts.map((product, index) => (
                                  <tr 
                                    key={index} 
                                    style={{ 
                                      borderBottom: '1px solid #f3f4f6',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <td style={{ padding: '16px 8px', fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box 
                                          sx={{ 
                                            width: 8, 
                                            height: 8, 
                                            borderRadius: '50%', 
                                            bgcolor: COLORS[index % COLORS.length],
                                            flexShrink: 0,
                                          }}
                                        />
                                        {product.name}
                                      </Box>
                                    </td>
                                    <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>
                                      {product.totalQuantity}
                                    </td>
                                    <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
                                      ₱{product.totalRevenue.toLocaleString()}
                                    </td>
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
                    <Card 
                      elevation={0}
                      sx={{
                        border: '2px solid',
                        borderColor: 'error.light',
                        background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <WarningIcon sx={{ color: 'error.main', mr: 1, fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                            Low Stock Alert
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Products requiring restock attention
                        </Typography>
                        <Divider sx={{ mb: 3, borderColor: 'error.light' }} />
                        {lowStockProducts.length > 0 ? (
                          <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '2px solid #fecaca' }}>
                                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '13px', color: '#991b1b' }}>Product</th>
                                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: '13px', color: '#991b1b' }}>Category</th>
                                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, fontSize: '13px', color: '#991b1b' }}>Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lowStockProducts.map((product, index) => (
                                  <tr 
                                    key={index} 
                                    style={{ 
                                      borderBottom: '1px solid #fee2e2',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <td style={{ padding: '16px 8px', fontSize: '13px', color: '#1f2937', fontWeight: 500 }}>
                                      {product.name}
                                    </td>
                                    <td style={{ padding: '16px 8px', fontSize: '13px', color: '#6b7280' }}>
                                      <Chip 
                                        label={product.category}
                                        size="small"
                                        sx={{ 
                                          bgcolor: '#fef3c7',
                                          color: '#92400e',
                                          fontWeight: 600,
                                          fontSize: '11px',
                                        }}
                                      />
                                    </td>
                                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                      <Chip 
                                        label={product.stock}
                                        size="small"
                                        sx={{ 
                                          bgcolor: '#fee2e2',
                                          color: '#991b1b',
                                          fontWeight: 700,
                                          fontSize: '12px',
                                          minWidth: 50,
                                        }}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Box>
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Box 
                              sx={{ 
                                width: 56, 
                                height: 56, 
                                borderRadius: '50%', 
                                bgcolor: 'success.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                mb: 2,
                              }}
                            >
                              <InventoryIcon sx={{ color: 'success.main', fontSize: 28 }} />
                            </Box>
                            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                              All products well stocked
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;