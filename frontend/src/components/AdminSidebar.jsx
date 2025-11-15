import React from "react";
import { useNavigate } from "react-router-dom";

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

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : -320,
    height: '100vh',
    width: 320,
    background: '#111',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transition: 'right 0.25s ease',
    zIndex: 50,
    overflowY: 'auto',
  };

  return (
    <aside className={`drawer ${isOpen ? "open" : ""}`} style={drawerStyle}>
      {/* Sidebar items: icons + label. Use semantic buttons with a single class for styling. */}
      <button className="sidebar-btn" onClick={() => handleNavigate("/admin/users")}>
        {/* Heroicon: Users */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-3a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>Users</span>
      </button>
      <button className="sidebar-btn" onClick={() => handleNavigate("/admin/products")}>
        {/* Heroicon: Cube / Collection */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0v6a2 2 0 01-1 1.732l-7 4a2 2 0 01-2 0l-7-4A2 2 0 014 13V7" />
        </svg>
        <span>Products</span>
      </button>
      <button className="sidebar-btn" onClick={() => handleNavigate("/admin/categories")}>
        {/* Heroicon: Tag */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7a3 3 0 100-6 3 3 0 000 6zM3 9v6a2 2 0 002 2h6l8-8-6-6L3 9z" />
        </svg>
        <span>Categories</span>
      </button>
      <button className="sidebar-btn" onClick={() => handleNavigate("/admin/orders")}>
        {/* Heroicon: Clipboard List / Orders */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M9 16h6M9 8h6M7 20h10a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H7a2 2 0 00-2 2v13a2 2 0 002 2z" />
        </svg>
        <span>Orders</span>
      </button>
      <button className="sidebar-btn" onClick={() => handleNavigate("/admin/reviews")}>
        {/* Heroicon: Star */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.962c.3.921-.755 1.688-1.54 1.118l-3.371-2.448a1 1 0 00-1.176 0l-3.371 2.448c-.784.57-1.84-.197-1.54-1.118l1.287-3.962a1 1 0 00-.364-1.118L2.064 9.39c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.962z" />
        </svg>
        <span>Reviews</span>
      </button>
      <button className="sidebar-btn" onClick={() => handleNavigate("/admin/profile")}>
        {/* Heroicon: User */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 0112 15c2.761 0 5.26 1.12 7.071 2.944M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Profile</span>
      </button>
      <div style={{ marginTop: "auto" }}>
        <button className="sidebar-btn logout" style={{ width: "100%" }} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ marginLeft: 8 }}>Logout</span>
        </button>
      </div>
      {isOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          style={{ marginTop: 8 }}
          className="btn outline"
        >
          Close
        </button>
      )}
    </aside>
  );
}

export default AdminSidebar;
