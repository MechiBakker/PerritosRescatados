import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const anioActual = new Date().getFullYear();
const ANIOS = [anioActual - 1, anioActual, anioActual + 1];

function StatCard({ emoji, label, value, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow p-6 flex flex-col gap-1 border-t-4 ${color}`}>
      <span className="text-3xl">{emoji}</span>
      <span className="text-3xl font-bold text-slate-800 mt-1">{value ?? "—"}</span>
      <span className="text-slate-500 text-sm">{label}</span>
    </div>
  );
}

export default function AdminEstadisticas() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    mes: new Date().getMonth() + 1,
    anio: anioActual,
    rescates: "",
    adopciones: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchStats = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("estadisticas")
      .select("*")
      .order("anio", { ascending: false })
      .order("mes", { ascending: false });
    setStats(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  // Pre-llenado al cambiar mes/año
  useEffect(() => {
    const existing = stats.find(
      (s) => s.mes === Number(form.mes) && s.anio === Number(form.anio)
    );
    if (existing) {
      setForm((f) => ({
        ...f,
        rescates: existing.rescates,
        adopciones: existing.adopciones,
      }));
    } else {
      setForm((f) => ({ ...f, rescates: "", adopciones: "" }));
    }
  }, [form.mes, form.anio, stats]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      mes: Number(form.mes),
      anio: Number(form.anio),
      rescates: Number(form.rescates) || 0,
      adopciones: Number(form.adopciones) || 0,
    };

    // upsert: si ya existe para ese mes/año, lo actualiza
    const { error } = await supabase
      .from("estadisticas")
      .upsert(payload, { onConflict: "mes,anio" });

    if (!error) {
      showToast("Estadísticas guardadas");
      fetchStats();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("estadisticas").delete().eq("id", id);
    if (!error) { showToast("🗑️ Registro eliminado"); fetchStats(); }
  };

  // Totales globales
  const totalRescates = stats.reduce((a, s) => a + (s.rescates || 0), 0);
  const totalAdopciones = stats.reduce((a, s) => a + (s.adopciones || 0), 0);

  // Mes seleccionado actualmente
  const mesActual = stats.find(
    (s) => s.mes === Number(form.mes) && s.anio === Number(form.anio)
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#38629F]">📊 Estadísticas</h1>
        <p className="text-slate-500 text-sm mt-1">
          Registrá rescates y adopciones por mes. Estos datos se muestran públicamente en el sitio.
        </p>
      </div>

      {/* Tarjetas de totales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Rescates totales"
          value={totalRescates}
          color="border-[#38629F]"
        />
        <StatCard
          label="Adopciones totales"
          value={totalAdopciones}
          color="border-[#F5793B]"
        />
        <StatCard
          label={`Rescates ${MESES[(Number(form.mes) || 1) - 1]}`}
          value={mesActual?.rescates ?? "—"}
          color="border-[#eff4fb]"
        />
        <StatCard
          label={`Adopciones ${MESES[(Number(form.mes) || 1) - 1]}`}
          value={mesActual?.adopciones ?? "—"}
          color="border-[#F7E9DC]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-[#38629F] mb-5">
            Cargar datos mensuales
          </h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mes
                </label>
                <select
                  value={form.mes}
                  onChange={(e) => setForm({ ...form, mes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                >
                  {MESES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Año
                </label>
                <select
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                >
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                🐕 Rescates del mes
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.rescates}
                onChange={(e) => setForm({ ...form, rescates: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: 8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                🏡 Adopciones del mes
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.adopciones}
                onChange={(e) => setForm({ ...form, adopciones: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: 5"
              />
            </div>

            <p className="text-xs text-slate-400">
              Si ya existe un registro para ese mes/año, se actualizará automáticamente.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-full bg-[#38629F] text-white font-semibold text-sm hover:brightness-95 disabled:opacity-60 transition mt-1"
            >
              {saving ? "Guardando…" : "Guardar estadísticas"}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#38629F]">Historial</h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Cargando…</p>
          ) : stats.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Todavía no hay registros. ¡Cargá el primero!
            </p>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-1">
              {stats.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F7E9DC]/50 hover:bg-[#F7E9DC] transition"
                >
                  <div>
                    <span className="text-sm font-medium text-[#38629F]">
                      {MESES[s.mes - 1]} {s.anio}
                    </span>
                    <span className="text-xs text-slate-500 ml-3">
                      🐕 {s.rescates} rescates · 🏡 {s.adopciones} adopciones
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs text-[#EA4E4E]/70 hover:text-[#EA4E4E] transition px-2"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
