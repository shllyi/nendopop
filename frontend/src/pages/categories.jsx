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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";

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
      // Refresh both lists to keep UI in sync
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
            <Card sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
              <CardContent>
                <Typography variant="h4" align="center" gutterBottom>
                  Category Management
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Active" />
                    <Tab label="Archived" />
                  </Tabs>
                  <Button variant="contained" onClick={openAddModal}>
                    Add Category
                  </Button>
                </Box>
                {activeTab === 0 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categories.map((cat) => (
                          <TableRow key={cat._id}>
                            <TableCell>{cat.name}</TableCell>
                            <TableCell>{cat.description}</TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => openEditModal(cat)} sx={{ mr: 1 }}>
                                Edit
                              </Button>
                              <Button size="small" onClick={() => handleArchive(cat)}>
                                {cat.isArchived ? "Restore" : "Archive"}
                              </Button>
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
                          <TableCell>Description</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {archivedCategories.map((cat) => (
                          <TableRow key={cat._id}>
                            <TableCell>{cat.name}</TableCell>
                            <TableCell>{cat.description}</TableCell>
                            <TableCell>
                              <Button size="small" onClick={() => handleArchive(cat)}>
                                Restore
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
          <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              margin="dense"
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editCategory ? "Save Changes" : "Add Category"}
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
      </Box>
    </ThemeProvider>
  );
}

export default Categories;
