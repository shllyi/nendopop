import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import UserHeader from '../components/UserHeader';

function UserReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState(new Set());
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/v1/reviews/user');
      if (data.success) setReviews(data.reviews || []);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const startEdit = (review) => {
    setEditingId(review._id);
    setForm({ rating: review.rating || 5, comment: review.comment || '' });
    setExistingImages(review.images ? review.images.map((img) => ({ public_id: img.public_id, url: img.url })) : []);
    setRemovedImageIds(new Set());
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setStatus('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ rating: 5, comment: '' });
  };

  const submitEdit = async (review) => {
    try {
      setLoading(true);
      // Update via product reviews endpoint (createOrUpdate handles update)
      const productId = review.productId._id || review.productId;
      // prepare images (new uploads) and retain list for existing images
      const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      let imagesBase64 = [];
      if (newImageFiles.length > 0) {
        imagesBase64 = await Promise.all(newImageFiles.map((f) => fileToBase64(f)));
      }

      const payload = { rating: form.rating, comment: form.comment };
      if (imagesBase64.length > 0) payload.images = imagesBase64;
      // include retain list (public_ids to keep)
      const retain = (existingImages || []).filter(img => !removedImageIds.has(img.public_id)).map(i => i.public_id);
      payload.retainImagePublicIds = retain;

      const { data } = await apiClient.post(`/api/v1/products/${productId}/reviews`, payload);
      if (data.success) {
        setStatus('✅ Review updated');
        setEditingId(null);
        fetchReviews();
      } else {
        setStatus('Failed to update review');
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to update review');
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
          navigate('/home');
        }}
      />

      <div className="container" style={{ padding: 24 }}>
        <h1 className="text-center">My Reviews</h1>

        {status && <p style={{ color: '#f88' }}>{status}</p>}

        {loading && <p>Loading...</p>}

        {!loading && reviews.length === 0 && <p>You haven't written any reviews yet.</p>}

        <div style={{ display: 'grid', gap: 12, maxWidth: 900, margin: '16px auto' }}>
          {reviews.map((r) => (
            <div key={r._id} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{r.productId?.name || 'Product'}</h3>
                  <p style={{ margin: '6px 0', color: '#aaa' }}>Rating: {r.rating} / 5</p>
                </div>
                <div>
                  {editingId === r._id ? (
                    <>
                      <button className="btn outline" onClick={cancelEdit} style={{ marginRight: 8 }}>Cancel</button>
                      <button className="btn" onClick={() => submitEdit(r)} disabled={loading}>Save</button>
                    </>
                  ) : (
                    <button className="btn" onClick={() => startEdit(r)}>Edit</button>
                  )}
                </div>
              </div>

              {editingId === r._id ? (
                <div style={{ marginTop: 12 }}>
                  <label>
                    Rating
                    <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input">
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </label>

                  <label>
                    Comment
                    <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="input" rows={4} />
                  </label>
                  <label>
                    Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setNewImageFiles(files);
                        setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
                      }}
                      className="input"
                    />
                  </label>

                  <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {(newImagePreviews || []).map((src, i) => (
                      <img key={i} src={src} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #333' }} />
                    ))}

                    {(existingImages || []).map((img) => (
                      <div key={img.public_id} style={{ display: 'inline-block', textAlign: 'center' }}>
                        <img src={img.url} alt="existing" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #333' }} />
                        <label style={{ display: 'block', fontSize: 12 }}>
                          <input type="checkbox" checked={removedImageIds.has(img.public_id)} onChange={(e) => {
                            const next = new Set(removedImageIds);
                            if (e.target.checked) next.add(img.public_id); else next.delete(img.public_id);
                            setRemovedImageIds(next);
                          }} /> Remove
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ marginTop: 12 }}>{r.comment || <em>No comment</em>}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default UserReviews;
