import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

function AdminReviews() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/api/v1/reviews');
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  return (
    <div>
      <AdminHeader
        onLogout={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); }}
      />

      <main className="container" style={{ padding: 16 }}>
        <h2 className="mb-16">Product Reviews</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: '#f99' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>User</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>Rating</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>Comment</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>Images</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #333' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 16 }}>No reviews found.</td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r._id}>
                      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.productId?.name || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.userId?.username || r.userId?.email || '-'}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #222', maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comment || ''}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                        <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                          {(r.images || []).map((img, i) => (
                            <img key={i} src={img.url} alt="review" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #333' }} />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminReviews;
