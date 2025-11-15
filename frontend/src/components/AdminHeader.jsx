import React from "react";
import { useNavigate } from "react-router-dom";

function AdminHeader({ onLogout, onToggleSidebar }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <header
      className="row"
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #333",
        position: "sticky",
        top: 0,
        background: "#000",
        zIndex: 10,
      }}
    >
      <div className="row" style={{ alignItems: "center" }}>
        <button
          onClick={() => handleNavigate('/admin')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            marginLeft: 8,
            padding: 0,
          }}
          aria-label="NendoPop - admin home"
        >
          NendoPop
        </button>
      </div>

      <nav className="row" style={{ gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
        {/* Profile icon button */}
        <button
          className="btn outline"
          aria-label="Profile"
          title="Profile"
          onClick={() => handleNavigate('/admin/profile')}
          style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Logout icon button */}
        <button
          className="btn outline"
          aria-label="Logout"
          title="Logout"
          onClick={() => {
            if (onLogout) onLogout();
            else navigate('/login');
          }}
          style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Hamburger on the right */}
        <button
          className="btn outline"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          title="Menu"
          style={{ padding: 8, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </nav>
    </header>
  );
}

export default AdminHeader;
