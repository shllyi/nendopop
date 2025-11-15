import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Get cart and user data from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Update shipping fee when selection changes
  useEffect(() => {
    switch (shipping) {
      case "Luzon":
        setShippingFee(50);
        break;
      case "Visayas":
        setShippingFee(90);
        break;
      case "Mindanao":
        setShippingFee(110);
        break;
      case "International":
        setShippingFee(200);
        break;
      default:
        setShippingFee(0);
    }
  }, [shipping]);

  const totalAmount = subtotal + shippingFee;

  const handleCheckout = async () => {
    if (!address || !phone || !shipping) {
      setStatus("⚠️ Please fill in all fields");
      return;
    }

    if (!user) {
      setStatus("⚠️ Please log in first");
      return;
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post("/api/v1/orders", {
        userId: user._id,
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        address,
        phone,
        shipping,
        shippingFee,
      });

      if (data.success) {
        setStatus("✅ Order placed successfully!");
        localStorage.removeItem("cart");
        setTimeout(() => {
          navigate('/user/home');
        }, 1500);
      } else {
        setStatus("❌ Failed to place order");
      }
    } catch (err) {
      setStatus(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserHeader
        onLogout={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
        }}
        onProfile={() => {
          navigate('/user/profile');
        }}
        onCart={() => {
          navigate('/user/cart');
        }}
        onHome={() => {
          navigate('/user/orders');
        }}
      />

      <div className="container" style={{ maxWidth: 600, margin: "32px auto" }}>
        <div className="card col" style={{ padding: 24 }}>
          <h2>Checkout</h2>

          <p>
            Subtotal: <strong>₱{subtotal.toFixed(2)}</strong>
          </p>

          <label>
            Shipping Location
            <select
              name="shipping"
              className="input"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            >
              <option value="">Select Location</option>
              <option value="Luzon">Luzon - ₱50</option>
              <option value="Visayas">Visayas - ₱90</option>
              <option value="Mindanao">Mindanao - ₱110</option>
              <option value="International">International - ₱200</option>
            </select>
          </label>

          <p>
            Shipping Fee: <strong>₱{shippingFee.toFixed(2)}</strong>
          </p>

          <p style={{ marginBottom: 16 }}>
            <strong>Total: ₱{totalAmount.toFixed(2)}</strong>
          </p>

          <label>
            Address
            <input
              name="address"
              type="text"
              className="input"
              placeholder="Enter delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <label>
            Phone Number
            <input
              name="phone"
              type="text"
              className="input"
              placeholder="Enter contact number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <button
            className="btn mt-16"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

          {status && (
            <p className="text-center mt-16" style={{ color: "#f99" }}>
              {status}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Checkout;
