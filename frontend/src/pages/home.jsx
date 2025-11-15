import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home({ user }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const INITIAL_VISIBLE_COUNT = 12;
  const LOAD_MORE_COUNT = 8;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("none");
  const [dateSort, setDateSort] = useState("none");
  const [alphabeticalSort, setAlphabeticalSort] = useState("none");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const sentinelRef = useRef(null);

  const CarouselArrow = ({ direction, onClick }) => (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Previous" : "Next"}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [direction === "left" ? "left" : "right"]: 18,
        zIndex: 5,
        backgroundColor: "rgba(0,0,0,0.45)",
        color: "#fff",
        border: "none",
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.65)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.45)";
      }}
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get("/api/v1/products");
        const isArchivedFlag = (p) => {
          if (p == null) return false;
          const v = p.isArchived;
          return v === true || v === 'true' || v === 1 || v === '1';
        };
        setProducts((data.products || []).filter((p) => !isArchivedFlag(p)));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart 🛒`);
  };

  const handleView = (id) => {
    navigate(`/product/${id}`);
  };

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) || 
        p.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (ratingFilter !== "all") {
      const minRating = Number(ratingFilter);
      filtered = filtered.filter((product) => {
        const ratingInfo = productRatings[product._id];
        const avgRating = ratingInfo?.average ?? 0;
        return avgRating >= minRating;
      });
    }

    if (priceSort === "low-to-high") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === "high-to-low") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (dateSort === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA;
      });
    } else if (dateSort === "oldest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateA - dateB;
      });
    }

    if (alphabeticalSort === "a-z") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (alphabeticalSort === "z-a") {
      filtered.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount((prev) => {
      const initial = Math.min(INITIAL_VISIBLE_COUNT, filteredProducts.length || INITIAL_VISIBLE_COUNT);
      return prev !== initial ? initial : prev;
    });
  }, [filteredProducts.length, selectedCategory, priceSort, dateSort, alphabeticalSort, ratingFilter, searchQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisibleCount((prev) => {
            if (prev >= filteredProducts.length) return prev;
            return Math.min(prev + LOAD_MORE_COUNT, filteredProducts.length);
          });
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [filteredProducts.length]);

  useEffect(() => {
    if (!products || products.length === 0) {
      setProductRatings({});
      return;
    }

    let cancelled = false;

    const fetchRatings = async () => {
      try {
        const entries = await Promise.all(
          products.map(async (product) => {
            try {
              const { data } = await apiClient.get(`/api/v1/products/${product._id}/reviews`);
              const reviews = data.reviews || [];
              const totalRatings = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
              const average = reviews.length
                ? Math.round((totalRatings / reviews.length) * 10) / 10
                : 0;
              return [product._id, { average, count: reviews.length }];
            } catch (err) {
              console.error(`Failed to load reviews for product ${product._id}`, err);
              return [product._id, { average: 0, count: 0 }];
            }
          })
        );

        if (!cancelled) {
          setProductRatings(Object.fromEntries(entries));
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch product ratings', err);
          setProductRatings({});
        }
      }
    };

    fetchRatings();

    return () => {
      cancelled = true;
    };
  }, [products]);

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #fff8f0 0%, #ffe4cc 50%, #ffd6b3 100%)',
      minHeight: '100vh', 
      width: '100%' 
    }}>
      <UserHeader
        onLogout={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate("/login");
        }}
        onProfile={() => {
          navigate("/user/profile");
        }}
        onCart={() => {
          navigate("/user/cart");
        }}
        onHome={() => {
          navigate("/home");
        }}
      />

      <div
        style={{
          width: '100%',
          marginBottom: 32,
          overflow: 'hidden',
        }}
      >
        <Slider
          {...{
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 4000,
            arrows: true,
            prevArrow: <CarouselArrow direction="left" />,
            nextArrow: <CarouselArrow direction="right" />,
            fade: true,
          }}
        >
            <div>
            <img
              src="/images/nendoroid-banner.jpg"
              alt="nendoroid-banner-1"
              style={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                display: 'block',
              }}
            />
            </div>
            <div>
            <img
              src="/images/nendoroid-banner-2.jpg"
              alt="nendoroid-banner-2"
              style={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                display: 'block',
              }}
            />
            </div>
            <div>
            <img
              src="/images/nendoroid-banner-3.jpg"
              alt="nendoroid-banner-3"
              style={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </Slider>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: '32px 20px' }}>
        {/* Filters Section */}
        <div style={{ 
          background: 'white',
          borderRadius: 16,
          padding: '24px',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(255, 140, 0, 0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 20, 
            flexWrap: 'wrap', 
            gap: 16 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ 
                color: '#ff8c00', 
                margin: 0,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)'
              }}>
                Products
              </h2>
              <span style={{ 
                color: '#fff', 
                fontSize: 14,
                backgroundColor: '#ffa500',
                padding: '4px 12px',
                borderRadius: 20,
                fontWeight: 600
              }}>
                {filteredProducts.length} of {products.length}
              </span>
            </div>
            <div style={{ 
              position: 'relative',
              flex: 1,
              minWidth: 260,
              maxWidth: 420
            }}>
              <input
                type="text"
                placeholder="🔍 Search products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 18px',
                  borderRadius: 40,
                  border: '2px solid #ffa500',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(255, 140, 0, 0.1)',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff8c00';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 140, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ffa500';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 0, 0.1)';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    color: '#ff8c00',
                    padding: 4
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12
          }}>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #ffa500',
                color: '#ff8c00',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#ff8c00'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ffa500'}
            >
              <option value="all">⭐ All Ratings</option>
              <option value="4">⭐ 4 stars & up</option>
              <option value="3">⭐ 3 stars & up</option>
              <option value="2">⭐ 2 stars & up</option>
              <option value="1">⭐ 1 star & up</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #ffa500',
                color: '#ff8c00',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#ff8c00'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ffa500'}
            >
              <option value="all">📁 All Categories</option>
              {categories.filter(c => c !== "all").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={priceSort}
              onChange={(e) => {
                setPriceSort(e.target.value);
                setDateSort("none");
                setAlphabeticalSort("none");
              }}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #ffa500',
                color: '#ff8c00',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#ff8c00'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ffa500'}
            >
              <option value="none">💰 Sort by Price</option>
              <option value="low-to-high">💰 Low to High</option>
              <option value="high-to-low">💰 High to Low</option>
            </select>

            <select
              value={dateSort}
              onChange={(e) => {
                setDateSort(e.target.value);
                setPriceSort("none");
                setAlphabeticalSort("none");
              }}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #ffa500',
                color: '#ff8c00',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#ff8c00'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ffa500'}
            >
              <option value="none">📅 Sort by Date</option>
              <option value="newest">📅 Newest First</option>
              <option value="oldest">📅 Oldest First</option>
            </select>

            <select
              value={alphabeticalSort}
              onChange={(e) => {
                setAlphabeticalSort(e.target.value);
                setPriceSort("none");
                setDateSort("none");
              }}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #ffa500',
                color: '#ff8c00',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#ff8c00'}
              onMouseLeave={(e) => e.target.style.borderColor = '#ffa500'}
            >
              <option value="none">🔤 Alphabetically</option>
              <option value="a-z">🔤 A to Z</option>
              <option value="z-a">🔤 Z to A</option>
            </select>
          </div>
        </div>

        {loading ? (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 60,
              height: 60,
              border: '4px solid #ffe4cc',
              borderTop: '4px solid #ff8c00',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#ff8c00', fontSize: 18, fontWeight: 500 }}>Loading products...</p>
          </div>
        ) : error ? (
          <p style={{ textAlign: 'center', color: "#ff8c00", fontSize: 18 }}>{error}</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(255, 140, 0, 0.08)'
          }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>😢</div>
            <p style={{ color: '#ffa500', fontSize: 20, fontWeight: 500 }}>
              No products found. Try adjusting your filters!
            </p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: 24
            }}>
              {visibleProducts.map((p) => {
                const isHovered = hoveredProductId === p._id;
                const hasSecondImage = p.images && p.images.length > 1;
                const stockCount = typeof p.stock === 'number' ? p.stock : null;
                const isInStock = stockCount != null ? stockCount > 0 : p.isInStock !== false;
                const ratingInfo = productRatings[p._id] || { average: 0, count: 0 };
                const displayRating = ratingInfo.average ?? 0;
                
                return (
                  <div 
                    key={p._id} 
                    style={{ 
                      padding: 0,
                      backgroundColor: 'white',
                      borderRadius: 16,
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isHovered 
                        ? '0 20px 40px rgba(255, 140, 0, 0.25)' 
                        : '0 4px 16px rgba(255, 140, 0, 0.1)',
                      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredProductId(p._id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  >
                    <div
                      style={{
                        height: 300,
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#f7f7f7'
                      }}
                    >
                      {hasSecondImage ? (
                        <>
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'opacity 0.4s ease-in-out',
                              opacity: isHovered ? 0 : 1
                            }}
                          />
                          <img
                            src={p.images[1].url}
                            alt={p.name}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'opacity 0.4s ease-in-out',
                              opacity: isHovered ? 1 : 0
                            }}
                          />
                        </>
                      ) : (
                        <img
                          src={p.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                          alt={p.name}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          padding: '8px 14px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#fff',
                          backgroundColor: isInStock ? '#4caf50' : '#f44336',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {isInStock ? '✓ In Stock' : '✗ Sold Out'}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          padding: '8px 14px',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#fff',
                          backgroundColor: '#ffb300',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span style={{ fontSize: 16 }}>⭐</span>
                        <span>{displayRating || 0}</span>
                        <span style={{ fontSize: 11, opacity: 0.9 }}>({ratingInfo.count})</span>
                      </div>
                    </div>
                    
                    <div style={{ padding: 16 }}>
                      <h3 style={{ 
                        marginTop: 0, 
                        marginBottom: 8,
                        color: '#ff8c00',
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        minHeight: 48,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {p.name}
                      </h3>
                      <p style={{ 
                        color: '#ffa500',
                        fontSize: 14,
                        fontWeight: 500,
                        marginBottom: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {p.category}
                      </p>
                      <p style={{ 
                        fontWeight: 800, 
                        color: '#ff8c00',
                        fontSize: 24,
                        marginBottom: 16
                      }}>
                        ₱{p.price?.toFixed?.(2) ?? p.price}
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleAddToCart(p)}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: '#ff8c00',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(255, 140, 0, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ffa500';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(255, 140, 0, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ff8c00';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 0, 0.3)';
                          }}
                        >
                          🛒 Add
                        </button>
                        <button
                          onClick={() => handleView(p._id)}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            color: '#ff8c00',
                            border: '2px solid #ff8c00',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ff8c00';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(255, 140, 0, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#ff8c00';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                </div>
                );
              })}
                </div>
            
            <div ref={sentinelRef} style={{ height: 1 }} />
            {visibleCount < filteredProducts.length && (
              <div style={{ textAlign: 'center', marginTop: 32, color: '#ff8c00', fontWeight: 600 }}>
                Loading more products...
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Carousel dots styling */
        .slick-dots li button:before {
          color: #ff8c00 !important;
          font-size: 12px !important;
        }
        
        .slick-dots li.slick-active button:before {
          color: #ff8c00 !important;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #ffe4cc;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #ffa500;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #ff8c00;
        }
      `}</style>
    </div>
  );
}