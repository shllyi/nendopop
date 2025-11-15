import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import ChangePasswordOtp from "../components/ChangePasswordOtp";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

function AdminProfile({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", address: "", phone: "", gender: "", password: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initialUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (initialUser) {
      setForm((prev) => ({ ...prev,
        username: initialUser.username || "",
        email: initialUser.email || "",
        firstName: initialUser.firstName || "",
        lastName: initialUser.lastName || "",
        address: initialUser.address || "",
        phone: initialUser.phone || "",
        gender: initialUser.gender || "",
      }));
      const initialAvatarUrl = initialUser?.avatar?.url || initialUser?.avatarUrl || "";
      if (initialAvatarUrl) setAvatarPreview(initialAvatarUrl);
    }
  }, [user]);

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview("");
    }
  };
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      let responseUser = null;
      let avatarBase64;
      if (avatarFile) {
        avatarBase64 = await fileToBase64(avatarFile);
      }
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        userId: storedUser?._id,
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phone: form.phone,
        gender: form.gender,
        ...(form.password ? { password: form.password } : {}),
        ...(avatarBase64 ? { avatar: avatarBase64 } : {}),
      };
      const { data } = await apiClient.put("/api/v1/auth/profile", payload);
      responseUser = data?.user;
      if (data?.warning) setStatus(data.warning + " — other fields saved ✅");
      if (responseUser) {
        localStorage.setItem("user", JSON.stringify(responseUser));
        const newAvatarUrl = responseUser?.avatar?.url;
        if (newAvatarUrl) setAvatarPreview(newAvatarUrl);
      } else {
        const merged = { ...(user || {}), ...form };
        delete merged.password;
        if (!avatarFile && avatarPreview) {
          merged.avatar = { ...(merged.avatar || {}), url: avatarPreview };
          merged.avatarUrl = avatarPreview;
        }
        localStorage.setItem("user", JSON.stringify(merged));
      }
      setStatus("Saved ✅");
    } catch (err) {
      setStatus(err.response?.data?.message || "Save failed");
    }
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
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
          <Box sx={{ py: 6, maxWidth: "800px", mx: "auto", px: 2, flex: 1 }}>
            <Card elevation={3} sx={{ p: 4, backgroundColor: "#ffffff" }}>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    mb: 4,
                    "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem", textTransform: "none" },
                    "& .Mui-selected": { color: "#ff8c00 !important" },
                    "& .MuiTabs-indicator": { bgcolor: "#ff8c00", height: 3 },
                  }}
                >
                  <Tab label="Profile" value="profile" />
                  <Tab label="Change Password" value="password" />
                </Tabs>

                {activeTab === 'profile' && (
                  <>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff8c00", mb: 3, textAlign: "center" }}>
                      Admin Profile
                    </Typography>

                    <form className="col" onSubmit={handleSubmit}>
                      {/* Avatar */}
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Avatar
                          src={avatarPreview}
                          sx={{ width: 96, height: 96, mr: 3 }}
                        >
                          {!avatarPreview && "No avatar"}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{
                              borderColor: "#ff8c00",
                              color: "#ff8c00",
                              "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                            }}
                          >
                            Upload Avatar
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleAvatar}
                            />
                          </Button>
                        </Box>
                      </Box>

                      {/* User Info */}
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#ff8c00",
                            },
                            "&:hover fieldset": {
                              borderColor: "#e67e00",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#ff8c00",
                            },
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#ff8c00",
                            },
                            "&:hover fieldset": {
                              borderColor: "#e67e00",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#ff8c00",
                            },
                          },
                        }}
                      />

                      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "#ff8c00",
                              },
                              "&:hover fieldset": {
                                borderColor: "#e67e00",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#ff8c00",
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "#ff8c00",
                              },
                              "&:hover fieldset": {
                                borderColor: "#e67e00",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#ff8c00",
                              },
                            },
                          }}
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "#ff8c00",
                            },
                            "&:hover fieldset": {
                              borderColor: "#e67e00",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#ff8c00",
                            },
                          },
                        }}
                      />

                      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: "#ff8c00",
                              },
                              "&:hover fieldset": {
                                borderColor: "#e67e00",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#ff8c00",
                              },
                            },
                          }}
                        />
                        <FormControl fullWidth>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            label="Gender"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "#ff8c00",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#e67e00",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#ff8c00",
                                },
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em>Select gender</em>
                            </MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="nonbinary">Non-binary</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Save button */}
                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{
                          backgroundColor: "#ff8c00",
                          py: 1.5,
                          fontSize: "1rem",
                          "&:hover": { backgroundColor: "#e67e00" },
                          "&:disabled": { backgroundColor: "#ccc" },
                        }}
                      >
                        {status === "Saving..." ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Save Profile"}
                      </Button>

                      {status && status !== "Saving..." && (
                        <Alert
                          severity={status.includes("✅") ? "success" : "error"}
                          sx={{ mt: 3 }}
                        >
                          {status}
                        </Alert>
                      )}

                      {/* Logout button */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogout}
                        sx={{
                          backgroundColor: "#f44336",
                          py: 1.5,
                          fontSize: "1rem",
                          mt: 2,
                          "&:hover": { backgroundColor: "#d32f2f" },
                        }}
                      >
                        Logout
                      </Button>
                    </form>
                  </>
                )}

                {activeTab === 'password' && (
                  <Box sx={{ mt: 2 }}>
                    <ChangePasswordOtp user={user} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
export default AdminProfile;


