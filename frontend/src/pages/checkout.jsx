import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import apiClient from "../api/client";
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

function Checkout() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Get cart and user data from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Update shipping fee when selection changes
  useEffect(() => {
    switch (shipping) {
      case "Luzon":
        setShippingFee(50);
        break;
      case "Visayas":
        setShippingFee(90);
        break;
      case "Mindanao":
        setShippingFee(110);
        break;
      case "International":
        setShippingFee(200);
        break;
      default:
        setShippingFee(0);
    }
  }, [shipping]);

  const totalAmount = subtotal + shippingFee;

  const handleCheckout = async () => {
    if (!address || !phone || !shipping) {
      setStatus("⚠️ Please fill in all fields");
      return;
    }

    if (!user) {
      setStatus("⚠️ Please log in first");
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post("/api/v1/orders", {
        userId: user._id,
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        address,
        phone,
        shipping,
        shippingFee,
      });

      if (data.success) {
        setStatus("✅ Order placed successfully!");
        localStorage.removeItem("cart");
        setTimeout(() => {
          navigate('/user/home');
        }, 1500);
      } else {
        setStatus("❌ Failed to place order");
      }
    } catch (err) {
      setStatus(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
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
        <UserHeader
          onLogout={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
          onProfile={() => {
            navigate('/user/profile');
          }}
          onCart={() => {
            navigate('/user/cart');
          }}
          onHome={() => {
            navigate('/user/orders');
          }}
        />

        <Box sx={{ py: 6, maxWidth: "600px", mx: "auto", px: 2 }}>
          <Card elevation={3} sx={{ p: 4, backgroundColor: "#ffffff" }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff8c00", mb: 3, textAlign: "center" }}>
                Checkout
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Subtotal: <strong>₱{subtotal.toFixed(2)}</strong>
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Shipping Location</InputLabel>
                <Select
                  value={shipping}
                  label="Shipping Location"
                  onChange={(e) => setShipping(e.target.value)}
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
                    <em>Select Location</em>
                  </MenuItem>
                  <MenuItem value="Luzon">Luzon - ₱50</MenuItem>
                  <MenuItem value="Visayas">Visayas - ₱90</MenuItem>
                  <MenuItem value="Mindanao">Mindanao - ₱110</MenuItem>
                  <MenuItem value="International">International - ₱200</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Shipping Fee: <strong>₱{shippingFee.toFixed(2)}</strong>
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff8c00" }}>
                  Total: ₱{totalAmount.toFixed(2)}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Address"
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
                label="Phone Number"
                placeholder="Enter contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                size="large"
                onClick={handleCheckout}
                disabled={loading}
                sx={{
                  backgroundColor: "#ff8c00",
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": { backgroundColor: "#e67e00" },
                  "&:disabled": { backgroundColor: "#ccc" },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Place Order"}
              </Button>

              {status && (
                <Alert
                  severity={status.includes("✅") ? "success" : status.includes("⚠️") ? "warning" : "error"}
                  sx={{ mt: 3 }}
                >
                  {status}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Checkout;
