import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
  Chip,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

// Enhanced theme with better visual hierarchy
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
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 4px 20px rgba(255, 140, 0, 0.08)",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(255, 140, 0, 0.15)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(255, 140, 0, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(255, 140, 0, 0.35)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

function Categories() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [archivedCategories, setArchivedCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/categories");
      setCategories(data.categories || []);
    } catch (e) {
      showSnackbar("Failed to load categories", "error");
    }
  };

  const fetchArchivedCategories = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/categories/archived");
      setArchivedCategories(data.categories || []);
    } catch (e) {
      showSnackbar("Failed to load archived categories", "error");
    }
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const openAddModal = () => {
    setEditCategory(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name || '', description: cat.description || '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm({ name: '', description: '' });
    setEditCategory(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showSnackbar("Saving...", "info");
    try {
      if (editCategory) {
        await apiClient.put(`/api/v1/categories/${editCategory._id}`, form);
        showSnackbar("Category updated", "success");
      } else {
        await apiClient.post("/api/v1/categories", form);
        showSnackbar("Category added", "success");
      }
      fetchCategories();
      closeModal();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Save failed", "error");
    }
  };

  const handleArchive = async (cat) => {
    showSnackbar("Processing...", "info");
    try {
      await apiClient.put(`/api/v1/categories/${cat._id}/archive`);
      await fetchCategories();
      await fetchArchivedCategories();
      showSnackbar(cat.isArchived ? "Restored" : "Archived", "success");
    } catch (err) {
      showSnackbar("Archive failed", "error");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      fetchArchivedCategories();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <AdminHeader
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />
        {isSidebarOpen && (
          <Fade in={isSidebarOpen}>
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1,
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setIsSidebarOpen(false)}
            />
          </Fade>
        )}
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
          <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
            <Zoom in={true}>
              <Card 
                sx={{ 
                  maxWidth: 1200, 
                  mx: "auto", 
                  mt: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  {/* Header Section */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 4,
                    gap: 2,
                  }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(255, 140, 0, 0.3)',
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Category Management
                    </Typography>
                  </Box>

                  {/* Stats Cards */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    mb: 3,
                  }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Active Categories
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {categories.length}
                      </Typography>
                    </Paper>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #757575 0%, #9e9e9e 100%)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Archived Categories
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {archivedCategories.length}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Controls Section */}
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                  }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={handleTabChange}
                      sx={{
                        '& .MuiTab-root': {
                          fontWeight: 600,
                          fontSize: '1rem',
                          minWidth: 120,
                          textTransform: 'none',
                        },
                        '& .Mui-selected': {
                          color: '#ff8c00',
                        },
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderRadius: '3px 3px 0 0',
                        },
                      }}
                    >
                      <Tab 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Active
                            <Chip 
                              label={categories.length} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#ff8c00',
                                color: 'white',
                                fontWeight: 700,
                                height: 22,
                              }} 
                            />
                          </Box>
                        }
                      />
                      <Tab 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Archived
                            <Chip 
                              label={archivedCategories.length} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#9e9e9e',
                                color: 'white',
                                fontWeight: 700,
                                height: 22,
                              }} 
                            />
                          </Box>
                        }
                      />
                    </Tabs>
                    <Button 
                      variant="contained" 
                      onClick={openAddModal}
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                      }}
                    >
                      Add Category
                    </Button>
                  </Box>

                  {/* DataGrid */}
                  <Paper
                    elevation={0}
                    sx={{
                      height: 500,
                      width: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid #f5f5f5',
                    }}
                  >
                    <DataGrid
                      rows={activeTab === 0 ? categories : archivedCategories}
                      columns={[
                        {
                          field: 'name',
                          headerName: 'Name',
                          flex: 1,
                          minWidth: 200,
                          renderCell: (params) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {params.value?.charAt(0)?.toUpperCase() || '?'}
                              </Box>
                              <Typography sx={{ fontWeight: 600 }}>
                                {params.value}
                              </Typography>
                            </Box>
                          ),
                        },
                        {
                          field: 'description',
                          headerName: 'Description',
                          flex: 2,
                          minWidth: 300,
                          renderCell: (params) => (
                            <Typography 
                              sx={{ 
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {params.value || 'No description'}
                            </Typography>
                          ),
                        },
                        {
                          field: 'actions',
                          headerName: 'Actions',
                          width: 180,
                          sortable: false,
                          renderCell: (params) => (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {activeTab === 0 ? (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditModal(params.row)}
                                      sx={{
                                        color: '#ff8c00',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                        },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Archive">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleArchive(params.row)}
                                      sx={{
                                        color: '#757575',
                                        '&:hover': {
                                          backgroundColor: 'rgba(117, 117, 117, 0.1)',
                                        },
                                      }}
                                    >
                                      <ArchiveIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title="Restore">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleArchive(params.row)}
                                    sx={{
                                      color: '#4caf50',
                                      '&:hover': {
                                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                      },
                                    }}
                                  >
                                    <UnarchiveIcon fontSize="small" />
                                  </IconButton>
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
                      pageSizeOptions={[5, 10, 25]}
                      disableSelectionOnClick
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                          borderBottom: '1px solid #f5f5f5',
                          py: 1.5,
                          px: 2,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#fff8f0',
                          borderBottom: '2px solid #ff8c00',
                          minHeight: '56px !important',
                          '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: '#ff8c00',
                          },
                        },
                        '& .MuiDataGrid-row': {
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: '#fff8f0',
                            transform: 'scale(1.001)',
                          },
                        },
                        '& .MuiDataGrid-footerContainer': {
                          borderTop: '2px solid #ff8c00',
                          backgroundColor: '#fff8f0',
                        },
                      }}
                    />
                  </Paper>
                </CardContent>
              </Card>
            </Zoom>
          </Box>
        </Box>

        {/* Enhanced Modal */}
        <Dialog 
          open={modalOpen} 
          onClose={closeModal} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Zoom}
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #ff8c00 0%, #ffa500 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editCategory ? <EditIcon sx={{ color: 'white' }} /> : <AddIcon sx={{ color: 'white' }} />}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editCategory ? "Edit Category" : "Add New Category"}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              fullWidth
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff8c00',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff8c00',
                },
              }}
            />
            <TextField
              margin="dense"
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff8c00',
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#ff8c00',
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={closeModal}
              sx={{
                color: '#757575',
                '&:hover': {
                  backgroundColor: 'rgba(117, 117, 117, 0.1)',
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              {editCategory ? "Save Changes" : "Add Category"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default Categories;