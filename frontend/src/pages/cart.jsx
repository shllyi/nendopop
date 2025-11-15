import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import apiClient from "../api/client";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Zoom,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Fade,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

function Cart() {
  const [cart, setCart] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await apiClient.get("/api/v1/products");
        const isArchivedFlag = (p) => {
          if (!p) return false;
          const v = p.isArchived;
          return v === true || v === "true" || v === 1 || v === "1";
        };
        const activeProducts = (data.products || []).filter((p) => !isArchivedFlag(p));
        setFeaturedProducts(activeProducts.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured products", err);
      }
    };
    fetchFeaturedProducts();
  }, []);

  // Save cart to localStorage
  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Show snackbar notification
  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Remove item from cart
  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    saveCart(updatedCart);
    showNotification("Item removed from cart", "info");
  };

  // Increase quantity
  const increaseQty = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updatedCart);
  };

  // Decrease quantity
  const decreaseQty = (id) => {
    const updatedCart = cart
      .map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
      .filter((item) => item.quantity > 0);
    saveCart(updatedCart);
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    showNotification(`${product.name} added to cart`, "success");
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
          onProfile={() => navigate('/user/userprofile')}
          onSearch={() => {}}
        />

        <Box sx={{ py: 6, maxWidth: "1200px", mx: "auto", px: 2 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: "#ff8c00", mb: 1 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: "#ff8c00", mb: 1 }}>
              Your Cart
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
            </Typography>
          </Box>

          {cart.length === 0 ? (
            // Empty cart state
            <Fade in={true}>
              <Box sx={{ textAlign: "center", py: 10 }}>
                <ShoppingCartIcon sx={{ fontSize: 100, color: "#e0e0e0", mb: 3 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Your cart is empty
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Add some products to get started!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/home')}
                  sx={{
                    backgroundColor: "#ff8c00",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": { backgroundColor: "#e67e00" },
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Fade>
          ) : (
            <Box sx={{ maxWidth: "900px", mx: "auto" }}>
              {/* Cart Items */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                {cart.map((item) => (
                  <Fade in={true} key={item._id}>
                    <Card
                      elevation={2}
                      sx={{
                        display: "flex",
                        p: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(255, 140, 0, 0.15)",
                        },
                      }}
                    >
                      {/* Product Image */}
                      <CardMedia
                        component="img"
                        image={item.images?.[0]?.url || "/placeholder.png"}
                        alt={item.name}
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />

                      {/* Product Details */}
                      <Box sx={{ flex: 1, ml: 3, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#ff8c00", fontWeight: 700 }}>
                            ₱{item.price.toLocaleString()}
                          </Typography>
                        </Box>

                        {/* Quantity Controls */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => decreaseQty(item._id)}
                            sx={{
                              border: "1px solid #ff8c00",
                              borderRadius: 1,
                              "&:hover": { backgroundColor: "#fff8f0" },
                            }}
                          >
                            <RemoveIcon sx={{ fontSize: 18, color: "#ff8c00" }} />
                          </IconButton>
                          <Typography variant="body1" sx={{ minWidth: 30, textAlign: "center", fontWeight: 600 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => increaseQty(item._id)}
                            sx={{
                              border: "1px solid #ff8c00",
                              borderRadius: 1,
                              "&:hover": { backgroundColor: "#fff8f0" },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 18, color: "#ff8c00" }} />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Price & Remove */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", ml: 2 }}>
                        <IconButton
                          onClick={() => removeItem(item._id)}
                          sx={{
                            color: "#f44336",
                            "&:hover": { backgroundColor: "#ffebee" },
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    </Card>
                  </Fade>
                ))}
              </Stack>

              {/* Total & Checkout */}
              <Card elevation={3} sx={{ p: 3, backgroundColor: "#fff8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#ff8c00", fontWeight: 700 }}>
                    ₱{total.toLocaleString()}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/home')}
                    sx={{
                      borderColor: "#ff8c00",
                      color: "#ff8c00",
                      px: 4,
                      "&:hover": { borderColor: "#e67e00", backgroundColor: "#fff8f0" },
                    }}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/checkout')}
                    sx={{
                      backgroundColor: "#4caf50",
                      px: 4,
                      "&:hover": { backgroundColor: "#388e3c" },
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </Stack>
              </Card>
            </Box>
          )}

          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <Box sx={{ mt: 8 }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 4, color: "#ff8c00", textAlign: "center" }}>
                You May Also Like
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  overflowX: "auto",
                  pb: 2,
                  "&::-webkit-scrollbar": { height: 8 },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "#ff8c00", borderRadius: 4 },
                }}
              >
                {featuredProducts.map((p) => {
                  const hasSecondImage = p.images && p.images.length > 1;
                  const stockCount = typeof p.stock === "number" ? p.stock : null;
                  const isInStock = stockCount != null ? stockCount > 0 : p.isInStock !== false;
                  const stockText = stockCount != null ? (stockCount > 0 ? `${stockCount} in stock` : "Out of stock") : (isInStock ? "In stock" : "Out of stock");
                  const isHovered = hoveredProductId === p._id;

                  return (
                    <Zoom in={true} key={p._id}>
                      <Card
                        onMouseEnter={() => setHoveredProductId(p._id)}
                        onMouseLeave={() => setHoveredProductId(null)}
                        onClick={() => navigate(`/product/${p._id}`)}
                        sx={{
                          minWidth: 280,
                          maxWidth: 280,
                          cursor: "pointer",
                          borderRadius: 3,
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          boxShadow: isHovered ? "0 12px 24px rgba(255,140,0,0.25)" : "0 2px 8px rgba(0,0,0,0.1)",
                          transform: isHovered ? "translateY(-8px)" : "none",
                        }}
                      >
                        <Box sx={{ position: "relative", height: 260 }}>
                          {hasSecondImage ? (
                            <>
                              <CardMedia
                                component="img"
                                image={p.images[0].url}
                                alt={p.name}
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "opacity 0.35s ease",
                                  opacity: isHovered ? 0 : 1,
                                }}
                              />
                              <CardMedia
                                component="img"
                                image={p.images[1].url}
                                alt={p.name}
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "opacity 0.35s ease",
                                  opacity: isHovered ? 1 : 0,
                                }}
                              />
                            </>
                          ) : (
                            <CardMedia
                              component="img"
                              image={p.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
                              alt={p.name}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                          <Chip
                            label={stockText}
                            size="small"
                            color={isInStock ? "success" : "error"}
                            sx={{
                              position: "absolute",
                              left: 12,
                              bottom: 12,
                              fontWeight: 500,
                              backdropFilter: "blur(4px)",
                            }}
                          />
                        </Box>

                        <CardContent>
                          <Tooltip title={p.name} arrow>
                            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ mb: 1 }}>
                              {p.name}
                            </Typography>
                          </Tooltip>
                          <Typography variant="h6" fontWeight={700} sx={{ color: "#ff8c00" }}>
                            ₱{(p.price || 0).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  );
                })}
              </Box>
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/home')}
                  sx={{
                    backgroundColor: "#ff8c00",
                    px: 5,
                    "&:hover": { backgroundColor: "#e67e00" },
                  }}
                >
                  View All Products
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Footer />

        {/* Enhanced Snackbar Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default Cart;