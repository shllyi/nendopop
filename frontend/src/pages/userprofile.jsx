import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import apiClient from "../api/client";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
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

const schema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  address: yup.string().required("Address is required"),
  phone: yup.string().matches(/^\+?\d{7,15}$/, "Invalid phone number format (7-15 digits)").optional(),
  gender: yup.string(),
});

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [status, setStatus] = useState("");

  // 🧠 Load current user info
  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (currentUser) {
      setValue("username", currentUser.username || "");
      setValue("email", currentUser.email || "");
      setValue("firstName", currentUser.firstName || "");
      setValue("lastName", currentUser.lastName || "");
      setValue("address", currentUser.address || "");
      setValue("phone", currentUser.phone || "");
      setValue("gender", currentUser.gender || "");
      const avatarUrl = currentUser?.avatar?.url || currentUser?.avatarUrl || "";
      if (avatarUrl) setAvatarPreview(avatarUrl);
    } else {
      navigate("/login");
    }
  }, [user, navigate, setValue]);

  // 🧩 Convert file → base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 🖼️ Handle avatar selection
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

  // 💾 Handle Save
  const onSubmit = async (data) => {
    setStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let avatarBase64;
      if (avatarFile) avatarBase64 = await fileToBase64(avatarFile);

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        userId: storedUser?._id,
        ...data,
        ...(avatarBase64 ? { avatar: avatarBase64 } : {}),
      };

      const { data: response } = await apiClient.put(`/api/v1/auth/profile`, payload, { headers });

      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setAvatarPreview(response.user?.avatar?.url || avatarPreview);
      }

      setStatus("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      setStatus(error.response?.data?.message || "Failed to update profile ❌");
    }
  };

  // 🚪 Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/login");
  };

  // 🔍 Handle search
  const handleSearch = (query) => {
    console.log("Searching:", query);
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
        {/* 🧭 Header */}
        <UserHeader onLogout={handleLogout} onSearch={handleSearch} />

        {/* Content */}
        <Box sx={{ py: 6, maxWidth: "800px", mx: "auto", px: 2 }}>
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
                    My Profile
                  </Typography>

                  <form onSubmit={handleSubmit(onSubmit)}>
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
                      {...register("username")}
                      error={!!errors.username}
                      helperText={errors.username?.message}
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
                      {...register("email")}
 ion                     error={!!errors.email}
                      helperText={errors.email?.message}
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
                        {...register("firstName")}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
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
                        {...register("lastName")}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
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
                      {...register("address")}
                      error={!!errors.address}
                      helperText={errors.address?.message}
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
                        {...register("phone")}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
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
                          {...register("gender")}
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
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default UserProfile;