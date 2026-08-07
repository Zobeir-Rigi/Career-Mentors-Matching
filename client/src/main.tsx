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
import { VerifyEmail } from "./pages/VerifyEmail";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail/>} />

        <Route
          path="/mentee/profile"
          element={
            <ProfileProvider role="mentee">
              <MenteeProfile />
            </ProfileProvider>
          }
        />

        <Route path="/mentee/dashboard" element={<MenteeDashboard />} />
        <Route
          path="/mentor/profile"
          element={
            <ProfileProvider role="mentor">
              <MentorProfile />
            </ProfileProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
