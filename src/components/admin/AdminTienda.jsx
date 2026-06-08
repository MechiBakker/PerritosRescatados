import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MultiImageUpload from "./ImageUpload";

const EMPTY = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagen_url: "",
  imagen_url_2: "",
  imagen_url_3: "",
  imagen_url_4: "",
  imagen_url_5: "",
  disponible: true,
};

const urlsToArray = (p) =>
  [p.imagen_url, p.imagen_url_2, p.imagen_url_3, p.imagen_url_4, p.imagen_url_5].filter(Boolean);

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

export default function AdminTienda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageUrls, setImageUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchProductos = async () => {
    setLoading(true);
    const { data } = await supabase.from("productos").select("*").order("created_at", { ascending: false });
    setProductos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProductos(); }, []);

  const openNew = () => { setForm(EMPTY); setImageUrls([]); setModal("new"); };
  const openEdit = (p) => { setForm({ ...p }); setImageUrls(urlsToArray(p)); setModal("edit"); };
  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      ...arrayToUrls(imageUrls),
      precio: form.precio === "" ? null : parseFloat(form.precio),
    };

    if (modal === "new") {
      const { id, created_at, ...fields } = payload;
      const { error } = await supabase.from("productos").insert([fields]);
      if (!error) { showToast("✅ Producto agregado"); fetchProductos(); closeModal(); }
    } else {
      const { id, created_at, ...fields } = payload;
      const { error } = await supabase.from("productos").update(fields).eq("id", form.id);
      if (!error) { showToast("✅ Producto actualizado"); fetchProductos(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("productos").delete().eq("id", deleteId);
    if (!error) { showToast("🗑️ Producto eliminado"); fetchProductos(); }
    setDeleteId(null);
  };

  const formatPrecio = (p) => p != null ? "$" + Number(p).toLocaleString("es-AR") : "Sin precio";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#38629F]">Tienda solidaria</h1>
          <p className="text-slate-500 text-sm mt-1">{productos.length} producto{productos.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 rounded-full bg-[#F5793B] text-white text-sm font-semibold hover:brightness-95 transition">
          + Agregar producto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Cargando…</div>
      ) : productos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl">No hay productos todavía.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => {
            const fotos = urlsToArray(p);
            return (
              <div key={p.id} className={"bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden flex flex-col " + (!p.disponible ? "opacity-60" : "")}>
                <div className="relative">
                  <img
                    src={fotos[0] || "https://placehold.co/300x200/F7E9DC/38629F?text=Sin+foto"}
                    alt={p.nombre}
                    className="w-full h-44 object-cover"
                  />
                  {fotos.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      +{fotos.length - 1} fotos
                    </span>
                  )}
                  {!p.disponible && (
                    <span className="absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">Sin stock</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-[#38629F] text-lg">{p.nombre}</h3>
                  <p className="text-[#F5793B] font-semibold text-sm mt-0.5">{formatPrecio(p.precio)}</p>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2 flex-1">{p.descripcion || "Sin descripción"}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(p)} className="flex-1 py-2 rounded-full border border-[#38629F] text-[#38629F] text-sm font-medium hover:bg-[#eff4fb] transition">Editar</button>
                    <button onClick={() => setDeleteId(p.id)} className="flex-1 py-2 rounded-full border border-[#EA4E4E]/40 text-[#EA4E4E] text-sm font-medium hover:bg-red-50 transition">Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === "new" ? "Agregar producto" : "Editar: " + form.nombre} onClose={closeModal}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: Remera solidaria" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40 resize-none"
                placeholder="Breve descripción…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio (en pesos)</label>
              <input type="number" min="0" step="0.01" value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#38629F]/40"
                placeholder="Ej: 25000" />
            </div>
            <div className="flex items-center gap-3">
              <input id="disponible" type="checkbox" checked={form.disponible}
                onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                className="w-4 h-4 accent-[#38629F]" />
              <label htmlFor="disponible" className="text-sm text-slate-700">Disponible en tienda</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fotos (hasta 5)</label>
              <MultiImageUpload
                currentUrls={imageUrls}
                folder="productos"
                maxImages={5}
                onUpload={(urls) => setImageUrls(urls)}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-full bg-[#F5793B] text-white text-sm font-semibold hover:brightness-95 disabled:opacity-60">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteId && (
        <Modal title="¿Eliminar producto?" onClose={() => setDeleteId(null)}>
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