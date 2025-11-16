import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Rating,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import {
  Star as StarIcon,
  Image as ImageIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Reviews as ReviewsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Enhanced theme with modern gradients and animations
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
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 24px 48px rgba(255, 140, 0, 0.2)",
          },
        },
      },
    },
  },
});

function AdminReviews() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, reviewId: null });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/reviews');
      setReviews(data.reviews || []);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to load reviews', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDeleteClick = (reviewId) => {
    setDeleteDialog({ open: true, reviewId });
  };

  const handleDeleteConfirm = async () => {
    const reviewId = deleteDialog.reviewId;
    try {
      await apiClient.delete(`/api/v1/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
      setSnackbar({ open: true, message: 'Review deleted successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete review', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, reviewId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, reviewId: null });
  };

  // Calculate statistics
  const stats = {
    total: reviews.length,
    avgRating: reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0,
    withImages: reviews.filter(r => r.images?.length > 0).length,
  };

  // Enhanced DataGrid columns
  const columns = [
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar 
            sx={{ 
              bgcolor: "rgba(255, 140, 0, 0.1)", 
              color: "primary.main",
              width: 36,
              height: 36,
            }}
          >
            <ShoppingCartIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography fontWeight={600} color="primary.main" sx={{ fontSize: '0.9rem' }}>
              {params.row.productId?.name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Product ID: {params.row.productId?._id?.slice(-6) || '-'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'user',
      headerName: 'User',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: "secondary.main", 
              width: 32, 
              height: 32,
              fontSize: '0.875rem',
            }}
          >
            {(params.row.userId?.username?.[0] || params.row.userId?.email?.[0] || '?').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.userId?.username || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.userId?.email?.slice(0, 20) || '-'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating 
            value={params.value || 0} 
            readOnly 
            size="small" 
            sx={{ 
              color: "#ff8c00",
              '& .MuiRating-iconEmpty': {
                color: 'rgba(255, 140, 0, 0.3)',
              }
            }} 
          />
          <Chip
            label={`${params.value}/5`}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      ),
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 2,
      minWidth: 320,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 300,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
              color: params.value ? 'text.primary' : 'text.secondary',
              fontStyle: params.value ? 'normal' : 'italic',
            }}
            title={params.value}
          >
            {params.value || 'No comment provided'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'images',
      headerName: 'Images',
      width: 200,
      renderCell: (params) => {
        const images = params.value || [];
        if (images.length === 0) {
          return (
            <Typography variant="body2" color="text.secondary">
              No images
            </Typography>
          );
        }

        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {images.slice(0, 3).map((img, index) => (
              <Box
                key={index}
                component="img"
                src={img.url}
                alt={`Review image ${index + 1}`}
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.1)",
                    transition: "transform 0.2s",
                  },
                }}
                onClick={() => {
                  // Open image in new tab
                  window.open(img.url, '_blank');
                }}
              />
            ))}
            {images.length > 3 && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  border: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                }}
                onClick={() => {
                  // Could open a modal with all images, but for now just show count
                  alert(`Review has ${images.length} images`);
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  +{images.length - 3}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {new Date(params.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details" arrow>
            <IconButton 
              size="small"
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  background: 'rgba(255, 140, 0, 0.1)',
                }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Review" arrow>
            <IconButton 
              size="small"
              onClick={() => handleDeleteClick(params.row._id)}
              sx={{ 
                color: 'error.main',
                '&:hover': {
                  background: 'rgba(244, 67, 54, 0.1)',
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <AdminHeader
          onLogout={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        {isSidebarOpen && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1,
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }}
          />
          <Box sx={{ flex: 1, p: 3 }}>
            {/* Hero Section */}
            <Fade in timeout={600}>
              <Box 
                sx={{ 
                  textAlign: "center", 
                  mb: 4,
                  py: 4,
                  px: 3,
                  background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.08) 0%, rgba(255, 165, 0, 0.12) 100%)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(255, 140, 0, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    background: 'radial-gradient(circle, rgba(255, 165, 0, 0.12) 0%, transparent 70%)',
                    borderRadius: '50%',
                  }
                }}
              >
                <Zoom in timeout={800}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <ReviewsIcon 
                      sx={{ 
                        fontSize: 64, 
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2,
                      }} 
                    />
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Product Reviews
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight={400}>
                      Monitor customer feedback and ratings
                    </Typography>
                  </Box>
                </Zoom>
              </Box>
            </Fade>

            {/* Statistics Cards */}
            <Fade in timeout={800}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)',
                    border: '2px solid',
                    borderColor: 'rgba(255, 140, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(255, 140, 0, 0.15)',
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 140, 0, 0.1)', width: 56, height: 56 }}>
                      <ReviewsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Total Reviews
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)',
                    border: '2px solid',
                    borderColor: 'rgba(255, 140, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(255, 140, 0, 0.15)',
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 140, 0, 0.1)', width: 56, height: 56 }}>
                      <StarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          {stats.avgRating}
                        </Typography>
                        <StarIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Average Rating
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)',
                    border: '2px solid',
                    borderColor: 'rgba(255, 140, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(255, 140, 0, 0.15)',
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 140, 0, 0.1)', width: 56, height: 56 }}>
                      <ImageIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {stats.withImages}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        With Images
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Fade>

            {/* Main Content Card */}
            <Fade in timeout={1000}>
              <Card 
                sx={{ 
                  maxWidth: 1400, 
                  mx: "auto",
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(255, 140, 0, 0.12)',
                  border: '1px solid',
                  borderColor: 'rgba(255, 140, 0, 0.1)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {loading ? (
                    <Box sx={{ display: "flex", flexDirection: 'column', alignItems: "center", justifyContent: "center", py: 12 }}>
                      <Box 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%',
                          border: '4px solid rgba(255, 140, 0, 0.2)',
                          borderTopColor: 'primary.main',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                          mb: 3,
                        }}
                      />
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        Loading reviews...
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Please wait while we fetch the data
                      </Typography>
                    </Box>
                  ) : reviews.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 12 }}>
                      <ReviewsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h5" color="text.secondary" fontWeight={600} gutterBottom>
                        No reviews yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Reviews will appear here once customers start rating products
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ height: 650, width: '100%' }}>
                      <DataGrid
                        rows={reviews}
                        columns={columns}
                        getRowId={(row) => row._id}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        disableSelectionOnClick
                        rowHeight={100}
                        sx={{
                          border: 'none',
                          '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid rgba(255, 140, 0, 0.08)',
                            py: 2,
                          },
                          '& .MuiDataGrid-columnHeaders': {
                            background: 'linear-gradient(135deg, #fff8f0 0%, #ffe8d0 100%)',
                            borderBottom: '3px solid #ff8c00',
                            borderRadius: '12px 12px 0 0',
                            '& .MuiDataGrid-columnHeaderTitle': {
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color: '#ff8c00',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            },
                          },
                          '& .MuiDataGrid-row': {
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 140, 0, 0.04)',
                              transform: 'scale(1.002)',
                            },
                          },
                          '& .MuiDataGrid-footerContainer': {
                            borderTop: '3px solid #ff8c00',
                            background: 'linear-gradient(135deg, #fff8f0 0%, #ffe8d0 100%)',
                            borderRadius: '0 0 12px 12px',
                          },
                          '& .MuiTablePagination-root': {
                            color: '#ff8c00',
                            fontWeight: 600,
                          },
                          '& .MuiIconButton-root': {
                            color: '#ff8c00',
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Zoom}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              fontWeight: 600,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 2,
              minWidth: 400,
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <DeleteIcon />
            Delete Review?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button 
              onClick={handleDeleteCancel}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'grey.300',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'grey.400',
                  background: 'grey.50',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default AdminReviews;