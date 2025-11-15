import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%)",
          borderLeft: "1px solid rgba(255, 140, 0, 0.1)",
          boxShadow: "-4px 0 20px rgba(255, 140, 0, 0.15)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 8px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "rgba(255, 140, 0, 0.1)",
            transform: "translateX(4px)",
            boxShadow: "0 4px 12px rgba(255, 140, 0, 0.2)",
          },
        },
      },
    },
  },
});

function AdminSidebar({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onClose) onClose();
    navigate(path);
  };

  const handleLogout = () => {
    if (onClose) onClose();
    if (onLogout) onLogout();
    else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const menuItems = [
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Products", icon: <InventoryIcon />, path: "/admin/products" },
    { text: "Categories", icon: <CategoryIcon />, path: "/admin/categories" },
    { text: "Orders", icon: <ShoppingCartIcon />, path: "/admin/orders" },
    { text: "Reviews", icon: <StarIcon />, path: "/admin/reviews" },
    { text: "Profile", icon: <PersonIcon />, path: "/admin/profile" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#ff8c00" }}>
            Admin Panel
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Navigation Items */}
        <List sx={{ flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigate(item.path)}>
                <ListItemIcon sx={{ color: "#ff8c00", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: "#333",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mt: 2, mb: 2 }} />

        {/* Logout Button */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              backgroundColor: "rgba(255, 59, 59, 0.1)",
              border: "1px solid rgba(255, 59, 59, 0.2)",
              borderRadius: 3,
              mx: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 59, 59, 0.2)",
                borderColor: "rgba(255, 59, 59, 0.5)",
                transform: "translateX(4px)",
                boxShadow: "0 4px 12px rgba(255, 59, 59, 0.3)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#ff6b6b", minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 600,
                color: "#ff6b6b",
              }}
            />
          </ListItemButton>
        </ListItem>
      </Drawer>
    </ThemeProvider>
  );
}

export default AdminSidebar;
