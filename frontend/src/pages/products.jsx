import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Grid,
  Fade,
  Snackbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/Restore';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';

// Theme matching cart.jsx orange/light palette
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
  name: yup.string().required("Name is required"),
  description: yup.string(),
  price: yup.number().positive("Price must be positive").required("Price is required"),
  stock: yup.number().integer("Stock must be an integer").min(0, "Stock cannot be negative").required("Stock is required"),
  category: yup.string().required("Category is required"),
  specifications: yup.string(),
});

function Products({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch all products (including archived for admin)
  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/products/all");
      setProducts(data.products || []);
    } catch (e) {
      showSnackbar("Failed to load products", "error");
    }
  };

  // Fetch stored categories
  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/categories");
      setCategories(data.categories || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openAddModal = () => {
    setEditProduct(null);
    reset({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      specifications: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setValue("name", product.name || "");
    setValue("description", product.description || "");
    setValue("price", product.price || "");
    setValue("stock", product.stock ?? "");
    setValue("category", product.category || "");
    setValue("specifications", product.specifications || "");
    setImagePreviews([]);
    setExistingImages(product.images ? product.images.map((img) => ({ public_id: img.public_id, url: img.url })) : []);
    setRemovedImageIds(new Set());
    setImageFiles([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    reset({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      specifications: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditProduct(null);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onSubmit = async (data) => {
    showSnackbar("Saving...", "info");
    try {
      let imagesBase64 = [];
      if (imageFiles.length > 0) {
        imagesBase64 = await Promise.all(imageFiles.map(fileToBase64));
      }
      const payload = {
        ...data,
        price: Number(data.price) || 0,
        stock: Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0,
        images: imagesBase64.length > 0 ? imagesBase64 : undefined,
      };
      // If editing and we have existing images, include retain list (public_ids of images to keep)
      if (editProduct) {
        const retain = (existingImages || []).filter(img => !removedImageIds.has(img.public_id)).map(i => i.public_id);
        payload.retainImagePublicIds = retain;
      }
      if (editProduct) {
        await apiClient.put(
          `/api/v1/products/${editProduct._id}`,
          payload
        );
        showSnackbar("Product updated", "success");
      } else {
        await apiClient.post("/api/v1/products", payload);
        showSnackbar("Product added", "success");
      }
      fetchProducts();
      closeModal();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Save failed", "error");
    }
  };

  const toggleArchive = async (product) => {
    showSnackbar("Processing...", "info");
    try {
      await apiClient.put(
        `/api/v1/products/${product._id}/archive`
      );
      fetchProducts();
      showSnackbar(product.isArchived ? "Restored" : "Archived", "success");
    } catch (err) {
      showSnackbar("Archive failed", "error");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <AdminHeader
          onLogout={handleLogout}
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
            onLogout={handleLogout}
          />
          <Box sx={{ flex: 1, p: 2 }}>
            <Card sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
              <CardContent>
                <Typography variant="h4" align="center" gutterBottom>
                  Product Management
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Active" />
                    <Tab label="Archived" />
                  </Tabs>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={openAddModal} sx={{ backgroundColor: "#ff8c00", '&:hover': { backgroundColor: "#e67e00" } }}>
                    Add Product
                  </Button>
                </Box>

                {activeTab === 0 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Stock</TableCell>
                          <TableCell>Images</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products
                          .filter((p) => !p.isArchived)
                          .map((p) => (
                            <TableRow key={p._id}>
                              <TableCell sx={{ verticalAlign: 'bottom' }}>{p.name}</TableCell>
                              <TableCell sx={{ verticalAlign: 'bottom' }}>{p.category}</TableCell>
                              <TableCell sx={{ verticalAlign: 'bottom' }}>₱{p.price}</TableCell>
                              <TableCell sx={{ verticalAlign: 'bottom' }}>{p.stock}</TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                  {p.images &&
                                    p.images.slice(0, 3).map((img, i) => (
                                      <Avatar
                                        key={i}
                                        src={img.url}
                                        alt=""
                                        sx={{ width: 48, height: 48, cursor: "pointer" }}
                                        variant="rounded"
                                        onClick={() => window.open(img.url, '_blank')}
                                      />
                                    ))}
                                  {p.images && p.images.length > 3 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ cursor: "pointer" }} onClick={() => {
                                      // Open all extra images in new tabs
                                      const extraImages = p.images.slice(3);
                                      extraImages.forEach(img => window.open(img.url, '_blank'));
                                    }}>
                                      +{p.images.length - 3} more
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Button size="small" onClick={() => openEditModal(p)} sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                                    Edit
                                  </Button>
                                  <Button size="small" onClick={() => toggleArchive(p)} sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                                    Archive
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {activeTab === 1 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Stock</TableCell>
                          <TableCell>Images</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products
                          .filter((p) => p.isArchived)
                          .map((p) => (
                            <TableRow key={p._id}>
                              <TableCell>{p.name}</TableCell>
                              <TableCell>{p.category}</TableCell>
                              <TableCell>₱{p.price}</TableCell>
                              <TableCell>{p.stock}</TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                  {p.images &&
                                    p.images.slice(0, 3).map((img, i) => (
                                      <Avatar
                                        key={i}
                                        src={img.url}
                                        alt=""
                                        sx={{ width: 48, height: 48, cursor: "pointer" }}
                                        variant="rounded"
                                        onClick={() => window.open(img.url, '_blank')}
                                      />
                                    ))}
                                  {p.images && p.images.length > 3 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ cursor: "pointer" }} onClick={() => {
                                      // Open all extra images in new tabs
                                      const extraImages = p.images.slice(3);
                                      extraImages.forEach(img => window.open(img.url, '_blank'));
                                    }}>
                                      +{p.images.length - 3} more
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Button size="small" onClick={() => toggleArchive(p)}>
                                  Restore
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Dialog open={modalOpen} onClose={closeModal}>
                  <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                  <DialogContent>
                    <Grid container spacing={2}>
                      {/* Row 1: Name and Category */}
                      <Grid item xs={6}>
                        <TextField
                          label="Name"
                          {...register("name")}
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth margin="dense">
                          <InputLabel>Category</InputLabel>
                          <Select maxWidth="lg"
                            {...register("category")}
                            error={!!errors.category}
                          >
                            <MenuItem value="">
                              <em>Select Category</em>
                            </MenuItem>
                            {categories.map((cat) => (
                              <MenuItem key={cat._id} value={cat.name}>
                                {cat.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.category && (
                            <Typography variant="caption" color="error">
                              {errors.category.message}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      {/* Row 2: Price and Stock */}
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Price"
                          type="number"
                          {...register("price")}
                          error={!!errors.price}
                          helperText={errors.price?.message}
                          margin="dense"
                          InputProps={{ startAdornment: "₱" }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Stock"
                          type="number"
                          {...register("stock")}
                          error={!!errors.stock}
                          helperText={errors.stock?.message}
                          margin="dense"
                        />
                      </Grid>
                      {/* Row 3: Description */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          {...register("description")}
                          margin="dense"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      {/* Row 4: Specifications */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Specifications"
                          {...register("specifications")}
                          margin="dense"
                          multiline
                          rows={3}
                          placeholder="Add product specifications (features, dimensions, materials)..."
                        />
                      </Grid>
                      {/* Row 5: Upload Images */}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          sx={{ mt: 1 }}
                        >
                          Upload Images
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            hidden
                            onChange={handleImagesChange}
                          />
                        </Button>
                      </Grid>
                      {/* Image Previews */}
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                          {imagePreviews.map((src, i) => (
                            <Avatar
                              key={i}
                              src={src}
                              alt="preview"
                              sx={{ width: 64, height: 64 }}
                              variant="rounded"
                            />
                          ))}
                          {existingImages.map((img) => (
                            <Box key={img.public_id} sx={{ position: "relative" }}>
                              <Avatar
                                src={img.url}
                                alt="existing"
                                sx={{ width: 64, height: 64 }}
                                variant="rounded"
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: -8,
                                  right: -8,
                                  backgroundColor: "rgba(255,255,255,0.8)",
                                }}
                                onClick={() => {
                                  const next = new Set(removedImageIds);
                                  if (next.has(img.public_id)) {
                                    next.delete(img.public_id);
                                  } else {
                                    next.add(img.public_id);
                                  }
                                  setRemovedImageIds(next);
                                }}
                              >
                                {removedImageIds.has(img.public_id) ? (
                                  <RestoreIcon color="error" />
                                ) : (
                                  <CloseIcon color="error" />
                                )}
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)} variant="contained">
                      {editProduct ? "Save Changes" : "Add Product"}
                    </Button>
                  </DialogActions>
                </Dialog>


                <Snackbar
                  open={snackbar.open}
                  autoHideDuration={3000}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                  <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                  >
                    {snackbar.message}
                  </Alert>
                </Snackbar>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Products;