import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  Divider,
  Tooltip,
  styled,
  alpha
} from "@mui/material";
import {
  Home,
  ShoppingCart,
  Person,
  Logout,
  Search,
  Receipt,
  RateReview
} from "@mui/icons-material";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, rgb(252, 252, 252) 0%, rgb(212, 198, 168) 100%)",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(10px)",
}));

const BrandButton = styled("button")({
  background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  border: "none",
  fontWeight: 800,
  fontSize: 22,
  cursor: "pointer",
  padding: 0,
  letterSpacing: "0.5px",
  transition: "all 0.3s ease",
  fontFamily: "system-ui, -apple-system, sans-serif",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const SearchContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  backgroundColor: alpha("#fff", 0.05),
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease",
  width: "100%",
  maxWidth: 400,
  minWidth: 240,
  "&:hover": {
    backgroundColor: alpha("#fff", 0.08),
  },
  "&:focus-within": {
    backgroundColor: alpha("#fff", 0.08),
    borderColor: "rgba(255, 140, 0, 0.5)",
    boxShadow: "0 0 0 3px rgba(255, 140, 0, 0.1)",
  },
}));

const SearchIconWrapper = styled(Box)({
  padding: "0 12px",
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StyledInputBase = styled(InputBase)({
  color: "#ff8c00",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: "10px 16px 10px 0",
    paddingLeft: "calc(1em + 32px)",
    fontSize: 14,
    "&::placeholder": {
      color: "rgba(255, 140, 0, 0.6)",
      opacity: 1,
    },
  },
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 10,
  padding: 10,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 140, 0, 0.15)",
    borderColor: "rgba(255, 140, 0, 0.4)",
    transform: "translateY(-2px)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 20,
    color: "#000",
  },
}));

const LogoutIconButton = styled(IconButton)(({ theme }) => ({
  background: "rgba(255, 59, 59, 0.1)",
  border: "1px solid rgba(255, 59, 59, 0.2)",
  borderRadius: 10,
  padding: 10,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 59, 59, 0.2)",
    borderColor: "rgba(255, 59, 59, 0.5)",
    transform: "translateY(-2px)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 20,
    color: "#ff6b6b",
  },
}));

function UserHeader({ onLogout, onProfile, onSearch, onCart, onHome }) {
  const navigate = useNavigate();

  const goTo = (path, fallback) => {
    if (typeof fallback === "function") return fallback();
    navigate(path);
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Brand & Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flex: "1 1 auto", maxWidth: 600 }}>
          <BrandButton
            onClick={() => navigate("/admin")}
            aria-label="NendoPop - admin home"
          >
            NendoPop
          </BrandButton>

          <SearchContainer>
            <SearchIconWrapper>
              <Search sx={{ color: "#000" }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products..."
              onChange={(e) => onSearch?.(e.target.value)}
              inputProps={{ "aria-label": "search" }}
            />
          </SearchContainer>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Home" arrow>
            <StyledIconButton
              onClick={() => (onHome ? onHome() : navigate("/home"))}
              aria-label="home"
            >
              <Home />
            </StyledIconButton>
          </Tooltip>

          <Tooltip title="Cart" arrow>
            <StyledIconButton
              onClick={() => (onCart ? onCart() : navigate("/user/cart"))}
              aria-label="cart"
            >
              <ShoppingCart />
            </StyledIconButton>
          </Tooltip>

          <Tooltip title="Profile" arrow>
            <StyledIconButton
              onClick={() => (onProfile ? onProfile() : navigate("/user/profile"))}
              aria-label="profile"
            >
              <Person />
            </StyledIconButton>
          </Tooltip>

          <Tooltip title="My Orders" arrow>
            <StyledIconButton
              onClick={() => navigate("/user/orders")}
              aria-label="my orders"
            >
              <Receipt />
            </StyledIconButton>
          </Tooltip>

          <Tooltip title="My Reviews" arrow>
            <StyledIconButton
              onClick={() => navigate("/user/reviews")}
              aria-label="my reviews"
            >
              <RateReview />
            </StyledIconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: "rgba(255, 255, 255, 0.1)",
              mx: 0.5,
            }}
          />

          <Tooltip title="Logout" arrow>
            <LogoutIconButton onClick={onLogout} aria-label="logout">
              <Logout />
            </LogoutIconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default UserHeader;