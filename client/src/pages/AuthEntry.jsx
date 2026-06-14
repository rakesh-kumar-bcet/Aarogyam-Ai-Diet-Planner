import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function AuthEntry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="fixed top-6 left-6 z-50 rounded-full bg-white/90 p-2 shadow-2xl">
        <Logo showText={false} iconClassName="h-14 w-14 rounded-full object-cover" />
      </div>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">Welcome to Aarogyam</h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-4">AI Diet and Nutrition Planner</p>
          <p className="text-gray-600 text-lg">Choose how you'd like to get started</p>
        </div>

        {/* Three Options Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Sign In Card */}
          <div className="flex flex-col justify-between rounded-[24px] border border-slate-200/85 bg-white/95 p-5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-22px_rgba(15,23,42,0.22)]">
            <div>
              <div className="mb-3">
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-700">
                  Sign In
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Already a member?</h3>
              <p className="text-slate-600 text-sm leading-6">Sign in to continue and access your personalized dashboard.</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-slate-800"
            >
              Sign In
            </button>
          </div>

          {/* Register Card */}
          <div className="flex flex-col justify-between rounded-[24px] border border-slate-200/85 bg-white/95 p-5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-22px_rgba(15,23,42,0.22)]">
            <div>
              <div className="mb-3">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-800">
                  Register
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Create your account</h3>
              <p className="text-slate-600 text-sm leading-6">New user? Start now and save your dietary preferences.</p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="mt-5 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-emerald-500"
            >
              Create Account
            </button>
          </div>

          {/* Guest Card */}
          <div className="flex flex-col justify-between rounded-[24px] border border-slate-200/85 bg-white/95 p-5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-22px_rgba(15,23,42,0.22)]">
            <div>
              <div className="mb-3">
                <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-800">
                  Guest Mode
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Try guest mode</h3>
              <p className="text-slate-600 text-sm leading-6">Explore without signing up and generate a plan quickly.</p>
            </div>
            <button
              onClick={() => navigate("/guest-diet-plan")}
              className="mt-5 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-violet-500 whitespace-nowrap"
            >
              Generate Plan
            </button>
          </div>

        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-800 font-medium underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
