  import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(255, 140, 0, 0.25)",
          },
        },
      },
    },
  },
});

function Users() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/users");
      setUsers(data.users || []);
    } catch (e) {
      showSnackbar("Failed to load users", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleActive = async (id) => {
    try {
      await apiClient.put(`/api/v1/users/${id}/toggle-active`);
      fetchUsers();
      showSnackbar("User status updated", "success");
    } catch {
      showSnackbar("Activation error", "error");
    }
  };

  const toggleRole = async (id) => {
    try {
      await apiClient.put(`/api/v1/users/${id}/toggle-role`);
      fetchUsers();
      showSnackbar("User role updated", "success");
    } catch {
      showSnackbar("Role change error", "error");
    }
  };

  // DataGrid columns configuration
  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      renderCell: (params) => {
        const avatarUrl = params.row?.avatar?.url || params.row?.avatarUrl;
        const initials = params.row?.username?.[0]?.toUpperCase() || "?";

        return (
          <Avatar
            src={avatarUrl}
            alt={params.row.username}
            sx={{
              width: 40,
              height: 40,
              bgcolor: avatarUrl ? 'transparent' : '#ff8c00',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {!avatarUrl && initials}
          </Avatar>
        );
      },
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      renderCell: (params) => (
        <Typography fontWeight={500}>{params.value}</Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'isAdmin',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <AdminPanelSettingsIcon /> : <PersonIcon />}
          label={params.value ? "Admin" : "User"}
          color={params.value ? "primary" : "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon /> : <CancelIcon />}
          label={params.value ? "Active" : "Deactivated"}
          color={params.value ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => toggleActive(params.row._id)}
            sx={{
              borderColor: params.row.isActive ? "#f44336" : "#4caf50",
              color: params.row.isActive ? "#f44336" : "#4caf50",
              '&:hover': {
                borderColor: params.row.isActive ? "#d32f2f" : "#388e3c",
                backgroundColor: params.row.isActive ? "#ffebee" : "#e8f5e8",
              },
            }}
          >
            {params.row.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => toggleRole(params.row._id)}
            sx={{
              borderColor: "#ff8c00",
              color: "#ff8c00",
              '&:hover': {
                borderColor: "#e67e00",
                backgroundColor: "#fff3e0",
              },
            }}
          >
            Change Role
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%)",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <AdminHeader
          onLogout={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />

        <Box sx={{ display: 'flex', flex: 1 }}>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={() => {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate('/login');
            }}
          />

          <Box sx={{ py: 6, maxWidth: "1200px", mx: "auto", px: 2, flex: 1 }}>
            <Card elevation={3} sx={{ p: 4, backgroundColor: "#ffffff" }}>
              <CardContent>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: "#ff8c00", mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff8c00" }}>
                    Users Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage user accounts and permissions
                  </Typography>
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row._id}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    disableSelectionOnClick
                    sx={{
                      border: 'none',
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f0f0f0',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#fff8f0',
                        borderBottom: '2px solid #ff8c00',
                        '& .MuiDataGrid-columnHeaderTitle': {
                          fontWeight: 600,
                          color: '#ff8c00',
                        },
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#fff8f0',
                      },
                      '& .MuiDataGrid-footerContainer': {
                        borderTop: '2px solid #ff8c00',
                        backgroundColor: '#fff8f0',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Users;