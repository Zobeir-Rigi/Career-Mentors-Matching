import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🎨 Fonts & Global Theme Config
import "@fontsource-variable/fraunces";
import "@fontsource-variable/public-sans";
import "./index.css";

import { Landing } from "../src/pages/Landing";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
