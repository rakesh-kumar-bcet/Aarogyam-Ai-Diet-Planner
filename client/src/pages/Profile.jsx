import React, { useEffect, useState } from "react";
import { updateProfile } from "../Services/authService";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", weight: "", phone: "" });

  useEffect(() => {
    const name = localStorage.getItem("userName") || localStorage.getItem("name") || "";
    const email = localStorage.getItem("userEmail") || localStorage.getItem("email") || "";
    const weight = localStorage.getItem("weight") || localStorage.getItem("userWeight") || "";
    setForm({ name, email, weight, phone: "" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const payload = { name: form.name, weight: form.weight, phone: form.phone };
      const res = await updateProfile(payload);
      // update localStorage
      if (res.user) {
        localStorage.setItem("userName", res.user.name || "");
        if (res.user.weight !== null && res.user.weight !== undefined) {
          localStorage.setItem("weight", String(res.user.weight));
          localStorage.setItem("weightProvided", "true");
        }
      }
      setMsg("Profile saved");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full p-3 border rounded" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
          <input name="email" value={form.email} readOnly className="w-full p-3 border rounded bg-gray-50" />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input name="weight" value={form.weight} onChange={handleChange} type="number" min="1" className="w-full p-3 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-3 border rounded" />
        </div>
        {msg && <p className="text-sm text-green-600 mb-3">{msg}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
          <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded border">Cancel</button>
        </div>
      </form>
    </div>
  );
}
