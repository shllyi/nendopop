import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import UserHeader from '../components/UserHeader';
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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Image as ImageIcon,
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

function UserReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState(new Set());
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/reviews/user');
      if (data.success) setReviews(data.reviews || []);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const startEdit = (review) => {
    setEditingReview(review);
    setForm({ rating: review.rating || 5, comment: review.comment || '' });
    setExistingImages(review.images ? review.images.map((img) => ({ public_id: img.public_id, url: img.url })) : []);
    setRemovedImageIds(new Set());
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setForm({ rating: 5, comment: '' });
    setExistingImages([]);
    setRemovedImageIds(new Set());
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const submitEdit = async () => {
    try {
      setLoading(true);
      const productId = editingReview.productId._id || editingReview.productId;

      const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      let imagesBase64 = [];
      if (newImageFiles.length > 0) {
        imagesBase64 = await Promise.all(newImageFiles.map((f) => fileToBase64(f)));
      }

      const payload = { rating: form.rating, comment: form.comment };
      if (imagesBase64.length > 0) payload.images = imagesBase64;
      const retain = (existingImages || []).filter(img => !removedImageIds.has(img.public_id)).map(i => i.public_id);
      payload.retainImagePublicIds = retain;

      const { data } = await apiClient.post(`/api/v1/products/${productId}/reviews`, payload);
      if (data.success) {
        showSnackbar('Review updated successfully!', 'success');
        setEditingReview(null);
        fetchReviews();
      } else {
        showSnackbar('Failed to update review', 'error');
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update review', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (publicId) => {
    const next = new Set(removedImageIds);
    next.add(publicId);
    setRemovedImageIds(next);
  };

  const removeNewImage = (index) => {
    const newFiles = [...newImageFiles];
    const newPreviews = [...newImagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setNewImageFiles(newFiles);
    setNewImagePreviews(newPreviews);
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
            navigate('/user/home');
          }}
        />

        <Box sx={{ py: 6, maxWidth: "1000px", mx: "auto", px: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff8c00", mb: 4, textAlign: "center" }}>
            ⭐ My Reviews
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#ff8c00" }} />
            </Box>
          )}

          {!loading && reviews.length === 0 && (
            <Typography variant="h6" sx={{ textAlign: "center", color: "text.secondary", py: 4 }}>
              You haven't written any reviews yet.
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {reviews.map((review) => (
              <Box key={review._id} sx={{ width: "100%" }}>
                <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "#ff8c00" }}>
                          {review.productId?.name || 'Product'}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Rating value={review.rating} readOnly size="small" sx={{ color: "#ff8c00" }} />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {review.rating}/5
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => startEdit(review)}
                        sx={{
                          borderColor: "#ff8c00",
                          color: "#ff8c00",
                          "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                        }}
                      >
                        Edit
                      </Button>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
                      {review.comment || <em>No comment</em>}
                    </Typography>

                    {review.images && review.images.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {review.images.map((img, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={img.url}
                            alt={`Review image ${index + 1}`}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Edit Review Dialog */}
        <Dialog
          open={!!editingReview}
          onClose={cancelEdit}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            }
          }}
        >
          <DialogTitle sx={{ color: "#ff8c00", fontWeight: 600 }}>
            Edit Review
          </DialogTitle>
          <DialogContent>
            {editingReview && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="h6" sx={{ mb: 3, color: "#ff8c00" }}>
                  {editingReview.productId?.name || 'Product'}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Rating
                  </Typography>
                  <Rating
                    value={form.rating}
                    onChange={(event, newValue) => setForm({ ...form, rating: newValue })}
                    size="large"
                    sx={{
                      "& .MuiRating-iconFilled": {
                        color: "#ff8c00",
                      },
                      "& .MuiRating-iconHover": {
                        color: "#e67e00",
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    {form.rating}/5 stars
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Comment"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
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

                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{
                      borderColor: "#ff8c00",
                      color: "#ff8c00",
                      "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                    }}
                  >
                    Upload New Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      Existing Images
                    </Typography>
                    <Grid container spacing={2}>
                      {existingImages.map((img) => (
                        <Grid item xs={6} sm={4} md={3} key={img.public_id}>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              component="img"
                              src={img.url}
                              alt="Existing review image"
                              sx={{
                                width: "100%",
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 2,
                                border: removedImageIds.has(img.public_id) ? "2px solid #f44336" : "1px solid #e0e0e0",
                                opacity: removedImageIds.has(img.public_id) ? 0.5 : 1,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeExistingImage(img.public_id)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(255, 255, 255, 0.8)",
                                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16, color: "#f44336" }} />
                            </IconButton>
                            {removedImageIds.has(img.public_id) && (
                              <Chip
                                label="Removed"
                                size="small"
                                color="error"
                                sx={{
                                  position: "absolute",
                                  bottom: 4,
                                  left: 4,
                                  fontSize: "0.7rem",
                                  height: "20px",
                                }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* New Images Preview */}
                {newImagePreviews.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      New Images
                    </Typography>
                    <Grid container spacing={2}>
                      {newImagePreviews.map((src, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              component="img"
                              src={src}
                              alt={`New image ${index + 1}`}
                              sx={{
                                width: "100%",
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeNewImage(index)}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(255, 255, 255, 0.8)",
                                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16, color: "#f44336" }} />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={cancelEdit}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{
                borderColor: "#ff8c00",
                color: "#ff8c00",
                "&:hover": { borderColor: "#e67e00", bgcolor: "#fff3e0" },
                textTransform: "none",
                px: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitEdit}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{
                backgroundColor: "#ff8c00",
                "&:hover": { backgroundColor: "#e67e00" },
                "&:disabled": { backgroundColor: "#ccc" },
                textTransform: "none",
                px: 3,
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
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
}

export default UserReviews;