import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    // Placeholder: In a real app, send reset email
    setMsg('If an account with that email exists, a reset link has been sent.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-2xl font-bold text-center mb-6">Forgot Password</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200">
            Send Reset Link
          </button>
        </form>
        <p className="text-center mt-4">
          <Link to="/login" className="text-blue-500 hover:underline">Back to Login</Link>
        </p>
        <p className="text-green-600 text-center mt-4">{msg}</p>
      </div>
    </div>
  );
}