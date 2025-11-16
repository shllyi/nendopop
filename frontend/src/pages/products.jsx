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
  Snackbar,
  InputAdornment,
  Tooltip,
  Fade,
  Zoom,
  Badge,
  Checkbox,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import InventoryIcon from '@mui/icons-material/Inventory';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';

// Enhanced theme with better visual appeal
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
    warning: {
      main: "#ff9800",
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
          boxShadow: "0 4px 12px rgba(255, 140, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(255, 140, 0, 0.2)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          transition: "all 0.2s ease-in-out",
        },
        contained: {
          boxShadow: "0 4px 12px rgba(255, 140, 0, 0.3)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(255, 140, 0, 0.4)",
            transform: "translateY(-2px)",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/products/all");
      setProducts(data.products || []);
    } catch (e) {
      showSnackbar("Failed to load products", "error");
    }
  };

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
      if (editProduct) {
        const retain = (existingImages || []).filter(img => !removedImageIds.has(img.public_id)).map(i => i.public_id);
        payload.retainImagePublicIds = retain;
      }
      if (editProduct) {
        await apiClient.put(
          `/api/v1/products/${editProduct._id}`,
          payload
        );
        showSnackbar("Product updated successfully", "success");
      } else {
        await apiClient.post("/api/v1/products", payload);
        showSnackbar("Product added successfully", "success");
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
      showSnackbar(product.isArchived ? "Product restored successfully" : "Product archived successfully", "success");
    } catch (err) {
      showSnackbar("Operation failed", "error");
    }
  };

  const bulkArchive = async () => {
    if (selectedRows.length === 0) {
      showSnackbar("Please select products to archive", "warning");
      return;
    }

    showSnackbar("Archiving selected products...", "info");
    try {
      const promises = selectedRows.map(productId =>
        apiClient.put(`/api/v1/products/${productId}/archive`)
      );
      await Promise.all(promises);
      fetchProducts();
      setSelectedRows([]);
      showSnackbar(`${selectedRows.length} products archived successfully`, "success");
    } catch (err) {
      showSnackbar("Bulk archive failed", "error");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery("");
    setSelectedRows([]);
  };

  const filteredProducts = products.filter((p) => {
    const matchesTab = activeTab === 0 ? !p.isArchived : p.isArchived;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCount = products.filter(p => !p.isArchived).length;
  const archivedCount = products.filter(p => p.isArchived).length;

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
          <Box sx={{ flex: 1, p: 3 }}>
            <Fade in timeout={600}>
              <Card sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header Section */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                      <InventoryIcon sx={{ fontSize: 40, color: "primary.main", mr: 1.5 }} />
                      <Typography variant="h3" fontWeight={700} color="primary.main">
                        Product Management
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Manage your product inventory efficiently
                    </Typography>
                  </Box>

                  {/* Stats Cards */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ 
                        background: "linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)",
                        color: "white",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" }
                      }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight={600}>Active Products</Typography>
                          <Typography variant="h3" fontWeight={700}>{activeCount}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ 
                        background: "linear-gradient(135deg, #757575 0%, #9e9e9e 100%)",
                        color: "white",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "scale(1.02)" }
                      }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight={600}>Archived Products</Typography>
                          <Typography variant="h3" fontWeight={700}>{archivedCount}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Controls Section */}
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        sx={{
                          "& .MuiTab-root": {
                            fontWeight: 600,
                            fontSize: "1rem",
                            minHeight: 48,
                          }
                        }}
                      >
                        <Tab 
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              Active
                              <Chip label={activeCount} size="small" color="primary" />
                            </Box>
                          } 
                        />
                        <Tab 
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              Archived
                              <Chip label={archivedCount} size="small" />
                            </Box>
                          } 
                        />
                      </Tabs>
                      
                      <TextField
                        size="small"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 250 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      {selectedRows.length > 0 && activeTab === 0 && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={bulkArchive}
                          size="large"
                          sx={{
                            px: 3,
                            py: 1.5,
                            fontSize: "1rem",
                            backgroundColor: "#f44336",
                            '&:hover': {
                              backgroundColor: "#d32f2f",
                            }
                          }}
                        >
                          Archive Selected ({selectedRows.length})
                        </Button>
                      )}

                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openAddModal}
                        size="large"
                        sx={{
                          backgroundColor: "#ff8c00",
                          px: 3,
                          py: 1.5,
                          fontSize: "1rem",
                          '&:hover': {
                            backgroundColor: "#e67e00",
                          }
                        }}
                      >
                        Add New Product
                      </Button>
                    </Box>
                  </Box>

                  {/* Data Grid */}
                  <Box sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                      rows={filteredProducts}
                      columns={[
                        {
                          field: 'select',
                          headerName: '',
                          width: 50,
                          renderCell: (params) => (
                            <Checkbox
                              checked={selectedRows.includes(params.row._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRows([...selectedRows, params.row._id]);
                                } else {
                                  setSelectedRows(selectedRows.filter(id => id !== params.row._id));
                                }
                              }}
                              sx={{
                                color: '#ff8c00',
                                '&.Mui-checked': {
                                  color: '#ff8c00',
                                },
                              }}
                            />
                          ),
                        },
                        {
                          field: 'name',
                          headerName: 'Product Name',
                          flex: 1,
                          minWidth: 250,
                          renderCell: (params) => (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                              {params.row.images && params.row.images.length > 0 ? (
                                <Avatar
                                  src={params.row.images[0].url}
                                  alt={params.value}
                                  sx={{ width: 50, height: 50, border: "2px solid #ff8c00" }}
                                  variant="rounded"
                                />
                              ) : (
                                <Avatar
                                  sx={{ width: 50, height: 50, bgcolor: "#fff8f0", color: "#ff8c00" }}
                                  variant="rounded"
                                >
                                  <ImageIcon />
                                </Avatar>
                              )}
                              <Typography fontWeight={600} fontSize="0.95rem">{params.value}</Typography>
                            </Box>
                          ),
                        },
                        {
                          field: 'category',
                          headerName: 'Category',
                          width: 160,
                          renderCell: (params) => (
                            <Chip 
                              label={params.value} 
                              size="small" 
                              icon={<CategoryIcon />}
                              sx={{ 
                                bgcolor: "#fff8f0", 
                                color: "#ff8c00",
                                fontWeight: 600
                              }} 
                            />
                          ),
                        },
                        {
                          field: 'price',
                          headerName: 'Price',
                          width: 130,
                          renderCell: (params) => (
                            <Typography fontWeight={600} color="success.main" fontSize="0.95rem">
                              ₱{params.value.toLocaleString()}
                            </Typography>
                          ),
                        },
                        {
                          field: 'stock',
                          headerName: 'Stock',
                          width: 110,
                          renderCell: (params) => (
                            <Chip 
                              label={params.value}
                              size="small"
                              color={params.value > 10 ? "success" : params.value > 0 ? "warning" : "error"}
                              sx={{ fontWeight: 600, minWidth: 50 }}
                            />
                          ),
                        },
                        {
                          field: 'images',
                          headerName: 'Images',
                          width: 200,
                          renderCell: (params) => (
                            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", py: 1.5 }}>
                              {params.value && params.value.length > 0 ? (
                                <>
                                  {params.value.slice(0, 3).map((img, i) => (
                                    <Tooltip key={i} title="Click to view" arrow>
                                      <Avatar
                                        src={img.url}
                                        alt=""
                                        sx={{ 
                                          width: 45, 
                                          height: 45, 
                                          cursor: "pointer",
                                          border: "2px solid #ff8c00",
                                          transition: "transform 0.2s",
                                          "&:hover": { transform: "scale(1.15)" }
                                        }}
                                        variant="rounded"
                                        onClick={() => window.open(img.url, '_blank')}
                                      />
                                    </Tooltip>
                                  ))}
                                  {params.value.length > 3 && (
                                    <Tooltip title="View all images" arrow>
                                      <Chip
                                        label={`+${params.value.length - 3}`}
                                        size="small"
                                        sx={{ 
                                          cursor: "pointer",
                                          fontWeight: 600,
                                          bgcolor: "#ff8c00",
                                          color: "white",
                                          "&:hover": { bgcolor: "#e67e00" }
                                        }}
                                        onClick={() => {
                                          const extraImages = params.value.slice(3);
                                          extraImages.forEach(img => window.open(img.url, '_blank'));
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">No images</Typography>
                              )}
                            </Box>
                          ),
                        },
                        {
                          field: 'actions',
                          headerName: 'Actions',
                          width: 220,
                          renderCell: (params) => (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {!params.row.isArchived ? (
                                <>
                                  <Tooltip title="Edit Product" arrow>
                                    <Button 
                                      size="small" 
                                      variant="outlined"
                                      startIcon={<EditIcon />}
                                      onClick={() => openEditModal(params.row)}
                                      sx={{ 
                                        borderColor: "#ff8c00",
                                        color: "#ff8c00",
                                        "&:hover": { 
                                          borderColor: "#e67e00",
                                          bgcolor: "#fff8f0"
                                        }
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Archive Product" arrow>
                                    <Button 
                                      size="small" 
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteOutlineIcon />}
                                      onClick={() => toggleArchive(params.row)}
                                    >
                                      Archive
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title="Restore Product" arrow>
                                  <Button 
                                    size="small" 
                                    variant="contained"
                                    color="success"
                                    startIcon={<RestoreIcon />}
                                    onClick={() => toggleArchive(params.row)}
                                  >
                                    Restore
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>
                          ),
                        },
                      ]}
                      getRowId={(row) => row._id}
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10 },
                        },
                      }}
                      pageSizeOptions={[5, 10, 25, 50]}
                      disableSelectionOnClick
                      getRowHeight={() => 'auto'}
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                          borderBottom: '1px solid #f5f5f5',
                          py: 2,
                          px: 2,
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#ff8c00',
                          borderRadius: '8px 8px 0 0',
                          minHeight: '56px !important',
                          '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: '#ff8c00',
                          },
                          '& .MuiDataGrid-iconSeparator': {
                            color: 'white',
                          },
                          '& .MuiDataGrid-sortIcon': {
                            color: 'white',
                          },
                          '& .MuiDataGrid-menuIcon': {
                            color: 'white',
                          },
                        },
                        '& .MuiDataGrid-row': {
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: '#fff8f0',
                          },
                        },
                        '& .MuiDataGrid-footerContainer': {
                          borderTop: '2px solid #ff8c00',
                          backgroundColor: '#fff8f0',
                        },
                      }}
                    />
                  </Box>

                  {/* Enhanced Modal */}
                  <Dialog 
                    open={modalOpen} 
                    onClose={closeModal}
                    maxWidth="md"
                    fullWidth
                    TransitionComponent={Zoom}
                  >
                    <DialogTitle sx={{ 
                      bgcolor: "primary.main", 
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: "1.5rem",
                      fontWeight: 700
                    }}>
                      {editProduct ? <EditIcon /> : <AddIcon />}
                      {editProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogContent sx={{ mt: 3 }}>
                      <Grid container spacing={3}>
                        {/* Name and Category */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Product Name"
                            {...register("name")}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <InventoryIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select
                              {...register("category")}
                              label="Category"
                              startAdornment={
                                <InputAdornment position="start">
                                  <CategoryIcon color="action" />
                                </InputAdornment>
                              }
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
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                {errors.category.message}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        
                        {/* Price and Stock */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            {...register("price")}
                            error={!!errors.price}
                            helperText={errors.price?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoneyIcon color="action" />
                                  ₱
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Stock Quantity"
                            type="number"
                            {...register("stock")}
                            error={!!errors.stock}
                            helperText={errors.stock?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <InventoryIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        {/* Description */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Description"
                            {...register("description")}
                            multiline
                            rows={3}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                                  <DescriptionIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                            placeholder="Enter product description..."
                          />
                        </Grid>
                        
                        {/* Specifications */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Specifications"
                            {...register("specifications")}
                            multiline
                            rows={3}
                            placeholder="Features, dimensions, materials, etc."
                          />
                        </Grid>
                        
                        {/* Upload Images */}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            size="large"
                            startIcon={<ImageIcon />}
                            sx={{ 
                              py: 1.5,
                              borderStyle: "dashed",
                              borderWidth: 2,
                              "&:hover": {
                                borderStyle: "dashed",
                                borderWidth: 2,
                                bgcolor: "#fff8f0"
                              }
                            }}
                          >
                            Upload Product Images
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
                        {(imagePreviews.length > 0 || existingImages.length > 0) && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                              Product Images:
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                              {imagePreviews.map((src, i) => (
                                <Badge
                                  key={i}
                                  badgeContent="New"
                                  color="success"
                                >
                                  <Avatar
                                    src={src}
                                    alt="preview"
                                    sx={{ 
                                      width: 80, 
                                      height: 80,
                                      border: "3px solid #4caf50",
                                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                                    }}
                                    variant="rounded"
                                  />
                                </Badge>
                              ))}
                              {existingImages.map((img) => (
                                <Box key={img.public_id} sx={{ position: "relative" }}>
                                  <Avatar
                                    src={img.url}
                                    alt="existing"
                                    sx={{ 
                                      width: 80, 
                                      height: 80,
                                      border: removedImageIds.has(img.public_id) ? "3px solid #f44336" : "3px solid #ff8c00",
                                      opacity: removedImageIds.has(img.public_id) ? 0.5 : 1,
                                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                      transition: "all 0.2s"
                                    }}
                                    variant="rounded"
                                  />
                                  <Tooltip title={removedImageIds.has(img.public_id) ? "Click to restore" : "Click to remove"} arrow>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        backgroundColor: removedImageIds.has(img.public_id) ? "#4caf50" : "#f44336",
                                        color: "white",
                                        "&:hover": {
                                          backgroundColor: removedImageIds.has(img.public_id) ? "#45a049" : "#d32f2f",
                                          transform: "scale(1.1)"
                                        }
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
                                        <RestoreIcon fontSize="small" />
                                      ) : (
                                        <CloseIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fff8f0" }}>
                      <Button 
                        onClick={closeModal}
                        variant="outlined"
                        size="large"
                        sx={{ px: 3 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit(onSubmit)} 
                        variant="contained"
                        size="large"
                        startIcon={editProduct ? <EditIcon /> : <AddIcon />}
                        sx={{ 
                          px: 4,
                          backgroundColor: "#ff8c00",
                          '&:hover': { backgroundColor: "#e67e00" }
                        }}
                      >
                        {editProduct ? "Save Changes" : "Add Product"}
                      </Button>
                    </DialogActions>
                  </Dialog>

                  {/* Enhanced Snackbar */}
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
                        minWidth: 300,
                        fontSize: "1rem",
                        fontWeight: 600,
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
                      }}
                    >
                      {snackbar.message}
                    </Alert>
                  </Snackbar>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Products;