import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import UserHeader from "../components/UserHeader";

function Cart() {
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Save updated cart to localStorage
  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // 🗑 Remove item
  const removeItem = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    saveCart(updatedCart);
    setStatus("Item removed from cart ❌");
    setTimeout(() => setStatus(""), 2000);
  };

  // ➕ Increase quantity
  const increaseQty = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updatedCart);
  };

  // ➖ Decrease quantity
  const decreaseQty = (id) => {
    const updatedCart = cart
      .map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
      .filter((item) => item.quantity > 0);
    saveCart(updatedCart);
  };

  // 💸 Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Navigation handlers
  const handleBack = () => {
    // App route for home is "/home"
    navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/user/userprofile');
  };

  const handleCheckout = () => {
    // App route for checkout is "/checkout"
    navigate('/checkout');
  };

  return (
    <>
      <UserHeader
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSearch={() => {}}
      />

      <div className="container" style={{ padding: "32px" }}>
        <h1 className="text-center mb-24">🛒 Your Cart</h1>

        {status && (
          <p className="text-center" style={{ color: "#f88" }}>
            {status}
          </p>
        )}

        {cart.length === 0 ? (
          <div className="text-center">
            <p>Your cart is empty.</p>
            <button className="btn" style={{ marginTop: 16 }} onClick={handleBack}>
              Back to Home
            </button>
          </div>
        ) : (
          <div
            className="cart-items"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {cart.map((item) => (
              <div
                key={item._id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#111",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #333",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={item.image?.url || "/placeholder.png"}
                    alt={item.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      background: "#000",
                    }}
                  />
                  <div>
                    <h3 style={{ marginBottom: 4 }}>{item.name}</h3>
                    <p style={{ fontSize: "0.9rem", color: "#aaa" }}>
                      ₱{item.price.toLocaleString()}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <button
                        className="btn outline"
                        onClick={() => decreaseQty(item._id)}
                        style={{
                          width: "32px",
                          height: "32px",
                          padding: 0,
                        }}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn outline"
                        onClick={() => increaseQty(item._id)}
                        style={{
                          width: "32px",
                          height: "32px",
                          padding: 0,
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}
                >
                  <p style={{ fontWeight: "bold" }}>
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    className="btn outline"
                    onClick={() => removeItem(item._id)}
                    style={{
                      marginTop: "8px",
                      borderColor: "#f33",
                      color: "#f33",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div
              className="total-card"
              style={{
                marginTop: "24px",
                padding: "16px",
                borderTop: "2px solid #333",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Total:</h2>
              <h2>₱{total.toLocaleString()}</h2>
            </div>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button
                className="btn outline"
                style={{ marginRight: "8px" }}
                onClick={handleBack}
              >
                Back to Home
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "#28a745", color: "#fff" }}
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;
