import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Login from "./Login";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminMascotas from "../../components/admin/AdminMascotas";
import AdminTienda from "../../components/admin/AdminTienda";
import AdminEstadisticas from "../../components/admin/AdminEstadisticas";

export default function AdminPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("mascotas");

  // Cargando sesión
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#F7E9DC] flex items-center justify-center">
        <span className="text-[#38629F] text-sm animate-pulse">Cargando…</span>
      </div>
    );
  }

  // Sin sesión → login
  if (!session) return <Login />;

  // Con sesión → panel
  const panels = {
    mascotas: <AdminMascotas />,
    tienda: <AdminTienda />,
    estadisticas: <AdminEstadisticas />,
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {panels[activeTab]}
    </AdminLayout>
  );
}
