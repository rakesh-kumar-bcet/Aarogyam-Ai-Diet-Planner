import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthEntry from "./pages/AuthEntry";
import Home from "./pages/home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AccessDenied from "./pages/AccessDenied";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import DietPlan from "./pages/DietPlan";
import GeneratePlan from "./pages/GeneratePlan";
import PlanResult from "./pages/PlanResult";
import MyPlans from "./pages/MyPlans";
import Improvement from "./pages/Improvement";
import Calories from "./pages/Calories";
import Nutrenist from "./pages/Nutrenist";
import Admin from "./pages/Admin";
import AdminNutritionistProfile from "./pages/AdminNutritionistProfile";
import Profile from "./pages/Profile";
import GuestDietPlan from "./pages/GuestDietPlan";
import NutritionistDirectory from "./pages/NutritionistDirectory";
import CallRoom from "./pages/CallRoom";

import ProtectedRoute from "./components/ProtectedRoute";
import NutrenistRoute from "./components/NutrenistRoute";
import AdminRoute from "./components/AdminRoute";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
        <Route path="/auth-entry" element={<AuthEntry />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/guest-diet-plan" element={<GuestDietPlan />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate-plan"
          element={
            <ProtectedRoute>
              <GeneratePlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/plan-result"
          element={
            <ProtectedRoute>
              <PlanResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diet-plan"
          element={
            <ProtectedRoute>
              <DietPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-plans"
          element={
            <ProtectedRoute>
              <MyPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/improvement"
          element={
            <ProtectedRoute>
              <Improvement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calories"
          element={
            <ProtectedRoute>
              <Calories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nutritionist-directory"
          element={
            <ProtectedRoute>
              <NutritionistDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/call/:targetId"
          element={
            <ProtectedRoute>
              <CallRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nutrenist"
          element={
            <NutrenistRoute>
              <Nutrenist />
            </NutrenistRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/nutritionist/:id"
          element={
            <AdminRoute>
              <AdminNutritionistProfile />
            </AdminRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
