import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PerritosRescatadosApp from "./components/PerritosRescatadosApp.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PerritosRescatadosApp />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}