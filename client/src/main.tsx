import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🎨 Fonts & Global Theme Config
import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "./index.css";

import { Landing } from "../src/pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { MenteeProfile } from "./pages/MenteeProfile";
import { MenteeDashboard } from "../src/pages/MenteeDashboard";
import { ProfileProvider } from "./lib/context/ProfileProvider";
import { MentorProfile } from "./pages/MentorProfile";
import { AuthProvider } from "./lib/context/AuthProvider";
import { VerifyEmail } from "./pages/VerifyEmail";
import { MentorDashboard } from "./pages/MentorDashboard";
import { ProtectedRoute } from "./lib/context/ProtectedRoute";
import { Staff } from "./pages/Staff";
import { ThemeProvider } from "./lib/context/ThemeProvider";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { NotFound } from "./pages/NotFound";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute allowedRoles={["MENTEE"]} />}>
              <Route
                path="/mentee/profile"
                element={
                  <ProfileProvider role="mentee">
                    <MenteeProfile />
                  </ProfileProvider>
                }
              />

              <Route
                path="/mentee/dashboard"
                element={
                  <ProfileProvider role="mentee">
                    <MenteeDashboard />
                  </ProfileProvider>
                }
              />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["MENTOR"]} />}>
              <Route
                path="/mentor/profile"
                element={
                  <ProfileProvider role="mentor">
                    <MentorProfile />
                  </ProfileProvider>
                }
              />
              <Route
                path="/mentor/dashboard"
                element={
                  <ProfileProvider role="mentor">
                    <MentorDashboard />
                  </ProfileProvider>
                }
              />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/staff" element={<Staff />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
