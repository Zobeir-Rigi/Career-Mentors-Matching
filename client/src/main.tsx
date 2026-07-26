import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🎨 Fonts & Global Theme Config
import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "./index.css";

import { Landing } from "../src/pages/Landing";
import { MenteeProfile } from "./pages/MenteeProfile";
import { MenteeDashboard } from "../src/pages/MenteeDashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mentee/profile" element={<MenteeProfile />} />
        <Route path="/mentee/dashboard" element={<MenteeDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
