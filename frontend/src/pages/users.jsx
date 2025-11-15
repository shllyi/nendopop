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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Fade,
} from "@mui/material";
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

    return (
      <Avatar
        src={avatarUrl}
        alt={user.username}
        sx={{
          width: 48,
          height: 48,
          bgcolor: avatarUrl ? 'transparent' : '#ff8c00',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {!avatarUrl && initials}
      </Avatar>
    );
  };

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

                {status && (
                  <Alert
                    severity={status.includes("error") ? "error" : "info"}
                    sx={{ mb: 3 }}
                  >
                    {status}
                  </Alert>
                )}

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#fff8f0" }}>
                        <TableCell sx={{ fontWeight: 600, color: "#ff8c00" }}>Avatar</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#ff8c00" }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#ff8c00" }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#ff8c00" }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#ff8c00" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#ff8c00" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((u) => (
                          <TableRow
                            key={u._id}
                            sx={{
                              '&:hover': { backgroundColor: '#fff8f0' },
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <TableCell sx={{ textAlign: "center" }}>
                              {renderAvatar(u)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{u.username}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Chip
                                icon={u.isAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                                label={u.isAdmin ? "Admin" : "User"}
                                color={u.isAdmin ? "primary" : "default"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={u.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                label={u.isActive ? "Active" : "Deactivated"}
                                color={u.isActive ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => toggleActive(u._id)}
                                  sx={{
                                    borderColor: u.isActive ? "#f44336" : "#4caf50",
                                    color: u.isActive ? "#f44336" : "#4caf50",
                                    '&:hover': {
                                      borderColor: u.isActive ? "#d32f2f" : "#388e3c",
                                      backgroundColor: u.isActive ? "#ffebee" : "#e8f5e8",
                                    },
                                  }}
                                >
                                  {u.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => toggleRole(u._id)}
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
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                            <Typography color="text.secondary" variant="h6">
                              No users found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Users;
