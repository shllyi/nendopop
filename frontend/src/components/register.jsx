import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import apiClient from "../api/client";

const schema = yup.object({
  username: yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await apiClient.post("/api/v1/auth/register", data);
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
      }
      alert(`✅ Registered successfully as ${res.data.user.username}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Registration failed. Try again.");
    }
  };

  return (
    <div className="container">
      <div className="col" style={{ maxWidth: 360, margin: "64px auto" }}>
        <h2 className="text-center mb-16">Register</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="card col">
          <div>
            <input
              {...register("username")}
              type="text"
              placeholder="Username"
              className="input"
            />
            {errors.username && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.username.message}</p>}
          </div>
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
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
