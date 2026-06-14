import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginUser } from "../Services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLoginUser(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user.role);
      localStorage.setItem("userId", res.user._id);
      localStorage.setItem("name", res.user.name);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h1>
        <p className="text-sm text-slate-500 mb-6">
          Hospital owner / admin access only. This page is hidden from standard
          user workflows.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Sign in as admin
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
      </div>
    </div>
  );
}
