import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const urlsToArray = (n) =>
  [n.imagen_url, n.imagen_url_2, n.imagen_url_3, n.imagen_url_4, n.imagen_url_5].filter(Boolean);

/* ── Lightbox ─────────────────────────────────────────────── */
function Lightbox({ fotos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % fotos.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + fotos.length) % fotos.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [fotos.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <img src={fotos[current]} alt={"Foto " + (current + 1)} className="w-full max-h-[80vh] object-contain rounded-xl" />
        <button onClick={onClose} className="absolute -top-10 right-0 text-white text-3xl hover:text-slate-300">✕</button>
        {fotos.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + fotos.length) % fotos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center">‹</button>
            <button onClick={() => setCurrent((c) => (c + 1) % fotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center">›</button>
            <div className="flex gap-2 justify-center mt-3 flex-wrap">
              {fotos.map((url, i) => (
                <img key={i} src={url} alt={"Miniatura " + (i + 1)} onClick={() => setCurrent(i)}
                  className={"w-14 h-14 object-cover rounded-lg cursor-pointer border-2 transition " + (i === current ? "border-white" : "border-transparent opacity-60 hover:opacity-100")} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Modal de noticia completa ────────────────────────────── */
function NoticiaModal({ noticia, onClose }) {
  const [lightbox, setLightbox] = useState(null);
  const fotos = urlsToArray(noticia);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          {fotos[0] && (
            <img src={fotos[0]} alt={noticia.titulo}
              className="w-full h-56 object-cover rounded-t-2xl cursor-zoom-in"
              onClick={() => setLightbox(0)} />
          )}
          <div className="p-6">
            <p className="text-xs text-slate-400 mb-1">{formatFecha(noticia.created_at)}</p>
            <h2 className="text-xl font-semibold text-[#38629F] mb-3">{noticia.titulo}</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{noticia.contenido}</p>
            {fotos.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {fotos.map((url, i) => (
                  <img key={i} src={url} alt={"Foto " + (i + 1)} onClick={() => setLightbox(i)}
                    className={"w-full h-16 object-cover rounded-lg cursor-zoom-in border-2 transition hover:opacity-90 " + (i === 0 ? "border-[#38629F]" : "border-transparent")} />
                ))}
              </div>
            )}
            <button onClick={onClose}
              className="mt-6 w-full py-2.5 rounded-full border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">
              Cerrar
            </button>
          </div>
        </div>
      </div>
      {lightbox !== null && (
        <Lightbox fotos={fotos} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ── Sección pública Noticias ─────────────────────────────── */
export default function SeccionNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    supabase
      .from("noticias")
      .select("*")
      .eq("publicada", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setNoticias(data || []); setLoading(false); });
  }, []);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 300;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

  if (!loading && noticias.length === 0) return null;

  return (
    <section id="noticias" className="py-16 bg-white">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-2">
          Noticias y campañas
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Enterate de nuestras próximas campañas de vacunación, castración y más.
        </p>

        {loading ? (
          <p className="text-slate-400 text-sm">Cargando noticias…</p>
        ) : (
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Anterior" onClick={() => scrollByCard(-1)}
              className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">
              «
            </button>

            <div ref={trackRef}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide flex-1">
              {noticias.map((n) => {
                const fotos = urlsToArray(n);
                return (
                  <article
                    key={n.id}
                    data-card
                    onClick={() => setSelected(n)}
                    className="shrink-0 w-[85vw] md:w-[320px] snap-start bg-white border border-slate-100 rounded-2xl shadow hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col"
                  >
                    {fotos[0] ? (
                      <img src={fotos[0]} alt={n.titulo} className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-[#eff4fb] flex items-center justify-center text-4xl">📰</div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-slate-400 mb-1">{formatFecha(n.created_at)}</p>
                      <h3 className="font-semibold text-[#38629F] text-base leading-snug">{n.titulo}</h3>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2 flex-1">{n.contenido}</p>
                      <span className="mt-3 text-xs font-semibold text-[#F5793B]">Leer más →</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <button type="button" aria-label="Siguiente" onClick={() => scrollByCard(1)}
              className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">
              »
            </button>
          </div>
        )}
      </div>

      {selected && <NoticiaModal noticia={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
