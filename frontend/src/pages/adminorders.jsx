import React, { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  createTheme,
  ThemeProvider,
  Paper,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import PendingIcon from '@mui/icons-material/Pending';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Enhanced theme with modern design
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
    },
    background: {
      default: "#fff8f0",
      paper: "#ffffff",
    },
    success: {
      main: "#4caf50",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 4px 20px rgba(255, 140, 0, 0.08)",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(255, 140, 0, 0.15)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s ease',
        },
      },
    },
  },
});

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    Pending: { bg: '#fff3e0', text: '#e65100', icon: PendingIcon },
    Shipped: { bg: '#e3f2fd', text: '#1565c0', icon: LocalShippingOutlinedIcon },
    Delivered: { bg: '#e8f5e9', text: '#2e7d32', icon: CheckCircleIcon },
    Cancelled: { bg: '#ffebee', text: '#c62828', icon: CancelIcon },
    Completed: { bg: '#e8f5e9', text: '#1b5e20', icon: CheckCircleIcon },
  };
  return colors[status] || { bg: '#f5f5f5', text: '#666', icon: PendingIcon };
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/orders");
      if (data.success) {
        setOrders(data.orders);
      } else {
        showSnackbar("Failed to load orders", "error");
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to load orders", "error");
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
        showSnackbar("Order status updated successfully", "success");
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  // DataGrid columns configuration with flexible widths
  const columns = [
    {
      field: 'orderId',
      headerName: 'Order ID',
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={`#${params.row._id.slice(-6).toUpperCase()}`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: '#fff3e0',
            color: '#ff8c00',
            border: '2px solid #ff8c00',
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'user',
      headerName: 'Customer',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            {(params.row.userId?.username || params.row.userId?.email || 'U')[0].toUpperCase()}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {params.row.userId?.username || params.row.userId?.email || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Total',
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backgroundColor: '#e8f5e9',
            px: 1,
            py: 0.5,
            borderRadius: 2,
          }}
        >
          <AttachMoneyIcon sx={{ color: "success.main", fontSize: 16 }} />
          <Typography fontWeight={700} color="success.main" fontSize="0.85rem">
            ₱{params.value?.toFixed(2)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarTodayIcon sx={{ color: '#9e9e9e', fontSize: 14 }} />
          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
            {new Date(params.value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'itemsCount',
      headerName: 'Items',
      flex: 0.4,
      minWidth: 70,
      renderCell: (params) => (
        <Chip
          icon={<InventoryIcon sx={{ fontSize: 14 }} />}
          label={params.row.items?.length || 0}
          size="small"
          sx={{
            backgroundColor: '#fff3e0',
            color: '#ff8c00',
            fontWeight: 700,
            height: 24,
            '& .MuiChip-icon': {
              color: '#ff8c00',
            },
          }}
        />
      ),
    },
    {
      field: 'shipping',
      headerName: 'Shipping',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
            ₱{params.row.shippingFee}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Typography
            variant="body2"
            fontSize="0.85rem"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => {
        const statusConfig = getStatusColor(params.value);
        const StatusIcon = statusConfig.icon;
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={params.value}
              onChange={(e) => handleStatusChange(params.row._id, e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: statusConfig.bg,
                color: statusConfig.text,
                fontWeight: 600,
                fontSize: '0.8rem',
                '& .MuiSelect-select': {
                  py: 0.5,
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: `2px solid ${statusConfig.text}`,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: `2px solid ${statusConfig.text}`,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: `2px solid ${statusConfig.text}`,
                },
              }}
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StatusIcon sx={{ fontSize: 16 }} />
                  {value}
                </Box>
              )}
            >
              <MenuItem value="Pending">
                <PendingIcon sx={{ mr: 1, fontSize: 16 }} /> Pending
              </MenuItem>
              <MenuItem value="Shipped">
                <LocalShippingOutlinedIcon sx={{ mr: 1, fontSize: 16 }} /> Shipped
              </MenuItem>
              <MenuItem value="Delivered">
                <CheckCircleIcon sx={{ mr: 1, fontSize: 16 }} /> Delivered
              </MenuItem>
              <MenuItem value="Cancelled">
                <CancelIcon sx={{ mr: 1, fontSize: 16 }} /> Cancelled
              </MenuItem>
              <MenuItem value="Completed">
                <CheckCircleIcon sx={{ mr: 1, fontSize: 16 }} /> Completed
              </MenuItem>
            </Select>
          </FormControl>
        );
      },
    },
  ];

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ 
          backgroundColor: "background.default", 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          flexDirection: 'column',
          gap: 2,
        }}>
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            Loading orders...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <AdminHeader
          onLogout={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate("/login");
          }}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        {isSidebarOpen && (
          <Fade in={isSidebarOpen}>
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setIsSidebarOpen(false)}
            />
          </Fade>
        )}
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate("/login");
            }}
          />
          <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
            <Zoom in={true}>
              <Card 
                sx={{ 
                  maxWidth: 1600, 
                  mx: "auto", 
                  mt: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  {/* Header Section */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 4,
                    gap: 2,
                  }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(255, 140, 0, 0.3)',
                      }}
                    >
                      <ShoppingCartIcon sx={{ fontSize: 36, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{
                          background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.5,
                        }}
                      >
                        Order Management
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={500}>
                        Track and manage all customer orders
                      </Typography>
                    </Box>
                  </Box>

                  {/* Statistics Cards */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
                    gap: 2,
                    mb: 4,
                  }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(255, 140, 0, 0.3)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ShoppingCartIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Orders
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.total}
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(255, 152, 0, 0.3)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PendingIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Pending
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.pending}
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalShippingIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Shipped
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.shipped}
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Delivered
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {stats.delivered}
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(27, 94, 32, 0.3)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AttachMoneyIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Revenue
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        ₱{stats.revenue.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Orders Table */}
                  {orders.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        textAlign: "center",
                        py: 8,
                        borderRadius: 3,
                        border: '2px dashed #e0e0e0',
                      }}
                    >
                      <ShoppingCartIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Orders will appear here once customers make purchases
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        height: 650,
                        width: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid #f5f5f5',
                      }}
                    >
                      <DataGrid
                        rows={orders}
                        columns={columns}
                        getRowId={(row) => row._id}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 10 },
                          },
                        }}
                        pageSizeOptions={[5, 10, 25, 50]}
                        disableSelectionOnClick
                        disableColumnMenu
                        sx={{
                          border: 'none',
                          '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f5f5f5',
                            py: 1.5,
                            px: 1.5,
                          },
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#fff8f0',
                            borderBottom: '2px solid #ff8c00',
                            minHeight: '56px !important',
                            '& .MuiDataGrid-columnHeaderTitle': {
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              color: '#ff8c00',
                            },
                          },
                          '& .MuiDataGrid-row': {
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: '#fff8f0',
                              transform: 'scale(1.001)',
                            },
                          },
                          '& .MuiDataGrid-footerContainer': {
                            borderTop: '2px solid #ff8c00',
                            backgroundColor: '#fff8f0',
                          },
                          '& .MuiDataGrid-virtualScroller': {
                            overflowX: 'hidden',
                          },
                        }}
                      />
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Box>
        </Box>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default AdminOrders;