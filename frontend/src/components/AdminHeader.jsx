import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ShoppingBag as ShoppingBagIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #FCFCFC 0%, #D4C6A8 100%)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

const BrandButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontWeight: 800,
  fontSize: "1.375rem",
  letterSpacing: "0.5px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  textTransform: "none",
  padding: 0,
  minWidth: "auto",
  "&:hover": {
    background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    transform: "scale(1.05)",
  },
  transition: "all 0.3s ease",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: theme.spacing(1.25),
  padding: theme.spacing(1.25),
  color: theme.palette.common.black,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 140, 0, 0.15)",
    borderColor: "rgba(255, 140, 0, 0.4)",
    transform: "translateY(-2px)",
  },
}));

const LogoutButton = styled(IconButton)(({ theme }) => ({
  background: "rgba(255, 59, 59, 0.1)",
  border: "1px solid rgba(255, 59, 59, 0.2)",
  borderRadius: theme.spacing(1.25),
  padding: theme.spacing(1.25),
  color: "#ff6b6b",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 59, 59, 0.2)",
    borderColor: "rgba(255, 59, 59, 0.5)",
    transform: "translateY(-2px)",
  },
}));

function AdminHeader({ onLogout, onToggleSidebar }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          minHeight: { xs: 64, sm: 72 },
        }}
      >
        {/* Brand Section */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BrandButton
            onClick={() => handleNavigate("/admin")}
            aria-label="NendoPop - admin home"
            disableRipple
          >
            NendoPop
          </BrandButton>
        </Box>

        {/* Navigation Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Profile Button */}
          <StyledIconButton
            title="Profile"
            onClick={() => handleNavigate("/admin/profile")}
            size="small"
          >
            <PersonIcon fontSize="small" />
          </StyledIconButton>

          {/* Logout Button */}
          <LogoutButton
            title="Logout"
            onClick={() => {
              if (onLogout) onLogout();
              else navigate("/login");
            }}
            size="small"
          >
            <LogoutIcon fontSize="small" />
          </LogoutButton>

          {/* Menu Toggle Button */}
          <StyledIconButton
            title="Menu"
            onClick={onToggleSidebar}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </StyledIconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default AdminHeader;
