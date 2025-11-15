import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Material UI imports
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Paper,
  Rating,
  Skeleton,
  Badge,
  Fade,
  Zoom,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  LocalOffer as LocalOfferIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Custom theme matching your color scheme
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
      light: "#ffb733",
      dark: "#cc8400",
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
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
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

export default function Home({ user }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const INITIAL_VISIBLE_COUNT = 12;
  const LOAD_MORE_COUNT = 8;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("none");
  const [dateSort, setDateSort] = useState("none");
  const [alphabeticalSort, setAlphabeticalSort] = useState("none");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const sentinelRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const CarouselArrow = ({ direction, onClick }) => (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [direction === "left" ? "left" : "right"]: 18,
        zIndex: 5,
        backgroundColor: "rgba(0,0,0,0.45)",
        color: "#fff",
        width: 44,
        height: 44,
        "&:hover": {
          backgroundColor: "rgba(0,0,0,0.65)",
        },
      }}
    >
      {direction === "left" ? <ArrowBackIcon /> : <ArrowForwardIcon />}
    </IconButton>
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get("/api/v1/products");
        const isArchivedFlag = (p) => {
          if (p == null) return false;
          const v = p.isArchived;
          return v === true || v === "true" || v === 1 || v === "1";
        };
        setProducts((data.products || []).filter((p) => !isArchivedFlag(p)));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
      setSnackbar({
        open: true,
        message: `Increased ${product.name} quantity in cart!`,
        severity: "success"
      });
    } else {
      cart.push({ ...product, quantity: 1 });
      setSnackbar({
        open: true,
        message: `${product.name} added to cart! 🛒`,
        severity: "success"
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleView = (id) => {
    navigate(`/product/${id}`);
  };

  const categories = ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (ratingFilter !== "all") {
      const minRating = Number(ratingFilter);
      filtered = filtered.filter((product) => {
        const ratingInfo = productRatings[product._id];
        const avgRating = ratingInfo?.average ?? 0;
        return avgRating >= minRating;
      });
    }

    if (priceSort === "low-to-high") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === "high-to-low") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (dateSort === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA;
      });
    } else if (dateSort === "oldest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateA - dateB;
      });
    }

    if (alphabeticalSort === "a-z") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (alphabeticalSort === "z-a") {
      filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount((prev) => {
      const initial = Math.min(INITIAL_VISIBLE_COUNT, filteredProducts.length || INITIAL_VISIBLE_COUNT);
      return prev !== initial ? initial : prev;
    });
  }, [filteredProducts.length, selectedCategory, priceSort, dateSort, alphabeticalSort, ratingFilter, searchQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisibleCount((prev) => {
            if (prev >= filteredProducts.length) return prev;
            return Math.min(prev + LOAD_MORE_COUNT, filteredProducts.length);
          });
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [filteredProducts.length]);

  useEffect(() => {
    if (!products || products.length === 0) {
      setProductRatings({});
      return;
    }

    let cancelled = false;

    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          products.map(async (product) => {
            try {
              const { data } = await apiClient.get(`/api/v1/products/${product._id}/reviews`);
              const reviews = data.reviews || [];
              const totalRatings = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
              const average = reviews.length ? Math.round((totalRatings / reviews.length) * 10) / 10 : 0;
              return [product._id, { average, count: reviews.length }];
            } catch (err) {
              console.error(`Failed to load reviews for product ${product._id}`, err);
              return [product._id, { average: 0, count: 0 }];
            }
          })
        );

        if (!cancelled) {
          setProductRatings(Object.fromEntries(entries));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch product ratings", err);
          setProductRatings({});
        }
      }
    };

    fetchRatings();

    return () => {
      cancelled = true;
    };
  }, [products]);

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
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }}
          onProfile={() => {
            navigate("/user/profile");
          }}
          onCart={() => {
            navigate("/user/cart");
          }}
          onHome={() => {
            navigate("/home");
          }}
        />

        <Box sx={{ width: "100%", mt: 4, mb: 4, overflow: "visible", position: "relative" }}>
          <Container maxWidth="xl" sx={{ position: "relative" }}>
            <Slider
              {...{
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 4000,
                arrows: true,
                prevArrow: <CarouselArrow direction="left" />,
                nextArrow: <CarouselArrow direction="right" />,
                centerMode: true,
                centerPadding: "15%",
                fade: false,
              }}
            >
              <div style={{ padding: "0 12px" }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src="/images/nendoroid-banner.jpg"
                    alt="nendoroid-banner-1"
                    style={{
                      width: "100%",
                      height: 280,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </div>
              <div style={{ padding: "0 12px" }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src="/images/nendoroid-banner-2.jpg"
                    alt="nendoroid-banner-2"
                    style={{
                      width: "100%",
                      height: 280,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </div>
              <div style={{ padding: "0 12px" }}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src="/images/nendoroid-banner-3.jpg"
                    alt="nendoroid-banner-3"
                    style={{
                      width: "100%",
                      height: 280,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              </div>
            </Slider>
          </Container>
        </Box>
        
        <style>{`
          .slick-slide {
            transition: all 0.3s ease;
            opacity: 0.5;
            transform: scale(0.85);
          }
          
          .slick-slide.slick-active {
            opacity: 1;
            transform: scale(1);
          }
          
          .slick-center {
            opacity: 1;
            transform: scale(1);
          }
        `}</style>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Filters Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h4" color="primary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterListIcon fontSize="large" />
                  Products
                </Typography>
                <Chip
                  label={`${filteredProducts.length} of ${products.length}`}
                  color="secondary"
                  sx={{ fontWeight: 600, fontSize: 14 }}
                />
              </Box>
              <TextField
                placeholder="Search products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="medium"
                sx={{ flex: 1, minWidth: 260, maxWidth: 420 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery("")} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Rating Filter</InputLabel>
                  <Select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} label="Rating Filter">
                    <MenuItem value="all">⭐ All Ratings</MenuItem>
                    <MenuItem value="4">⭐ 4 stars & up</MenuItem>
                    <MenuItem value="3">⭐ 3 stars & up</MenuItem>
                    <MenuItem value="2">⭐ 2 stars & up</MenuItem>
                    <MenuItem value="1">⭐ 1 star & up</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Category">
                    <MenuItem value="all">📁 All Categories</MenuItem>
                    {categories
                      .filter((c) => c !== "all")
                      .map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by Price</InputLabel>
                  <Select
                    value={priceSort}
                    onChange={(e) => {
                      setPriceSort(e.target.value);
                      setDateSort("none");
                      setAlphabeticalSort("none");
                    }}
                    label="Sort by Price"
                  >
                    <MenuItem value="none">💰 Default</MenuItem>
                    <MenuItem value="low-to-high">💰 Low to High</MenuItem>
                    <MenuItem value="high-to-low">💰 High to Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by Date</InputLabel>
                  <Select
                    value={dateSort}
                    onChange={(e) => {
                      setDateSort(e.target.value);
                      setPriceSort("none");
                      setAlphabeticalSort("none");
                    }}
                    label="Sort by Date"
                  >
                    <MenuItem value="none">📅 Default</MenuItem>
                    <MenuItem value="newest">📅 Newest First</MenuItem>
                    <MenuItem value="oldest">📅 Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Alphabetically</InputLabel>
                  <Select
                    value={alphabeticalSort}
                    onChange={(e) => {
                      setAlphabeticalSort(e.target.value);
                      setPriceSort("none");
                      setDateSort("none");
                    }}
                    label="Alphabetically"
                  >
                    <MenuItem value="none">🔤 Default</MenuItem>
                    <MenuItem value="a-z">🔤 A to Z</MenuItem>
                    <MenuItem value="z-a">🔤 Z to A</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                Loading products...
              </Typography>
            </Box>
          ) : error ? (
            <Typography variant="h6" color="error" sx={{ textAlign: "center" }}>
              {error}
            </Typography>
          ) : filteredProducts.length === 0 ? (
            <Paper elevation={2} sx={{ textAlign: "center", py: 8, borderRadius: 3 }}>
              <Typography variant="h1" sx={{ fontSize: 80, mb: 2 }}>
                😢
              </Typography>
              <Typography variant="h6" color="secondary">
                No products found. Try adjusting your filters!
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                {visibleProducts.map((p) => {
                  const isHovered = hoveredProductId === p._id;
                  const hasSecondImage = p.images && p.images.length > 1;
                  const stockCount = typeof p.stock === "number" ? p.stock : null;
                  const isInStock = stockCount != null ? stockCount > 0 : p.isInStock !== false;
                  const ratingInfo = productRatings[p._id] || { average: 0, count: 0 };
                  const displayRating = ratingInfo.average ?? 0;

                  return (
                    <Box key={p._id} sx={{ width: 330 }}>
                      <Fade in timeout={500} style={{ width: '100%' }}>
                        <Card
                          elevation={isHovered ? 12 : 3}
                          onMouseEnter={() => setHoveredProductId(p._id)}
                          onMouseLeave={() => setHoveredProductId(null)}
                          sx={{
                            width: '100%',
                            height: 550,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box sx={{ 
                            position: "relative", 
                            height: 300,
                            width: "100%",
                            overflow: "hidden",
                            flexShrink: 0,
                            backgroundColor: '#f5f5f5',
                          }}>
                            {hasSecondImage ? (
                              <>
                                <CardMedia
                                  component="img"
                                  image={p.images[0].url}
                                  alt={p.name}
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "opacity 0.4s ease-in-out",
                                    opacity: isHovered ? 0 : 1,
                                  }}
                                />
                                <CardMedia
                                  component="img"
                                  image={p.images[1].url}
                                  alt={p.name}
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "opacity 0.4s ease-in-out",
                                    opacity: isHovered ? 1 : 0,
                                  }}
                                />
                              </>
                            ) : (
                              <CardMedia
                                component="img"
                                image={p.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
                                alt={p.name}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.4s ease",
                                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                                }}
                              />
                            )}
                            <Chip
                              label={isInStock ? "In Stock" : "Sold Out"}
                              color={isInStock ? "success" : "error"}
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            />
                            <Chip
                              icon={<StarIcon sx={{ color: "#fff !important" }} />}
                              label={`${displayRating || 0} (${ratingInfo.count})`}
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                backgroundColor: "#ffb300",
                                color: "#fff",
                                fontWeight: 700,
                              }}
                            />
                          </Box>

                          <CardContent sx={{ 
                            p: 2, 
                            display: "flex", 
                            flexDirection: "column",
                            flexGrow: 1,
                          }}>
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Tooltip title={p.name} arrow>
                                <Typography
                                  variant="h6"
                                  color="primary"
                                  sx={{
                                    fontWeight: 700,
                                    mb: 1,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    height: 56,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {p.name}
                                </Typography>
                              </Tooltip>
                              <Chip
                                label={p.category}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ mb: 2, textTransform: "uppercase", fontWeight: 600, alignSelf: "flex-start" }}
                              />
                            </Box>
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                              ₱{p.price?.toFixed?.(2) ?? p.price}
                            </Typography>
                          </CardContent>

                          <CardActions sx={{ p: 2, pt: 0, flexShrink: 0 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<ShoppingCartIcon />}
                              onClick={() => handleAddToCart(p)}
                              fullWidth
                              sx={{ mr: 1 }}
                            >
                              Add
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleView(p._id)}
                              fullWidth
                            >
                              View
                            </Button>
                          </CardActions>
                        </Card>
                      </Fade>
                    </Box>
                  );
                })}
              </Box>

              <div ref={sentinelRef} style={{ height: 1 }} />
              {visibleCount < filteredProducts.length && (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <CircularProgress color="primary" />
                  <Typography variant="body1" color="primary" sx={{ mt: 2, fontWeight: 600 }}>
                    Loading more products...
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Container>
        <Footer />

        {/* Enhanced Snackbar Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ zIndex: 1400 }}
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
}
