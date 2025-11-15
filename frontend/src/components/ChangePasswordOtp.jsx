import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

export default function ChangePasswordOtp({ user }) {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser?.email) setEmail(currentUser.email);
  }, [user]);

  // Client-side validations
  useEffect(() => {
    const errs = { current: '', next: '', confirm: '' };
    if (!currentPassword) errs.current = 'Enter your current password';
    if (newPassword && newPassword.length < 8) errs.next = 'New password must be at least 8 characters';
    if (confirmPassword && confirmPassword !== newPassword) errs.confirm = "Passwords don't match";
    setErrors(errs);
  }, [currentPassword, newPassword, confirmPassword]);

  const formValid = Boolean(
    email && currentPassword && newPassword.length >= 8 && confirmPassword === newPassword &&
    !errors.current && !errors.next && !errors.confirm
  );

  const handleRequestOtp = async () => {
    setStatus('');
    setLoading(true);
    try {
  await apiClient.post(`/api/v1/auth/password-otp/request`, { currentPassword });
      // Open OTP modal
      setShowModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      if (msg.toLowerCase().includes('current password')) {
        setErrors((e) => ({ ...e, current: 'Current password is incorrect' }));
      }
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndChange = async (e) => {
    e?.preventDefault?.();
    setOtpError('');
    setStatus('');
    setLoading(true);
    try {
  const { data } = await apiClient.post(`/api/v1/auth/password-otp/verify`, { otp, newPassword });
      setStatus(data?.message || 'Password updated successfully');
      // Reset state
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP';
      setOtpError(msg);
      // Auto-close the modal after a brief delay
      setTimeout(() => {
        setShowModal(false);
        setOtpError('');
        setOtp('');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="mb-16">Change Password</h2>

      <label>
        Email
        <input className="input" value={email} readOnly disabled placeholder="Email" />
      </label>

      <label>
        Current Password
        <input
          type="password"
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
        />
        {errors.current && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.current}</span>}
      </label>

      <label>
        New Password
        <input
          type="password"
          className="input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        {errors.next && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.next}</span>}
      </label>

      <label>
        Confirm New Password
        <input
          type="password"
          className="input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
        />
        {errors.confirm && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors.confirm}</span>}
      </label>

      <button
        className="btn mt-16"
        onClick={handleRequestOtp}
        disabled={!formValid || loading}
        style={{ opacity: !formValid || loading ? 0.6 : 1, cursor: !formValid || loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Processing...' : 'Change Password'}
      </button>

      {status && <p className="mt-16" style={{ fontSize: '0.9rem' }}>{status}</p>}

      {/* OTP Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#1e1e1e', color: '#fff', padding: 20, borderRadius: 8, width: 360 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Enter OTP</h3>
            <p style={{ fontSize: 13, color: '#bbb' }}>An OTP was sent to your email. Enter the code below.</p>
            <form className="col" onSubmit={verifyOtpAndChange}>
              <input
                className="input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                autoFocus
              />
              {otpError && <span style={{ color: '#e74c3c', fontSize: 12 }}>{otpError}</span>}
              <div className="row" style={{ gap: 8, marginTop: 12 }}>
                <button className="btn" type="submit" disabled={loading || !otp}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button type="button" className="btn" style={{ background: '#555' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
