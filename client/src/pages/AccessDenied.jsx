import React from "react";
import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full rounded-3xl bg-white border border-slate-200 p-10 shadow-xl text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Access Denied
        </h1>
        <p className="text-slate-600 mb-6">
          You do not have permission to view this page. Admin-only resources are
          protected and require a hospital administrator account.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
