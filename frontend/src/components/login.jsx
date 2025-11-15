import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import apiClient from "../api/client";
import { useNavigate, useLocation } from "react-router-dom";

const schema = yup.object({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = ({ setUser }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    try {
      const { data: response } = await apiClient.post("/api/v1/auth/login", data);

      if (response.success) {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        setUser(response.user);

        // Redirect to target if provided (preserve intended destination), else role-based
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          navigate(redirect);
        } else if (response.user.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="col" style={{ maxWidth: 360, margin: "64px auto" }}>
        <h2 className="text-center mb-16">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="card col">
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="input"
            />
            {errors.email && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="input"
            />
            {errors.password && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn mt-16">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
