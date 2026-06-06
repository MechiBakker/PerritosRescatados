import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { id: "mascotas", label: "🐾 Mascotas", icon: "🐾" },
  { id: "tienda", label: "🛍️ Tienda", icon: "🛍️" },
  { id: "estadisticas", label: "📊 Estadísticas", icon: "📊" },
];

export default function AdminLayout({ children, activeTab, setActiveTab }) {
  const { logout, session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7E9DC] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#38629F] text-white shadow-md">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-xl"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/img/Logo1.jpg"
                alt="Perritos Rescatados"
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/32x32/38629F/FFFFFF?text=PR";
                }}
              />
              <span className="font-semibold text-sm">Panel Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-xs text-white/70">
              {session?.user?.email}
            </span>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-full border border-white/40 hover:bg-white/10 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1100px] mx-auto w-full px-4 py-6 gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col gap-1 w-52 shrink-0">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-left transition ${
                activeTab === item.id
                  ? "bg-[#38629F] text-white shadow"
                  : "bg-white text-slate-600 hover:bg-[#eff4fb]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label.replace(/^..\s/, "")}
            </button>
          ))}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 bg-white hover:bg-[#eff4fb] transition"
          >
            🌐 Ver sitio web
          </a>
        </aside>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-6 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">
                Menú
              </p>
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-left transition ${
                    activeTab === item.id
                      ? "bg-[#38629F] text-white"
                      : "text-slate-600 hover:bg-[#eff4fb]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-[#eff4fb]"
              >
                🌐 Ver sitio web
              </a>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
