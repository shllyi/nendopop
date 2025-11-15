import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import apiClient from "../api/client";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import ChangePasswordOtp from "../components/ChangePasswordOtp";

const schema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  address: yup.string().required("Address is required"),
  phone: yup.string().matches(/^\+?\d{7,15}$/, "Invalid phone number format (7-15 digits)").optional(),
  gender: yup.string(),
});

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [status, setStatus] = useState("");

  // 🧠 Load current user info
  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "null");
    if (currentUser) {
      setValue("username", currentUser.username || "");
      setValue("email", currentUser.email || "");
      setValue("firstName", currentUser.firstName || "");
      setValue("lastName", currentUser.lastName || "");
      setValue("address", currentUser.address || "");
      setValue("phone", currentUser.phone || "");
      setValue("gender", currentUser.gender || "");
      const avatarUrl = currentUser?.avatar?.url || currentUser?.avatarUrl || "";
      if (avatarUrl) setAvatarPreview(avatarUrl);
    } else {
      navigate("/login");
    }
  }, [user, navigate, setValue]);

  // 🧩 Convert file → base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 🖼️ Handle avatar selection
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

  // 💾 Handle Save
  const onSubmit = async (data) => {
    setStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let avatarBase64;
      if (avatarFile) avatarBase64 = await fileToBase64(avatarFile);

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        userId: storedUser?._id,
        ...data,
        ...(avatarBase64 ? { avatar: avatarBase64 } : {}),
      };

      const { data: response } = await apiClient.put(`/api/v1/auth/profile`, payload, { headers });

      if (response?.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        setAvatarPreview(response.user?.avatar?.url || avatarPreview);
      }

      setStatus("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      setStatus(error.response?.data?.message || "Failed to update profile ❌");
    }
  };

  // 🚪 Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate("/login");
  };

  // 🔍 Handle search
  const handleSearch = (query) => {
    console.log("Searching:", query);
  };

  return (
    <div>
      {/* 🧭 Header */}
      <UserHeader onLogout={handleLogout} onSearch={handleSearch} />

      {/* Tabs */}
      <div className="container" style={{ maxWidth: 800, margin: "64px auto", padding: "16px" }}>
        <div className="row" style={{ gap: 8, marginBottom: 16 }}>
          <button className="btn" style={{ backgroundColor: activeTab === 'profile' ? '#333' : '#666' }} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className="btn" style={{ backgroundColor: activeTab === 'password' ? '#333' : '#666' }} onClick={() => setActiveTab('password')}>Change Password</button>
        </div>

        {activeTab === 'profile' && (
        <>
        <h1 className="text-center mb-16">My Profile</h1>
        <form className="col" onSubmit={handleSubmit(onSubmit)}>
          {/* Avatar */}
          <div className="row" style={{ alignItems: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 8,
                border: "1px solid #333",
                overflow: "hidden",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 12, color: "#bbb" }}>No avatar</span>
              )}
            </div>
            <div className="col" style={{ flex: 1, marginLeft: 16 }}>
              <label>
                Avatar
                <input type="file" accept="image/*" onChange={handleAvatar} className="input" />
              </label>
            </div>
          </div>

          {/* User Info */}
          <label>
            Username
            <input
              {...register("username")}
              className="input"
              placeholder="Username"
            />
            {errors.username && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.username.message}</p>}
          </label>
          <label>
            Email
            <input
              {...register("email")}
              type="email"
              className="input"
              placeholder="Email"
            />
            {errors.email && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.email.message}</p>}
          </label>

          <div className="row">
            <label style={{ flex: 1 }}>
              First Name
              <input
                {...register("firstName")}
                className="input"
                placeholder="First name"
              />
              {errors.firstName && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.firstName.message}</p>}
            </label>
            <label style={{ flex: 1 }}>
              Last Name
              <input
                {...register("lastName")}
                className="input"
                placeholder="Last name"
              />
              {errors.lastName && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.lastName.message}</p>}
            </label>
          </div>

          <label>
            Address
            <input
              {...register("address")}
              className="input"
              placeholder="Address"
            />
            {errors.address && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.address.message}</p>}
          </label>

          <div className="row">
            <label style={{ flex: 1 }}>
              Phone
              <input
                {...register("phone")}
                className="input"
                placeholder="Phone number"
              />
              {errors.phone && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.phone.message}</p>}
            </label>
            <label style={{ flex: 1 }}>
              Gender
              <select
                {...register("gender")}
                className="input"
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
          </div>

          {/* Password changes are handled in the separate Change Password tab */}

          {/* Save button */}
          <button className="btn mt-16" type="submit">Save</button>
          {status && (
            <p className="text-center mt-16" style={{ fontSize: "0.875rem" }}>
              {status}
            </p>
          )}
        </form>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="btn mt-16"
          style={{ backgroundColor: "#b33", color: "white" }}
        >
          Logout
        </button>
        </>
        )}

        {activeTab === 'password' && (
          <div style={{ marginTop: 8 }}>
            <ChangePasswordOtp user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;