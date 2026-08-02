import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🎨 Fonts & Global Theme Config
import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "./index.css";

import { Landing } from "../src/pages/Landing";
import { MenteeProfile } from "./pages/MenteeProfile";
import { ProfileProvider } from "./lib/context/ProfileProvider";
import { MentorProfile } from "./pages/MentorProfile";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mentee/profile" element={<MenteeProfile />} />
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
