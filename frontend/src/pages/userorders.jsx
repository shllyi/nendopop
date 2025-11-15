import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Snackbar,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  LocationOn,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
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

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    if (!user) {
      setStatus("⚠️ Please log in first");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get(
          `/api/v1/orders/user/${user._id}`
        );
        if (data.success) {
          setOrders(data.orders);

          // Fetch reviewed products to track which ones have reviews
          const reviewedSet = new Set();
          for (const order of data.orders) {
            if (order.status === 'Completed') {
              for (const item of order.items) {
                try {
                  const reviewResponse = await apiClient.get(`/api/v1/products/${item.productId}/reviews/user`);
                  if (reviewResponse.data.reviews && reviewResponse.data.reviews.length > 0) {
                    reviewedSet.add(item.productId);
                  }
                } catch (reviewErr) {
                  // Ignore errors, product might not have reviews
                }
              }
            }
          }
          setReviewedProducts(reviewedSet);
        } else {
          setStatus("❌ Failed to load your orders");
        }
      } catch (err) {
        setStatus(err.response?.data?.message || "❌ Unable to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const grouped = useMemo(() => {
    const groups = { Pending: [], Shipped: [], Delivered: [], Cancelled: [], Completed: [], All: [] };
    for (const o of orders) {
      if (groups[o.status]) groups[o.status].push(o);
      groups.All.push(o);
    }
    return groups;
  }, [orders]);

  const [tab, setTab] = useState('Pending');

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState({ productId: '', productName: '' });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState([]);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'warning', 'info'
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Cancellation dialog state
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    orderId: '',
    reason: '',
  });

  const openCancelDialog = (orderId) => {
    setCancelDialog({ open: true, orderId, reason: '' });
  };

  const closeCancelDialog = () => {
    setCancelDialog({ open: false, orderId: '', reason: '' });
  };

  const handleCancelOrder = async () => {
    if (!cancelDialog.reason.trim()) {
      showNotification('Please provide a cancellation reason', 'warning');
      return;
    }

    try {
      const { data } = await apiClient.put(`/api/v1/orders/${cancelDialog.orderId}/cancel`, {
        reason: cancelDialog.reason.trim()
      });
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === cancelDialog.orderId ? data.order : o)));
        showNotification(`Order cancelled successfully! Reason: ${data.cancellationReason}`, 'success');
        closeCancelDialog();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Unable to cancel order', 'error');
    }
  };



  const confirmReceived = async (orderId) => {
    try {
      const { data } = await apiClient.put(`/api/v1/orders/${orderId}/confirm`);
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
        showNotification('Order marked as completed!', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Unable to confirm receipt', 'error');
    }
  };

  const openReview = (product) => {
    setReviewTarget({ productId: product.productId || product._id, productName: product.name });
    setReviewRating(0);
    setReviewComment('');
    setReviewFiles([]);
    setShowReviewModal(true);
  };

  const handleReviewFiles = (e) => {
    setReviewFiles(Array.from(e.target.files || []));
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget.productId) return;
    if (reviewRating < 1 || reviewRating > 5) {
      alert('Please select a rating (1-5)');
      return;
    }
    try {
      let imgs = [];
      if (reviewFiles.length > 0) {
        imgs = await Promise.all(reviewFiles.map(fileToBase64));
      }
      await apiClient.post(`/api/v1/products/${reviewTarget.productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        images: imgs,
      });
      setShowReviewModal(false);
      setReviewFiles([]);
      setReviewComment('');
      setReviewRating(0);
      setReviewTarget({ productId: '', productName: '' });
      showNotification('Review submitted successfully!', 'success');
      // Update reviewed products set
      setReviewedProducts(prev => new Set([...prev, reviewTarget.productId]));
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const navigate = useNavigate();

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
            navigate('/user/home');
          }}
        />

        <Box sx={{ py: 6, maxWidth: "900px", mx: "auto", px: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff8c00", mb: 4, textAlign: "center" }}>
            🧾 My Orders
          </Typography>

          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{
              mb: 4,
              "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem", textTransform: "none" },
              "& .Mui-selected": { color: "#ff8c00 !important" },
              "& .MuiTabs-indicator": { bgcolor: "#ff8c00", height: 3 },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled', 'Completed'].map((t) => (
              <Tab key={t} label={t} value={t} />
            ))}
          </Tabs>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#ff8c00" }} />
            </Box>
          ) : status ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {status}
            </Alert>
          ) : (grouped[tab] || []).length === 0 ? (
            <Typography variant="h6" sx={{ textAlign: "center", color: "text.secondary", py: 4 }}>
              You have no orders yet.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {(grouped[tab] || []).map((order) => (
                <Card key={order._id} elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Header */}
                    <Box sx={{ p: 3, bgcolor: "#fff8f0", borderBottom: "1px solid #ffe4cc" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <ReceiptIcon sx={{ color: "#ff8c00", fontSize: 28 }} />
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff8c00" }}>
                              Order #{order._id.slice(-6).toUpperCase()}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
                              <ScheduleIcon sx={{ fontSize: 16 }} />
                              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                          <Chip
                            label={order.status}
                            color={
                              order.status === 'Completed' ? 'success' :
                              order.status === 'Delivered' ? 'primary' :
                              order.status === 'Shipped' ? 'secondary' :
                              order.status === 'Cancelled' ? 'error' : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          {order.status === 'Cancelled' && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                                Reason:
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#f44336", fontStyle: "italic" }}>
                                {order.cancellationReason || 'No reason specified'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Order Summary */}
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
                        <Paper sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #ffe4cc" }}>
                          <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                            Total Amount
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff8c00" }}>
                            ₱{order.totalAmount.toFixed(2)}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #ffe4cc" }}>
                          <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                            Shipping Fee
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#e67e00" }}>
                            ₱{order.shippingFee.toFixed(2)}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #ffe4cc" }}>
                          <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocalShippingIcon sx={{ fontSize: 16 }} />
                            Shipping To
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.shipping}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 2, bgcolor: "#ffffff", borderRadius: 2, border: "1px solid #ffe4cc" }}>
                          <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 16 }} />
                            Contact
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.phone}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>

                    {/* Items Section */}
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                        <ShoppingCartIcon sx={{ color: "#ff8c00" }} />
                        Order Items
                      </Typography>

                      <List sx={{ mb: 3 }}>
                        {order.items.map((item, idx) => (
                          <ListItem key={idx} sx={{ px: 0, py: 1, borderBottom: "1px solid #f5f5f5" }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                      Quantity: {item.quantity}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff8c00", mb: 0.5 }}>
                                      ₱{(item.price * item.quantity).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                      ₱{item.price.toFixed(2)} each
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                            {order.status === 'Completed' && (
                              <Box sx={{ mt: 1 }}>
                                {reviewedProducts.has(item.productId) ? (
                                  <Chip
                                    label="Review Submitted"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{
                                      fontSize: "0.75rem",
                                      height: "24px",
                                      "& .MuiChip-label": { px: 1 }
                                    }}
                                  />
                                ) : (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => openReview(item)}
                                    sx={{
                                      borderColor: "#ff8c00",
                                      color: "#ff8c00",
                                      "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                                    }}
                                  >
                                    Write Review
                                  </Button>
                                )}
                              </Box>
                            )}
                          </ListItem>
                        ))}
                      </List>

                      {/* Delivery Address */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                          <LocationOn sx={{ color: "#ff8c00" }} />
                          Delivery Address
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
                          <Typography variant="body1">
                            {order.address}
                          </Typography>
                        </Paper>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        {order.status === 'Pending' && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => openCancelDialog(order._id)}
                            sx={{ fontWeight: 600 }}
                          >
                            Cancel Order
                          </Button>
                        )}
                        {order.status === 'Delivered' && (
                          <Button
                            variant="contained"
                            onClick={() => confirmReceived(order._id)}
                            sx={{
                              backgroundColor: "#ff8c00",
                              "&:hover": { backgroundColor: "#e67e00" },
                              fontWeight: 600,
                            }}
                          >
                            Confirm Received
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Review Dialog */}
        <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: "#ff8c00", fontWeight: 600 }}>
            Write a Review
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Product: <strong>{reviewTarget.productName}</strong>
            </Typography>

            <Box component="form" onSubmit={submitReview} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Rating:</Typography>
                <Rating
                  value={reviewRating}
                  onChange={(event, newValue) => setReviewRating(newValue)}
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "#ff8c00",
                    },
                    "& .MuiRating-iconHover": {
                      color: "#e67e00",
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {reviewRating || 0}/5
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience"
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

              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderColor: "#ff8c00",
                  color: "#ff8c00",
                  "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                }}
              >
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleReviewFiles}
                />
              </Button>

              {reviewFiles.length > 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {reviewFiles.length} file(s) selected
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setShowReviewModal(false)}
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
              onClick={submitReview}
              variant="contained"
              disabled={reviewRating < 1}
              sx={{
                backgroundColor: "#ff8c00",
                "&:hover": { backgroundColor: "#e67e00" },
                "&:disabled": { backgroundColor: "#ccc" },
              }}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancellation Reason Dialog */}
        <Dialog
          open={cancelDialog.open}
          onClose={closeCancelDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            }
          }}
        >
          <DialogTitle sx={{
            color: "#ff8c00",
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ErrorIcon sx={{ color: "#f44336" }} />
            Cancel Order
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Are you sure you want to cancel this order? Please provide a reason for cancellation.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Cancellation Reason"
              placeholder="Please explain why you're cancelling this order..."
              value={cancelDialog.reason}
              onChange={(e) => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
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

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This action cannot be undone. The order will be cancelled and you may need to place a new order if you change your mind.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={closeCancelDialog}
              variant="outlined"
              sx={{
                borderColor: "#ff8c00",
                color: "#ff8c00",
                "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                textTransform: "none",
                px: 3,
              }}
            >
              Keep Order
            </Button>
            <Button
              onClick={handleCancelOrder}
              variant="contained"
              disabled={!cancelDialog.reason.trim()}
              sx={{
                backgroundColor: "#f44336",
                "&:hover": { backgroundColor: "#d32f2f" },
                "&:disabled": { backgroundColor: "#ccc" },
                textTransform: "none",
                px: 3,
              }}
            >
              Cancel Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
              width: '100%',
              fontSize: '1rem',
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 2,
              minWidth: 300,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default UserOrders;
