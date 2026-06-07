import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "./AdminLayout";
import AdminMascotas from "./AdminMascotas";
import AdminTienda from "./AdminTienda";
import AdminEstadisticas from "./AdminEstadisticas";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await login(email, password);
    if (err) setError("Email o contraseña incorrectos.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F7E9DC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/img/LogoTrans1.png"
            alt="Perritos Rescatados"
            className="h-20 w-auto mb-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/80x80/38629F/FFFFFF?text=PR";
            }}
          />
          <h1 className="text-xl font-semibold text-[#38629F]">Panel Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Perritos Rescatados</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40 focus:border-[#38629F]"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40 focus:border-[#38629F]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[#EA4E4E] bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95 disabled:opacity-60 transition mt-2"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Acceso restringido al equipo de Perritos Rescatados
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("mascotas");

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#F7E9DC] flex items-center justify-center">
        <span className="text-[#38629F] text-sm animate-pulse">Cargando…</span>
      </div>
    );
  }

  if (!session) return <Login />;

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
