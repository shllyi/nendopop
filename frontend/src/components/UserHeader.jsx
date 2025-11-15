import React from "react";
import { useNavigate } from "react-router-dom";

function UserHeader({ onLogout, onProfile, onSearch, onCart, onHome }) {
  const navigate = useNavigate();

  const goTo = (path, fallback) => {
    if (typeof fallback === "function") return fallback();
    navigate(path);
  };

  return (
    <header
      className="row"
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        background: "linear-gradient(135deg,rgb(252, 252, 252) 0%,rgb(212, 198, 168) 100%)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      <style>{`
        .user-header__search::placeholder {
          color: rgba(255, 140, 0, 0.6);
        }
      `}</style>

      {/* Brand & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: '1 1 auto', maxWidth: '600px' }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            background: 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            border: 'none',
            fontWeight: 800,
            fontSize: 22,
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          aria-label="NendoPop - admin home"
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          NendoPop
        </button>
        
        {/* Enhanced Search Bar */}
        <div style={{ 
          position: 'relative', 
          flex: 1, 
          minWidth: 240,
          maxWidth: 400,
        }}>
          <svg 
            style={{ 
              position: 'absolute', 
              left: 12, 
              top: '50%', 
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke="#000" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className="user-header__search"
            type="text"
            placeholder="Search products..."
            style={{ 
              width: '100%',
              padding: '10px 16px 10px 40px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              color: '#ff8c00',
              fontSize: 14,
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.borderColor = 'rgba(255, 140, 0, 0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      <div className="row" style={{ alignItems: "center", gap: 12 }}>
        {/* Icon Buttons with improved styling */}
        <button
          title="Home"
          onClick={() => (onHome ? onHome() : navigate("/home"))}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path
              d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Cart Button */}
        <button 
          title="Cart" 
          onClick={() => (onCart ? onCart() : navigate("/user/cart"))}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <circle cx="9" cy="21" r="1" fill="#000" />
            <circle cx="20" cy="21" r="1" fill="#000" />
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Profile Button */}
        <button
          title="Profile"
          onClick={() => (onProfile ? onProfile() : navigate("/user/profile"))}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#000" strokeWidth="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#000" strokeWidth="2" />
          </svg>
        </button>

        {/* My Orders Button */}
        <button
          title="My Orders"
          onClick={() => navigate("/user/orders")}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M3 3h18v4H3z" stroke="#000" strokeWidth="2" />
            <path d="M21 11v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" stroke="#000" strokeWidth="2" />
            <path d="M7 16v2" stroke="#000" strokeWidth="2" />
          </svg>
        </button>

        {/* My Reviews Button */}
        <button
          title="My Reviews"
          onClick={() => navigate("/user/reviews")}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 140, 0, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M12 17l-5 3 1-5-4-3 5-1 2-5 2 5 5 1-4 3 1 5z" stroke="#000" strokeWidth="2" />
          </svg>
        </button>

        {/* Divider */}
        <div style={{ 
          width: 1, 
          height: 28, 
          background: 'rgba(255, 255, 255, 0.1)',
          margin: '0 4px',
        }} />

        {/* Logout Button */}
        <button 
          title="Logout" 
          onClick={onLogout}
          style={{
            background: 'rgba(255, 59, 59, 0.1)',
            border: '1px solid rgba(255, 59, 59, 0.2)',
            borderRadius: 10,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 59, 59, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 59, 59, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 59, 59, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 59, 59, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <rect x="4" y="4" width="12" height="16" rx="2" stroke="#ff6b6b" strokeWidth="2" />
            <path d="M16 12h4m0 0-2-2m2 2-2 2" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default UserHeader;