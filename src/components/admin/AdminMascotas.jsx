import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MultiImageUpload from "./ImageUpload";

const EMPTY = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  imagen_url_2: "",
  imagen_url_3: "",
  imagen_url_4: "",
  imagen_url_5: "",
  estado: "disponible",
};

const urlsToArray = (m) =>
  [m.imagen_url, m.imagen_url_2, m.imagen_url_3, m.imagen_url_4, m.imagen_url_5].filter(Boolean);

const arrayToUrls = (arr) => ({
  imagen_url: arr[0] || "",
  imagen_url_2: arr[1] || "",
  imagen_url_3: arr[2] || "",
  imagen_url_4: arr[3] || "",
  imagen_url_5: arr[4] || "",
});

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl">✕</button>
        <h2 className="text-lg font-semibold text-[#38629F] mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function AdminMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageUrls, setImageUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchMascotas = async () => {
    setLoading(true);
    const { data } = await supabase.from("mascotas").select("*").order("created_at", { ascending: false });
    setMascotas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMascotas(); }, []);

  const openNew = () => { setForm(EMPTY); setImageUrls([]); setModal("new"); };
  const openEdit = (m) => { setForm({ ...m }); setImageUrls(urlsToArray(m)); setModal("edit"); };
  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, ...arrayToUrls(imageUrls) };

    if (modal === "new") {
      const { created_at, id, ...fields } = payload;
      const { error } = await supabase.from("mascotas").insert([fields]);
      if (!error) { showToast("✅ Mascota agregada"); fetchMascotas(); closeModal(); }
    } else {
      const { created_at, id, ...fields } = payload;
      const { error } = await supabase.from("mascotas").update(fields).eq("id", form.id);
      if (!error) { showToast("✅ Mascota actualizada"); fetchMascotas(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("mascotas").delete().eq("id", deleteId);
    if (!error) { showToast("Mascota eliminada"); fetchMascotas(); }
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#38629F]">Mascotas</h1>
          <p className="text-slate-500 text-sm mt-1">{mascotas.length} mascota{mascotas.length !== 1 ? "s" : ""} registrada{mascotas.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 rounded-full bg-[#38629F] text-white text-sm font-semibold hover:brightness-95 transition">
          + Agregar mascota
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando…</div>
      ) : mascotas.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl">No hay mascotas todavía. ¡Agregá la primera!</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mascotas.map((m) => {
            const fotos = urlsToArray(m);
            return (
              <div key={m.id} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden flex flex-col">
                <div className="relative">
                  <img
                    src={fotos[0] || "https://placehold.co/300x200/eff4fb/38629F?text=Sin+foto"}
                    alt={m.nombre}
                    className="w-full h-44 object-cover"
                  />
                  {fotos.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      +{fotos.length - 1} fotos
                    </span>
                  )}
                  <span className={"absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full " + (m.estado === "adoptado" ? "bg-green-100 text-green-700" : "bg-[#F7E9DC] text-[#38629F]")}>
                    {m.estado === "adoptado" ? "Adoptado ✓" : "Disponible"}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-[#38629F] text-lg">{m.nombre}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2 flex-1">{m.descripcion || "Sin descripción"}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(m)} className="flex-1 py-2 rounded-full border border-[#38629F] text-[#38629F] text-sm font-medium hover:bg-[#eff4fb] transition">Editar</button>
                    <button onClick={() => setDeleteId(m.id)} className="flex-1 py-2 rounded-full border border-[#EA4E4E]/40 text-[#EA4E4E] text-sm font-medium hover:bg-red-50 transition">Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === "new" ? "Agregar mascota" : "Editar: " + form.nombre} onClose={closeModal}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: Luna" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40 resize-none"
                placeholder="Contanos sobre esta mascota…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40">
                <option value="disponible">Disponible</option>
                <option value="adoptado">Adoptado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fotos (hasta 5)</label>
              <MultiImageUpload
                currentUrls={imageUrls}
                folder="mascotas"
                maxImages={5}
                onUpload={(urls) => setImageUrls(urls)}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-full bg-[#38629F] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="¿Eliminar mascota?" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 text-sm mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm">Cancelar</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-full bg-[#EA4E4E] text-white text-sm font-semibold">Sí, eliminar</button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50">{toast}</div>
      )}
    </div>
  );
}