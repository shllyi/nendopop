import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
});

export default function ChangePasswordOtp({ user }) {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser?.email) setEmail(currentUser.email);
  }, [user]);

  // Client-side validations
  useEffect(() => {
    const errs = { current: '', next: '', confirm: '' };
    if (!currentPassword) errs.current = 'Enter your current password';
    if (newPassword && newPassword.length < 8) errs.next = 'New password must be at least 8 characters';
    if (confirmPassword && confirmPassword !== newPassword) errs.confirm = "Passwords don't match";
    setErrors(errs);
  }, [currentPassword, newPassword, confirmPassword]);

  const formValid = Boolean(
    email && currentPassword && newPassword.length >= 8 && confirmPassword === newPassword &&
    !errors.current && !errors.next && !errors.confirm
  );

  const handleRequestOtp = async () => {
    setStatus('');
    setLoading(true);
    try {
  await apiClient.post(`/api/v1/auth/password-otp/request`, { currentPassword });
      // Open OTP modal
      setShowModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      if (msg.toLowerCase().includes('current password')) {
        setErrors((e) => ({ ...e, current: 'Current password is incorrect' }));
      }
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndChange = async (e) => {
    e?.preventDefault?.();
    setOtpError('');
    setStatus('');
    setLoading(true);
    try {
  const { data } = await apiClient.post(`/api/v1/auth/password-otp/verify`, { otp, newPassword });
      setStatus(data?.message || 'Password updated successfully');
      // Reset state
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP';
      setOtpError(msg);
      // Auto-close the modal after a brief delay
      setTimeout(() => {
        setShowModal(false);
        setOtpError('');
        setOtp('');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 520, mx: "auto" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff8c00", mb: 3, textAlign: "center" }}>
          Change Password
        </Typography>

        <TextField
          fullWidth
          label="Email"
          value={email}
          InputProps={{ readOnly: true }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#ff8c00",
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={!!errors.current}
          helperText={errors.current}
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
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={!!errors.next}
          helperText={errors.next}
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
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!errors.confirm}
          helperText={errors.confirm}
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

        <Button
          fullWidth
          variant="contained"
          onClick={handleRequestOtp}
          disabled={!formValid || loading}
          sx={{
            backgroundColor: "#ff8c00",
            py: 1.5,
            fontSize: "1rem",
            "&:hover": { backgroundColor: "#e67e00" },
            "&:disabled": { backgroundColor: "#ccc" },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Change Password"}
        </Button>

        {status && (
          <Alert
            severity={status.includes("successfully") ? "success" : "error"}
            sx={{ mt: 3 }}
          >
            {status}
          </Alert>
        )}

        {/* OTP Dialog */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: "#ff8c00", fontWeight: 600 }}>
            Enter OTP
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              An OTP was sent to your email. Enter the code below.
            </Typography>
            <TextField
              fullWidth
              label="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!otpError}
              helperText={otpError}
              autoFocus
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
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setShowModal(false)}
              variant="outlined"
              sx={{
                borderColor: "#ff8c00",
                color: "#ff8c00",
                "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyOtpAndChange}
              variant="contained"
              disabled={loading || !otp}
              sx={{
                backgroundColor: "#ff8c00",
                "&:hover": { backgroundColor: "#e67e00" },
                "&:disabled": { backgroundColor: "#ccc" },
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Verify"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
