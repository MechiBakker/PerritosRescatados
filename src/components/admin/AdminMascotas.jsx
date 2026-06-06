import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ImageUpload from "./ImageUpload";

const EMPTY = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  estado: "disponible",
};

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-[#38629F] mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function AdminMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchMascotas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mascotas")
      .select("*")
      .order("created_at", { ascending: false });
    setMascotas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMascotas(); }, []);

  const openNew = () => {
    setForm(EMPTY);
    setModal("new");
  };

  const openEdit = (m) => {
    setForm({ ...m });
    setModal("edit");
  };

  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (modal === "new") {
      const { error } = await supabase.from("mascotas").insert([form]);
      if (!error) { showToast("✅ Mascota agregada"); fetchMascotas(); closeModal(); }
    } else {
      const { id, created_at, ...fields } = form;
      const { error } = await supabase.from("mascotas").update(fields).eq("id", id);
      if (!error) { showToast("✅ Mascota actualizada"); fetchMascotas(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("mascotas").delete().eq("id", deleteId);
    if (!error) { showToast("🗑️ Mascota eliminada"); fetchMascotas(); }
    setDeleteId(null);
  };

  const estadoBadge = (estado) =>
    estado === "adoptado"
      ? "bg-green-100 text-green-700"
      : "bg-[#F7E9DC] text-[#38629F]";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#38629F]">🐾 Mascotas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {mascotas.length} mascota{mascotas.length !== 1 ? "s" : ""} registrada{mascotas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2.5 rounded-full bg-[#38629F] text-white text-sm font-semibold hover:brightness-95 transition"
        >
          + Agregar mascota
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando…</div>
      ) : mascotas.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl">
          No hay mascotas todavía. ¡Agregá la primera!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mascotas.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <div className="relative">
                <img
                  src={m.imagen_url || `https://placehold.co/300x200/eff4fb/38629F?text=${m.nombre}`}
                  alt={m.nombre}
                  className="w-full h-44 object-cover"
                />
                <span
                  className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full ${estadoBadge(m.estado)}`}
                >
                  {m.estado === "adoptado" ? "Adoptado ✓" : "Disponible"}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-[#38629F] text-lg">{m.nombre}</h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2 flex-1">
                  {m.descripcion || "Sin descripción"}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex-1 py-2 rounded-full border border-[#38629F] text-[#38629F] text-sm font-medium hover:bg-[#eff4fb] transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(m.id)}
                    className="flex-1 py-2 rounded-full border border-[#EA4E4E]/40 text-[#EA4E4E] text-sm font-medium hover:bg-red-50 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo / editar */}
      {modal && (
        <Modal
          title={modal === "new" ? "Agregar mascota" : `Editar: ${form.nombre}`}
          onClose={closeModal}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: Luna"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40 resize-none"
                placeholder="Contanos sobre esta mascota…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
              >
                <option value="disponible">Disponible</option>
                <option value="adoptado">Adoptado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Foto
              </label>
              <ImageUpload
                currentUrl={form.imagen_url}
                folder="mascotas"
                onUpload={(url) => setForm({ ...form, imagen_url: url })}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-full bg-[#38629F] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal confirmar eliminar */}
      {deleteId && (
        <Modal title="¿Eliminar mascota?" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 text-sm mb-6">
            Esta acción no se puede deshacer. ¿Seguro que querés eliminar esta mascota?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded-full bg-[#EA4E4E] text-white text-sm font-semibold hover:brightness-95"
            >
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
