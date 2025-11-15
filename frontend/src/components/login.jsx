import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import apiClient from "../api/client";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";

const schema = yup.object({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

// Custom theme matching cart's orange palette
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
  },
});

const Login = ({ setUser }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "success" });

  const onSubmit = async (data) => {
    try {
      const { data: response } = await apiClient.post("/api/v1/auth/login", data);

      if (response.success) {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        setUser(response.user);

        // Redirect to target if provided (preserve intended destination), else role-based
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          navigate(redirect);
        } else if (response.user.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Login failed",
        severity: "error"
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Simple Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%)",
          borderBottom: "1px solid rgba(255, 140, 0, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 8px rgba(255, 140, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* NendoPop Brand */}
          <Button
            onClick={() => navigate('/')}
            sx={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              border: 'none',
              fontWeight: 800,
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textTransform: 'none',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            NendoPop
          </Button>

          {/* Auth Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "rgba(255, 140, 0, 0.04)",
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: "primary.main",
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              }}
            >
              Register
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          background: "linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%)",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Card
          elevation={12}
          sx={{
            maxWidth: 450,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            background: "linear-gradient(145deg, #ffffff 0%, #fefefe 100%)",
            border: "2px solid rgba(255, 140, 0, 0.1)",
            boxShadow: "0 20px 40px rgba(255, 140, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #ff8c00 0%, #ffa500 50%, #ff8c00 100%)",
            },
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  boxShadow: "0 8px 24px rgba(255, 140, 0, 0.3)",
                  animation: "bounce 2s infinite",
                  "@keyframes bounce": {
                    "0%, 20%, 50%, 80%, 100%": {
                      transform: "translateY(0)",
                    },
                    "40%": {
                      transform: "translateY(-10px)",
                    },
                    "60%": {
                      transform: "translateY(-5px)",
                    },
                  },
                }}
              >
                <LoginIcon sx={{ fontSize: 36, color: "#fff" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  mb: 1,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Welcome Back! 🎉
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                {...register("email")}
                type="email"
                label="Email Address"
                variant="outlined"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 140, 0, 0.3)",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 3px rgba(255, 140, 0, 0.1)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 4px rgba(255, 140, 0, 0.15)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    fontWeight: 600,
                    "&.Mui-focused": {
                      color: "primary.main",
                    },
                  },
                }}
              />

              <TextField
                {...register("password")}
                type="password"
                label="Password"
                variant="outlined"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 140, 0, 0.3)",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 3px rgba(255, 140, 0, 0.1)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 4px rgba(255, 140, 0, 0.15)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "text.secondary",
                    fontWeight: 600,
                    "&.Mui-focused": {
                      color: "primary.main",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{
                  mt: 3,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)",
                  borderRadius: 3,
                  boxShadow: "0 4px 15px rgba(255, 140, 0, 0.3)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "left 0.5s",
                  },
                  "&:hover": {
                    background: "linear-gradient(135deg, #e67e00 0%, #ff8c00 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(255, 140, 0, 0.4)",
                    "&::before": {
                      left: "100%",
                    },
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Let's Go!
              </Button>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "1rem" }}>
                  New to NendoPop? Join the fun!
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: "primary.main",
                    color: "primary.main",
                    borderWidth: 2,
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor: "rgba(255, 140, 0, 0.08)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(255, 140, 0, 0.2)",
                    },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: '100%',
              fontSize: '1rem',
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 2,
              minWidth: 300,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
