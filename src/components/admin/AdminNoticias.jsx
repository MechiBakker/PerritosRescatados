import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MultiImageUpload from "./ImageUpload";

const EMPTY = {
  titulo: "",
  contenido: "",
  imagen_url: "",
  imagen_url_2: "",
  imagen_url_3: "",
  imagen_url_4: "",
  imagen_url_5: "",
  publicada: true,
};

const urlsToArray = (n) =>
  [n.imagen_url, n.imagen_url_2, n.imagen_url_3, n.imagen_url_4, n.imagen_url_5].filter(Boolean);

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

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageUrls, setImageUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchNoticias = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false });
    setNoticias(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNoticias(); }, []);

  const openNew = () => { setForm(EMPTY); setImageUrls([]); setModal("new"); };
  const openEdit = (n) => { setForm({ ...n }); setImageUrls(urlsToArray(n)); setModal("edit"); };
  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, ...arrayToUrls(imageUrls) };

    if (modal === "new") {
      const { id, created_at, ...fields } = payload;
      const { error } = await supabase.from("noticias").insert([fields]);
      if (!error) { showToast("✅ Noticia publicada"); fetchNoticias(); closeModal(); }
    } else {
      const { id, created_at, ...fields } = payload;
      const { error } = await supabase.from("noticias").update(fields).eq("id", form.id);
      if (!error) { showToast("✅ Noticia actualizada"); fetchNoticias(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("noticias").delete().eq("id", deleteId);
    if (!error) { showToast("🗑️ Noticia eliminada"); fetchNoticias(); }
    setDeleteId(null);
  };

  const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#38629F]">📰 Noticias</h1>
          <p className="text-slate-500 text-sm mt-1">
            {noticias.length} noticia{noticias.length !== 1 ? "s" : ""} publicada{noticias.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2.5 rounded-full bg-[#38629F] text-white text-sm font-semibold hover:brightness-95 transition">
          + Nueva noticia
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando…</div>
      ) : noticias.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl">
          No hay noticias todavía. ¡Publicá la primera!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {noticias.map((n) => {
            const fotos = urlsToArray(n);
            return (
              <div key={n.id} className={"bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden flex gap-4 p-4 " + (!n.publicada ? "opacity-60" : "")}>
                {fotos[0] && (
                  <img src={fotos[0]} alt={n.titulo}
                    className="w-24 h-24 object-cover rounded-xl shrink-0" />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#38629F] text-base leading-tight">{n.titulo}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{formatFecha(n.created_at)}</p>
                    </div>
                    {!n.publicada && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">Borrador</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">{n.contenido}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(n)}
                      className="px-3 py-1.5 rounded-full border border-[#38629F] text-[#38629F] text-xs font-medium hover:bg-[#eff4fb] transition">
                      Editar
                    </button>
                    <button onClick={() => setDeleteId(n.id)}
                      className="px-3 py-1.5 rounded-full border border-[#EA4E4E]/40 text-[#EA4E4E] text-xs font-medium hover:bg-red-50 transition">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === "new" ? "Nueva noticia" : "Editar noticia"} onClose={closeModal}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <input required value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: Campaña de vacunación gratuita" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contenido</label>
              <textarea rows={5} value={form.contenido}
                onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40 resize-none"
                placeholder="Escribí el contenido de la noticia…" />
            </div>
            <div className="flex items-center gap-3">
              <input id="publicada" type="checkbox" checked={form.publicada}
                onChange={(e) => setForm({ ...form, publicada: e.target.checked })}
                className="w-4 h-4 accent-[#38629F]" />
              <label htmlFor="publicada" className="text-sm text-slate-700">Publicar en el sitio</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fotos (hasta 5)</label>
              <MultiImageUpload
                currentUrls={imageUrls}
                folder="noticias"
                maxImages={5}
                onUpload={(urls) => setImageUrls(urls)}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm">Cancelar</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-full bg-[#38629F] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="¿Eliminar noticia?" onClose={() => setDeleteId(null)}>
          <p className="text-slate-600 text-sm mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm">Cancelar</button>
            <button onClick={handleDelete}
              className="flex-1 py-2.5 rounded-full bg-[#EA4E4E] text-white text-sm font-semibold">Sí, eliminar</button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-full text-sm shadow-lg z-50">{toast}</div>
      )}
    </div>
  );
}
