import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Login from "./components/login";
import Register from "./components/register";
import Home from "./pages/home";
import AdminDashboard from "./pages/admindashboard";
import AdminOrders from "./pages/adminorders";
import Products from "./pages/products";
import Categories from "./pages/categories";
import AdminProfile from "./pages/adminprofile";
import ArchivedProducts from "./pages/archivedproducts";
import ArchivedCategories from "./pages/archivedcategories";
import Users from "./pages/users";
import AdminReviews from "./pages/adminreviews";
import ProductDetails from "./pages/productdetails";
import UserProfile from "./pages/userprofile";
import Cart from "./pages/cart";
import UserOrders from "./pages/userorders";
import Checkout from "./pages/checkout";
import UserReviews from "./pages/userreviews";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        // Invalid stored user data, clear it
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#fff8f0'
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={user ? <Home user={user} /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
        <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/user/profile" element={user ? <UserProfile user={user} /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
  <Route path="/user/userprofile" element={user ? <UserProfile user={user} /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
  <Route path="/user/cart" element={user ? <Cart /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
        <Route path="/user/orders" element={user ? <UserOrders /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
        <Route path="/checkout" element={user ? <Checkout /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
        <Route path="/user/reviews" element={user ? <UserReviews /> : <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} />} />
        <Route
          path="/admin"
          element={
            user && user.isAdmin ? (
              <AdminDashboard user={user} />
            ) : (
              <Navigate to="/home" />
            )
          }
        />
        <Route
          path="/adminorders"
          element={user && user.isAdmin ? <AdminOrders /> : <Navigate to="/home" />}
        />
        <Route
          path="/admin/orders"
          element={user && user.isAdmin ? <AdminOrders /> : <Navigate to="/home" />}
        />
        <Route
          path="/admin/products"
          element={user && user.isAdmin ? <Products user={user} /> : <Navigate to="/home" />}
        />
        <Route
          path="/admin/categories"
          element={user && user.isAdmin ? <Categories /> : <Navigate to="/home" />}
        />
        <Route
          path="/archivedproducts"
          element={user && user.isAdmin ? <ArchivedProducts /> : <Navigate to="/home" />}
        />
        <Route
          path="/archivedcategories"
          element={user && user.isAdmin ? <ArchivedCategories /> : <Navigate to="/home" />}
        />
        <Route
          path="/admin/profile"
          element={user && user.isAdmin ? <AdminProfile user={user} /> : <Navigate to="/home" />}
        />
        <Route
          path="/admin/users"
          element={user && user.isAdmin ? <Users /> : <Navigate to="/home" />}
        />
        <Route
          path="/adminreviews"
          element={user && user.isAdmin ? <AdminReviews /> : <Navigate to="/home" />}
        />
        <Route
          path="/admin/reviews"
          element={user && user.isAdmin ? <AdminReviews /> : <Navigate to="/home" />}
        />
        {/* Fallback: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
