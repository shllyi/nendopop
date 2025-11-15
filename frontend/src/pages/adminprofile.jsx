import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import ChangePasswordOtp from "../components/ChangePasswordOtp";

function AdminProfile({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", address: "", phone: "", gender: "", password: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initialUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (initialUser) {
      setForm((prev) => ({ ...prev,
        username: initialUser.username || "",
        email: initialUser.email || "",
        firstName: initialUser.firstName || "",
        lastName: initialUser.lastName || "",
        address: initialUser.address || "",
        phone: initialUser.phone || "",
        gender: initialUser.gender || "",
      }));
      const initialAvatarUrl = initialUser?.avatar?.url || initialUser?.avatarUrl || "";
      if (initialAvatarUrl) setAvatarPreview(initialAvatarUrl);
    }
  }, [user]);

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview("");
    }
  };
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      let responseUser = null;
      let avatarBase64;
      if (avatarFile) {
        avatarBase64 = await fileToBase64(avatarFile);
      }
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        userId: storedUser?._id,
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phone: form.phone,
        gender: form.gender,
        ...(form.password ? { password: form.password } : {}),
        ...(avatarBase64 ? { avatar: avatarBase64 } : {}),
      };
      const { data } = await apiClient.put("/api/v1/auth/profile", payload);
      responseUser = data?.user;
      if (data?.warning) setStatus(data.warning + " — other fields saved ✅");
      if (responseUser) {
        localStorage.setItem("user", JSON.stringify(responseUser));
        const newAvatarUrl = responseUser?.avatar?.url;
        if (newAvatarUrl) setAvatarPreview(newAvatarUrl);
      } else {
        const merged = { ...(user || {}), ...form };
        delete merged.password;
        if (!avatarFile && avatarPreview) {
          merged.avatar = { ...(merged.avatar || {}), url: avatarPreview };
          merged.avatarUrl = avatarPreview;
        }
        localStorage.setItem("user", JSON.stringify(merged));
      }
      setStatus("Saved ✅");
    } catch (err) {
      setStatus(err.response?.data?.message || "Save failed");
    }
  };
  return (
    <div>
      <AdminHeader
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      {isSidebarOpen && <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />}
      <div className="row" style={{ alignItems: "flex-start" }}>
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className="container" style={{ padding: 16 }}>
          <div className="card col" style={{ maxWidth: 600, margin: "64px auto" }}>
            <h1 className="text-center mb-16">Admin Profile</h1>
            <div className="row" style={{ gap: 8, marginBottom: 16 }}>
              <button className="btn" style={{ backgroundColor: activeTab === 'profile' ? '#333' : '#666' }} onClick={() => setActiveTab('profile')}>Profile</button>
              <button className="btn" style={{ backgroundColor: activeTab === 'password' ? '#333' : '#666' }} onClick={() => setActiveTab('password')}>Change Password</button>
            </div>

            {activeTab === 'profile' && (
            <form className="col" onSubmit={handleSubmit}>
              <div className="row" style={{ alignItems: "center" }}>
                <div style={{ width: 96, height: 96, borderRadius: 8, border: "1px solid #333", overflow: "hidden", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 12, color: "#bbb" }}>No avatar</span>
                  )}
                </div>
                <div className="col" style={{ flex: 1 }}>
                  <label>
                    Avatar
                    <input type="file" accept="image/*" onChange={handleAvatar} className="input" />
                  </label>
                </div>
              </div>
              <label>
                Username
                <input name="username" className="input" value={form.username} onChange={handleChange} placeholder="Username" required />
              </label>
              <label>
                Email
                <input type="email" name="email" className="input" value={form.email} onChange={handleChange} placeholder="Email" required />
              </label>
              <div className="row">
                <label style={{ flex: 1 }}>
                  First name
                  <input name="firstName" className="input" value={form.firstName} onChange={handleChange} placeholder="First name" />
                </label>
                <label style={{ flex: 1 }}>
                  Last name
                  <input name="lastName" className="input" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                </label>
              </div>
              <label>
                Address
                <input name="address" className="input" value={form.address} onChange={handleChange} placeholder="Address" />
              </label>
              <div className="row">
                <label style={{ flex: 1 }}>
                  Phone number
                  <input name="phone" className="input" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                </label>
                <label style={{ flex: 1 }}>
                  Gender
                  <select name="gender" className="input" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </label>
              </div>
              <button className="btn mt-16" type="submit">Save</button>
              {status && <p className="text-center mt-16" style={{ fontSize: "0.875rem" }}>{status}</p>}
            </form>
            )}

            {activeTab === 'password' && (
              <div style={{ marginTop: 8 }}>
                <ChangePasswordOtp user={user} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default AdminProfile;


