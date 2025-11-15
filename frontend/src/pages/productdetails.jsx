import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  Rating,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Avatar,
  Divider,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Fade,
  Zoom,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Bolt as BoltIcon,
  Inventory as StockIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [tab, setTab] = useState(0);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [hoveredRelatedId, setHoveredRelatedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [dialog, setDialog] = useState({ open: false, title: "", message: "", type: "info", onConfirm: null });
  
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  // Notification helpers
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const showDialog = (title, message, type = "info", onConfirm = null) => {
    setDialog({ open: true, title, message, type, onConfirm });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseDialog = () => {
    setDialog({ ...dialog, open: false });
  };

  const handleDialogConfirm = () => {
    if (dialog.onConfirm) dialog.onConfirm();
    handleCloseDialog();
  };

  // API: GET /api/v1/products/:id/details
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/api/v1/products/${id}/details`);
      setProduct(data.product || null);
      setReviews(data.reviews || []);
      setRelatedProducts(data.relatedProducts || []);
    } catch (err) {
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Auto slideshow for product images
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);



  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  // API: POST /api/v1/products/:id/reviews
  const submitReview = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      showSnackbar("Please select a rating (1-5)", "warning");
      return;
    }
    try {
      let imgs = [];
      if (files.length > 0) {
        imgs = await Promise.all(files.map(fileToBase64));
      }
      await apiClient.post(`/api/v1/products/${id}/reviews`, {
        rating,
        comment,
        images: imgs,
      });
      setComment("");
      setFiles([]);
      setRating(0);
      await fetchProductDetails(); // Refresh all data
      showDialog("Review Submitted!", "Thank you for your feedback. Your review has been posted successfully.", "success");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to submit review", "error");
    }
  };



  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={60} sx={{ color: "#ff8c00" }} />
      </Box>
    );
  }

  if (!product) return <Typography>Product not found</Typography>;

  // Stock calculations
  const stockCount = typeof product.stock === "number" ? product.stock : null;
  const isInStock = stockCount != null ? stockCount > 0 : product.isInStock !== false;
  const stockLabel = stockCount != null ? (stockCount > 0 ? `Stock: ${stockCount}` : "No stock") : (isInStock ? "In stock" : "No stock");
  const outOfStock = !isInStock;

  // Add to cart - localStorage only
  const addToCart = (qty, { showAlert = true } = {}) => {
    if (outOfStock) {
      if (showAlert) showSnackbar("This product is currently out of stock", "error");
      return false;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    if (showAlert) {
      showSnackbar(`${product.name} (x${qty}) added to cart successfully! 🛒`, "success");
    }
    return true;
  };

  const handleAddToCart = () => {
    if (outOfStock) {
      showSnackbar("This product is currently out of stock", "error");
      return;
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setQuantity(qty);
    addToCart(qty, { showAlert: true });
  };

  const handleBuyNow = () => {
    if (outOfStock) {
      showSnackbar("This product is currently out of stock", "error");
      return;
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setQuantity(qty);
    const added = addToCart(qty, { showAlert: false });
    if (added) {
      showSnackbar("Redirecting to cart...", "info");
      setTimeout(() => navigate("/user/cart"), 800);
    }
  };

  const adjustQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, (parseInt(prev, 10) || 1) + delta));
  };

  return (
    <>
      <UserHeader
        onLogout={() => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
        }}
        onProfile={() => navigate("/user/userprofile")}
      />

      <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Card elevation={0} sx={{ borderRadius: 3, overflow: "hidden", mb: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <Grid container spacing={4} sx={{ p: 3 }}>
              {/* Product Images */}
              <Grid item xs={12} md={6}>
                <Box sx={{ position: "relative" }}>
                  {product.images && product.images.length > 0 ? (
                    <Fade in={true} timeout={500}>
                      <CardMedia
                        component="img"
                        image={product.images[currentImg]?.url}
                        alt={product.name}
                        sx={{ width: "100%", height: 450, objectFit: "cover", borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      />
                    </Fade>
                  ) : (
                    <Box sx={{ width: "100%", height: 450, bgcolor: "#e0e0e0", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography color="text.secondary">No Image Available</Typography>
                    </Box>
                  )}

                  <Chip
                    icon={<StockIcon />}
                    label={stockLabel}
                    color={isInStock ? "success" : "error"}
                    sx={{ position: "absolute", left: 16, bottom: 16, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                  />
                </Box>

                {/* Image thumbnails */}
                <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  {product.images && product.images.map((img, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={img.url}
                      alt={`preview ${i + 1}`}
                      onClick={() => setCurrentImg(i)}
                      sx={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        border: i === currentImg ? "3px solid #ff8c00" : "2px solid #e0e0e0",
                        transition: "all 0.2s",
                        "&:hover": { transform: "scale(1.05)", boxShadow: "0 4px 12px rgba(255,140,0,0.3)" },
                      }}
                    />
                  ))}
                </Stack>
              </Grid>

              {/* Product Info */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant="h4" fontWeight={700} color="text.primary">{product.name}</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ color: "#ff8c00" }}>₱{product.price.toFixed(2)}</Typography>
                  <Chip label={product.category} sx={{ width: "fit-content", bgcolor: "#fff3e0", color: "#ff8c00", fontWeight: 600 }} />
                  <Divider sx={{ my: 2 }} />

                  {/* Quantity selector */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quantity</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        onClick={() => adjustQuantity(-1)}
                        disabled={outOfStock}
                        sx={{ bgcolor: outOfStock ? "#e0e0e0" : "#ffe4b3", color: outOfStock ? "#999" : "#ff8c00", "&:hover": { bgcolor: outOfStock ? "#e0e0e0" : "#ffd699" } }}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        disabled={outOfStock}
                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                        sx={{ width: 80, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />

                      <IconButton
                        onClick={() => adjustQuantity(1)}
                        disabled={outOfStock}
                        sx={{ bgcolor: outOfStock ? "#e0e0e0" : "#ffe4b3", color: outOfStock ? "#999" : "#ff8c00", "&:hover": { bgcolor: outOfStock ? "#e0e0e0" : "#ffd699" } }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Average Rating */}
                  {reviews.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={avgRating} readOnly precision={0.1} size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {/* Action buttons */}
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<CartIcon />}
                      onClick={handleAddToCart}
                      disabled={outOfStock}
                      fullWidth
                      sx={{
                        bgcolor: "#ff8c00",
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#e67e00" },
                        "&:disabled": { bgcolor: "#ccc", color: "#666" },
                      }}
                    >
                      {outOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<BoltIcon />}
                      onClick={handleBuyNow}
                      disabled={outOfStock}
                      fullWidth
                      sx={{
                        borderColor: "#ff8c00",
                        color: "#ff8c00",
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        borderWidth: 2,
                        "&:hover": { borderWidth: 2, borderColor: "#e67e00", bgcolor: "#fff3e0" },
                        "&:disabled": { borderColor: "#ccc", color: "#666" },
                      }}
                    >
                      Buy Now
                    </Button>
                  </Stack>

                  {outOfStock && <Alert severity="error" sx={{ mt: 2 }}>This product is currently out of stock.</Alert>}
                </Stack>
              </Grid>
            </Grid>

            {/* Tabs Section */}
            <Box sx={{ px: 3, pb: 3 }}>
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem", textTransform: "none" },
                  "& .Mui-selected": { color: "#ff8c00 !important" },
                  "& .MuiTabs-indicator": { bgcolor: "#ff8c00", height: 3 },
                }}
              >
                <Tab label="Description" />
                <Tab label="Specifications" />
                <Tab label="Reviews" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {tab === 0 && <Typography variant="body1" color="text.secondary">{product.description || "No description available."}</Typography>}
                {tab === 1 && <Typography variant="body1" color="text.secondary">{product.specifications || "No specifications provided."}</Typography>}
                {tab === 2 && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight={600}>Customer Reviews</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={avgRating} readOnly precision={0.1} />
                        <Typography variant="body2" color="text.secondary">{avgRating} / 5 ({reviews.length})</Typography>
                      </Stack>
                    </Stack>

                    {reviews.length === 0 ? (
                      <Alert severity="info">No reviews yet.</Alert>
                    ) : (
                      <Stack spacing={2}>
                        {reviews.map((r) => (
                          <Card key={r._id} variant="outlined" sx={{ p: 2, borderRadius: 2, "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ bgcolor: "#ff8c00", width: 32, height: 32 }}>{(r.userId?.username || "U")[0].toUpperCase()}</Avatar>
                                <Typography fontWeight={600}>{r.userId?.username || "User"}</Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleDateString()}</Typography>
                            </Stack>

                            <Rating value={r.rating || 0} readOnly size="small" sx={{ mb: 1 }} />
                            {r.comment && <Typography variant="body2" color="text.secondary">{r.comment}</Typography>}

                            {r.images && r.images.length > 0 && (
                              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                                {r.images.map((img, i) => (
                                  <Box
                                    key={i}
                                    component="img"
                                    src={img.url}
                                    alt={`review ${i + 1}`}
                                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, cursor: "pointer", "&:hover": { transform: "scale(1.05)" }, transition: "transform 0.2s" }}
                                  />
                                ))}
                              </Stack>
                            )}
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Card>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: "#ff8c00" }}>You May Also Like</Typography>
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
                {relatedProducts.map((p) => {
                  const hasSecondImage = p.images && p.images.length > 1;
                  const stockCount = typeof p.stock === "number" ? p.stock : null;
                  const isInStock = stockCount != null ? stockCount > 0 : p.isInStock !== false;
                  const stockText = stockCount != null ? (stockCount > 0 ? `${stockCount} in stock` : "No stock") : (isInStock ? "In stock" : "No stock");
                  const isHovered = hoveredRelatedId === p._id;

                  return (
                    <Zoom in={true} key={p._id}>
                      <Card
                        onMouseEnter={() => setHoveredRelatedId(p._id)}
                        onMouseLeave={() => setHoveredRelatedId(null)}
                        onClick={() => navigate(`/product/${p._id}`)}
                        sx={{
                          minWidth: 260,
                          maxWidth: 260,
                          cursor: "pointer",
                          borderRadius: 3,
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          boxShadow: isHovered ? "0 12px 24px rgba(255,140,0,0.25)" : "0 2px 8px rgba(0,0,0,0.1)",
                          transform: isHovered ? "translateY(-8px)" : "none",
                        }}
                      >
                        <Box sx={{ position: "relative", height: 240 }}>
                          {hasSecondImage ? (
                            <>
                              <CardMedia component="img" image={p.images[0].url} alt={p.name} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.35s ease", opacity: isHovered ? 0 : 1 }} />
                              <CardMedia component="img" image={p.images[1].url} alt={p.name} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.35s ease", opacity: isHovered ? 1 : 0 }} />
                            </>
                          ) : (
                            <CardMedia component="img" image={p.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"} alt={p.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}

                          <Chip label={stockText} size="small" color={isInStock ? "success" : "error"} sx={{ position: "absolute", left: 12, bottom: 12, fontWeight: 500, backdropFilter: "blur(4px)" }} />
                        </Box>

                        <CardContent>
                          <Tooltip title={p.name} arrow>
                            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ mb: 1 }}>{p.name}</Typography>
                          </Tooltip>
                          <Typography variant="h6" fontWeight={700} sx={{ color: "#ff8c00" }}>₱{(p.price || 0).toFixed(2)}</Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  );
                })}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      <Footer />

      {/* Snackbar Notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }} TransitionComponent={Fade}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          icon={snackbar.severity === "success" ? <SuccessIcon /> : snackbar.severity === "error" ? <ErrorIcon /> : snackbar.severity === "warning" ? <WarningIcon /> : <StockIcon />}
          sx={{ width: "100%", minWidth: 300, borderRadius: 2, fontSize: "1rem", fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", "& .MuiAlert-icon": { fontSize: 28 } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog Modal */}
      <Dialog open={dialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {dialog.type === "success" ? <SuccessIcon sx={{ color: "#4caf50", fontSize: 32 }} /> : dialog.type === "error" ? <ErrorIcon sx={{ color: "#f44336", fontSize: 32 }} /> : dialog.type === "warning" ? <WarningIcon sx={{ color: "#ff9800", fontSize: 32 }} /> : <StockIcon sx={{ color: "#2196f3", fontSize: 32 }} />}
            <Typography variant="h6" fontWeight={600}>{dialog.title}</Typography>
          </Stack>
          <IconButton onClick={handleCloseDialog} sx={{ position: "absolute", right: 12, top: 12, color: "grey.500" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>{dialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2, textTransform: "none", px: 3 }}>Close</Button>
          {dialog.onConfirm && (
            <Button onClick={handleDialogConfirm} variant="contained" sx={{ bgcolor: "#ff8c00", borderRadius: 2, textTransform: "none", px: 3, "&:hover": { bgcolor: "#e67e00" } }}>Confirm</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ProductDetails;