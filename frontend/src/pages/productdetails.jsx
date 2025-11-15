import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [tab, setTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [hoveredRelatedId, setHoveredRelatedId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await apiClient.get(`/api/v1/products/${id}`);
      setProduct(data.product || null);
    } catch (err) {
      console.error("Error fetching product details:", err);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    setRevLoading(true);
    setRevError("");
    try {
      const { data } = await apiClient.get(`/api/v1/products/${id}/reviews`);
      setReviews(data.reviews || []);
    } catch (e) {
      setRevError(e.response?.data?.message || "Failed to load reviews");
    } finally {
      setRevLoading(false);
    }
  };

  // Automatic image slideshow
  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % product.images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [product]);

  // Load reviews when switching to tab or on mount for completeness
  useEffect(() => {
    if (tab === 'reviews') fetchReviews();
  }, [tab, id]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFiles = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert('Please select a rating (1-5)');
      return;
    }
    try {
      let imgs = [];
      if (files.length > 0) {
        imgs = await Promise.all(files.map(fileToBase64));
      }
      await apiClient.post(`/api/v1/products/${id}/reviews`, {
        rating,
        comment,
        images: imgs,
      });
      setComment("");
      setFiles([]);
      setRating(0);
      await fetchReviews();
      alert('Review submitted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  useEffect(() => {
    if (!product?._id) {
      setRelatedProducts([]);
      return;
    }

    let cancelled = false;

    const fetchRelated = async () => {
      try {
        const { data } = await apiClient.get("/api/v1/products");
        const isArchivedFlag = (p) => {
          if (!p) return false;
          const v = p.isArchived;
          return v === true || v === "true" || v === 1 || v === "1";
        };

        const allProducts = (data.products || []).filter(
          (p) => p && p._id !== product._id && !isArchivedFlag(p)
        );

        const categoryMatches =
          product.category != null
            ? allProducts.filter((p) => p.category === product.category)
            : [];

        const items = categoryMatches.length > 0 ? categoryMatches : allProducts;

        if (!cancelled) {
          setRelatedProducts(items.slice(0, 6));
        }
      } catch (err) {
        if (!cancelled) {
          setRelatedProducts([]);
        }
        console.error("Failed to load related products", err);
      }
    };

    fetchRelated();

    return () => {
      cancelled = true;
    };
  }, [product?._id, product?.category]);

  const avgRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10; // one decimal
  }, [reviews]);

  if (!product) return <div>Loading...</div>;

  const stockCount = typeof product.stock === "number" ? product.stock : null;
  const isInStock = stockCount != null ? stockCount > 0 : product.isInStock !== false;
  const stockLabel =
    stockCount != null
      ? stockCount > 0
        ? `Stock: ${stockCount}`
        : "No stock"
      : isInStock
      ? "In stock"
      : "No stock";
  const stockColor = isInStock ? "#2ecc71" : "#ff4d4f";
  const outOfStock = !isInStock;

  const addToCart = (qty, { showAlert = true } = {}) => {
    if (outOfStock) {
      if (showAlert) {
        alert("This product is currently out of stock.");
      }
      return false;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    if (showAlert) {
      alert(`${product.name} (x${qty}) added to cart 🛒`);
    }
    return true;
  };

  const handleAddToCart = () => {
    if (outOfStock) {
      alert("This product is currently out of stock.");
      return;
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setQuantity(qty);
    addToCart(qty, { showAlert: true });
  };

  const handleBuyNow = () => {
    if (outOfStock) {
      alert("This product is currently out of stock.");
      return;
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setQuantity(qty);
    const added = addToCart(qty, { showAlert: false });
    if (added) {
      navigate("/user/cart");
    }
  };

  const adjustQuantity = (delta) => {
    setQuantity((prev) => {
      const current = parseInt(prev, 10) || 1;
      return Math.max(1, current + delta);
    });
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
          navigate('/user/userprofile');
        }}
      />

      <div className="container" style={{ maxWidth: 1000, margin: "40px auto" }}>
        <div
          className="row"
          style={{
            gap: 24,
            alignItems: "flex-start",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Product Images */}
          <div style={{ flex: "1 1 400px", textAlign: "center" }}>
            <div style={{ position: "relative" }}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImg]?.url}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: 400,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #333",
                  }}
                />
              ) : (
                <img
                  src="https://via.placeholder.com/600x400?text=No+Image"
                  alt="No Image"
                  style={{
                    width: "100%",
                    height: 400,
                    borderRadius: 8,
                    border: "1px solid #333",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  bottom: 16,
                  background: "rgba(0,0,0,0.6)",
                  color: stockColor,
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: 0.3,
                }}
              >
                {stockLabel}
              </div>
            </div>

            {/* Thumbnail previews */}
            <div
              className="row"
              style={{
                justifyContent: "center",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              {product.images &&
                product.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt="preview"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: i === currentImg ? "2px solid orange" : "1px solid #333",
                    }}
                    onClick={() => setCurrentImg(i)}
                  />
                ))}
            </div>
          </div>

          {/* Product Info */}
          <div style={{ flex: "1 1 400px" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: 8 }}>{product.name}</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: 8 }}>
              ₱{product.price.toFixed(2)}
            </p>
            <p style={{ color: "#888", marginBottom: 8 }}>Category: {product.category}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 4px' }}>
              <label htmlFor="product-quantity" style={{ fontWeight: 600 }}>Quantity</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 8,
                  border: outOfStock ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 140, 0, 0.4)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={outOfStock}
                  style={{
                    padding: "8px 12px",
                    background: outOfStock ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 140, 0, 0.12)",
                    border: "none",
                    color: outOfStock ? "rgba(255, 255, 255, 0.4)" : "#ff8c00",
                    fontSize: 18,
                    cursor: outOfStock ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: outOfStock ? 0.6 : 1,
                  }}
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <input
                  id="product-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  disabled={outOfStock}
                  style={{
                    width: 70,
                    padding: "8px 12px",
                    border: "none",
                    background: "transparent",
                    color: outOfStock ? "rgba(255, 255, 255, 0.5)" : "#fff",
                    fontSize: 16,
                    textAlign: "center",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={outOfStock}
                  style={{
                    padding: "8px 12px",
                    background: outOfStock ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 140, 0, 0.12)",
                    border: "none",
                    color: outOfStock ? "rgba(255, 255, 255, 0.4)" : "#ff8c00",
                    fontSize: 18,
                    cursor: outOfStock ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: outOfStock ? 0.6 : 1,
                  }}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
              <button
                className="btn"
                onClick={handleAddToCart}
                disabled={outOfStock}
                style={{
                  flex: "0 1 180px",
                  background: outOfStock ? "rgba(255, 255, 255, 0.15)" : "#ff9900",
                  color: outOfStock ? "rgba(255, 255, 255, 0.6)" : "#fff",
                  fontWeight: "bold",
                  borderRadius: 6,
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  border: outOfStock ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                  opacity: outOfStock ? 0.7 : 1,
                }}
              >
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                className="btn"
                onClick={handleBuyNow}
                disabled={outOfStock}
                style={{
                  flex: "0 1 180px",
                  background: outOfStock ? "rgba(255, 255, 255, 0.15)" : "#fff",
                  color: outOfStock ? "rgba(255, 255, 255, 0.6)" : "#ff9900",
                  fontWeight: "bold",
                  borderRadius: 6,
                  border: outOfStock ? "1px solid rgba(255, 255, 255, 0.2)" : "2px solid #ff9900",
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  opacity: outOfStock ? 0.7 : 1,
                }}
              >
                Buy Now
              </button>
            </div>

            {outOfStock && (
              <div
                style={{
                  marginTop: 8,
                  color: "#ff4d4f",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span role="img" aria-label="warning">
                  ⚠️
                </span>
                <span>This product is currently out of stock.</span>
              </div>
            )}

            <hr style={{ margin: "16px 0", borderColor: "#333" }} />

            {/* Tabs */}
            <div className="row" style={{ gap: 8, marginBottom: 16 }}>
              <button
                className={`btn outline ${tab === "description" ? "active" : ""}`}
                onClick={() => setTab("description")}
              >
                Description
              </button>
              <button
                className={`btn outline ${tab === "specs" ? "active" : ""}`}
                onClick={() => setTab("specs")}
              >
                Specifications
              </button>
              <button
                className={`btn outline ${tab === "reviews" ? "active" : ""}`}
                onClick={() => setTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {tab === "description" ? (
              <p style={{ color: "#ccc" }}>
                {product.description || "No description available."}
              </p>
            ) : tab === 'specs' ? (
              <p style={{ color: "#ccc" }}>
                {product.specifications || "No specifications provided."}
              </p>
            ) : (
              <div className="col" style={{ gap: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Reviews</h3>
                  <div style={{ fontSize: 14, color: '#bbb' }}>Average: {avgRating} / 5 ({reviews.length})</div>
                </div>

                {/* Only view reviews here; no submission form */}

                {/* Reviews list */}
                {revLoading ? (
                  <p>Loading reviews...</p>
                ) : revError ? (
                  <p style={{ color: '#f99' }}>{revError}</p>
                ) : reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  <div className="col" style={{ gap: 12 }}>
                    {reviews.map((r) => (
                      <div key={r._id} className="card" style={{ padding: 12 }}>
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 'bold' }}>{r.userId?.username || 'User'}</div>
                          <div style={{ color: '#bbb', fontSize: 12 }}>{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ color: '#ffcc00', marginTop: 4 }}>
                          {[1,2,3,4,5].map((n) => (
                            <span key={n}>{n <= (r.rating || 0) ? '★' : '☆'}</span>
                          ))}
                        </div>
                        {r.comment && <p style={{ marginTop: 8 }}>{r.comment}</p>}
                        {r.images && r.images.length > 0 && (
                          <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                            {r.images.map((img, i) => (
                              <img key={i} src={img.url} alt="review" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #333' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <h3 style={{ marginBottom: 16, color: "#ff8c00", fontSize: "1.4rem" }}>You may also like</h3>
            <div
              style={{
                display: "flex",
                gap: 20,
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {relatedProducts.map((p) => {
                const hasSecondImage = p.images && p.images.length > 1;
                const stockCount = typeof p.stock === "number" ? p.stock : null;
                const isInStock = stockCount != null ? stockCount > 0 : p.isInStock !== false;
                const stockText =
                  stockCount != null
                    ? stockCount > 0
                      ? `${stockCount} in stock`
                      : "No stock"
                    : isInStock
                    ? "In stock"
                    : "No stock";
                const isHovered = hoveredRelatedId === p._id;

                return (
                  <div
                    key={p._id}
                    onMouseEnter={() => setHoveredRelatedId(p._id)}
                    onMouseLeave={() => setHoveredRelatedId(null)}
                    onClick={() => navigate(`/product/${p._id}`)}
                    style={{
                      width: 240,
                      backgroundColor: "white",
                      borderRadius: 16,
                      boxShadow: isHovered
                        ? "0 16px 32px rgba(255, 140, 0, 0.2)"
                        : "0 4px 16px rgba(255, 140, 0, 0.12)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      overflow: "hidden",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: 220,
                        background: "#f7f7f7",
                        overflow: "hidden",
                      }}
                    >
                      {hasSecondImage ? (
                        <>
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "opacity 0.35s ease",
                              opacity: isHovered ? 0 : 1,
                            }}
                          />
                          <img
                            src={p.images[1].url}
                            alt={p.name}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "opacity 0.35s ease",
                              opacity: isHovered ? 1 : 0,
                            }}
                          />
                        </>
                      ) : (
                        <img
                          src={p.images?.[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
                          alt={p.name}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: "absolute",
                          left: 12,
                          bottom: 12,
                          background: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {stockText}
                      </div>
                    </div>
                    <div style={{ padding: "14px 16px 16px" }}>
                      <h4 style={{ margin: "0 0 8px", fontSize: 16, color: "#222" }}>{p.name}</h4>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#ff8c00" }}>
                        ₱{(p.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}

export default ProductDetails;
