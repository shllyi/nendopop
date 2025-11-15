import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    if (!user) {
      setStatus("⚠️ Please log in first");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get(
          `/api/v1/orders/user/${user._id}`
        );
        if (data.success) {
          setOrders(data.orders);
        } else {
          setStatus("❌ Failed to load your orders");
        }
      } catch (err) {
        setStatus(err.response?.data?.message || "❌ Unable to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const grouped = useMemo(() => {
    const groups = { Pending: [], Shipped: [], Delivered: [], Cancelled: [], Completed: [] };
    for (const o of orders) {
      if (groups[o.status]) groups[o.status].push(o);
    }
    return groups;
  }, [orders]);

  const [tab, setTab] = useState('Pending');

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState({ productId: '', productName: '' });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState([]);

  const cancelOrder = async (orderId) => {
    try {
      const { data } = await apiClient.put(`/api/v1/orders/${orderId}/cancel`);
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel order');
    }
  };

  const confirmReceived = async (orderId) => {
    try {
      const { data } = await apiClient.put(`/api/v1/orders/${orderId}/confirm`);
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to confirm receipt');
    }
  };

  const openReview = (product) => {
    setReviewTarget({ productId: product.productId || product._id, productName: product.name });
    setReviewRating(0);
    setReviewComment('');
    setReviewFiles([]);
    setShowReviewModal(true);
  };

  const handleReviewFiles = (e) => {
    setReviewFiles(Array.from(e.target.files || []));
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget.productId) return;
    if (reviewRating < 1 || reviewRating > 5) {
      alert('Please select a rating (1-5)');
      return;
    }
    try {
      let imgs = [];
      if (reviewFiles.length > 0) {
        imgs = await Promise.all(reviewFiles.map(fileToBase64));
      }
      await apiClient.post(`/api/v1/products/${reviewTarget.productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        images: imgs,
      });
      setShowReviewModal(false);
      setReviewFiles([]);
      setReviewComment('');
      setReviewRating(0);
      setReviewTarget({ productId: '', productName: '' });
      alert('Review submitted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const navigate = useNavigate();

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
          navigate('/user/home');
        }}
      />

      <div className="container" style={{ maxWidth: "900px", margin: "32px auto" }}>
        <h2 className="text-center mb-16">🧾 My Orders</h2>

        {/* Tabs */}
        <div className="row" style={{ gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {['Pending','Shipped','Delivered','Cancelled','Completed'].map((t) => (
            <button
              key={t}
              className={`btn outline ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <p className="text-center">Loading your orders...</p>
        ) : status ? (
          <p className="text-center" style={{ color: "#f99" }}>
            {status}
          </p>
        ) : (grouped[tab] || []).length === 0 ? (
          <p className="text-center">You have no orders yet.</p>
        ) : (
          <div className="orders-list">
            {(grouped[tab] || []).map((order) => (
              <div
                key={order._id}
                className="card"
                style={{
                  marginBottom: 20,
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                }}
              >
                <h3 style={{ marginBottom: 8 }}>
                  Order #{order._id.slice(-6).toUpperCase()}
                </h3>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>Total:</strong> ₱{order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Shipping:</strong> {order.shipping} (₱{order.shippingFee})
                </p>
                <p>
                  <strong>Address:</strong> {order.address}
                </p>
                <p>
                  <strong>Phone:</strong> {order.phone}
                </p>

                <div style={{ marginTop: 10 }}>
                  <strong>Items:</strong>
                  <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity} — ₱
                        {(item.price * item.quantity).toFixed(2)}
                        {order.status === 'Completed' && (
                          <button
                            className="btn outline"
                            style={{ marginLeft: 8, padding: '2px 8px', fontSize: 12 }}
                            onClick={() => openReview(item)}
                          >
                            Write a review
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>

                {/* Actions based on status */}
                {order.status === 'Pending' && (
                  <div className="row" style={{ gap: 8, marginTop: 8 }}>
                    <button className="btn outline" onClick={() => cancelOrder(order._id)}>Cancel Order</button>
                  </div>
                )}
                {order.status === 'Delivered' && (
                  <div className="row" style={{ gap: 8, marginTop: 8 }}>
                    <button className="btn" onClick={() => confirmReceived(order._id)}>Order Received</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div
          onClick={() => setShowReviewModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        >
          <div
            className="card col"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, width: '95%', padding: 16, border: '2px solid #444' }}
          >
            <h3 style={{ marginTop: 0 }}>Write a Review</h3>
            <p style={{ color: '#bbb', marginTop: -8 }}>Product: <strong>{reviewTarget.productName}</strong></p>

            <form className="col" onSubmit={submitReview}>
              <div className="row" style={{ alignItems: 'center', gap: 8 }}>
                <div>Rating:</div>
                {[1,2,3,4,5].map((n) => (
                  <span key={n} style={{ cursor: 'pointer', fontSize: 22 }} onClick={() => setReviewRating(n)}>
                    {n <= reviewRating ? '★' : '☆'}
                  </span>
                ))}
                <span style={{ marginLeft: 8, color: '#bbb' }}>{reviewRating || 0}/5</span>
              </div>

              <label>
                Comment
                <textarea className="input" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience" />
              </label>

              <label>
                Images
                <input type="file" accept="image/*" multiple onChange={handleReviewFiles} className="input" />
              </label>

              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <button className="btn" type="submit" disabled={reviewRating < 1}>Submit</button>
                <button type="button" className="btn outline" onClick={() => setShowReviewModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserOrders;
