import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("user");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("userName");
    localStorage.removeItem("email");
    localStorage.removeItem("weight");
    localStorage.removeItem("weightProvided");

    try {
      const res = await loginUser({ ...form, role: selectedRole });
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user.role);
      localStorage.setItem("userId", res.user._id);
      localStorage.setItem("userName", res.user.name);
      localStorage.setItem("name", res.user.name);
      localStorage.setItem("email", res.user.email || "");
      if (res.user.weight !== undefined && res.user.weight !== null) {
        localStorage.setItem("weight", String(res.user.weight));
        localStorage.setItem("weightProvided", "true");
      }

      if (res.user.role !== selectedRole) {
        alert(
          `You selected ${selectedRole}, but your account is ${res.user.role}. Redirecting to the correct dashboard.`,
        );
      }

      navigate(res.user.role === "nutrenist" ? "/nutrenist" : "/dashboard");
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("name");
      localStorage.removeItem("userName");
      localStorage.removeItem("email");
      localStorage.removeItem("weight");
      localStorage.removeItem("weightProvided");
      setMsg(err.response?.data?.message || "Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Login</h2>

        <div className="mb-5">
          <p className="text-sm text-gray-600 mb-2">Login as</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "user", label: "User" },
              { key: "nutrenist", label: "Nutritionist" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedRole(option.key)}
                className={`py-3 rounded-lg border font-semibold transition ${
                  selectedRole === option.key
                    ? "border-blue-600 bg-blue-500 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
          Login
        </button>

        <div className="flex items-center justify-between mt-4 text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
          <Link to="/register" className="text-gray-600 hover:text-gray-900">
            Create account
          </Link>
        </div>

        {msg && <p className="text-red-500 mt-4">{msg}</p>}
      </form>
    </div>
  );
}
