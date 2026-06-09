import React, { useRef, useEffect, useState } from "react";
import { useMascotas, useProductos } from "../lib/useSupabaseData";

const urlsToArray = (item) =>
  [item.imagen_url, item.imagen_url_2, item.imagen_url_3, item.imagen_url_4, item.imagen_url_5].filter(Boolean);

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
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fotos.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <img src={fotos[current]} alt={"Foto " + (current + 1)} className="w-full max-h-[80vh] object-contain rounded-xl" />
        <button onClick={onClose} className="absolute -top-10 right-0 text-white text-3xl hover:text-slate-300">✕</button>
        {fotos.length > 1 && (
          <>
            <button onClick={() => setCurrent((c) => (c - 1 + fotos.length) % fotos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center transition">‹</button>
            <button onClick={() => setCurrent((c) => (c + 1) % fotos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center transition">›</button>
            <div className="flex gap-2 justify-center mt-3">
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={"w-2 h-2 rounded-full transition " + (i === current ? "bg-white" : "bg-white/40")} />
              ))}
            </div>
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

/* ── Carrusel de fotos por tarjeta ────────────────────────── */
function PhotoCarousel({ fotos, alt, height = "h-48" }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const src = fotos.length ? fotos[current] : "https://placehold.co/280x192/eff4fb/38629F?text=Sin+foto";

  return (
    <>
      <div className={"relative overflow-hidden rounded-t-2xl cursor-zoom-in " + height}>
        <img src={src} alt={alt + " foto " + (current + 1)} className="w-full h-full object-cover"
          onClick={() => fotos.length && setLightbox(true)} />
        {fotos.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + fotos.length) % fotos.length); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 text-[#38629F] w-7 h-7 rounded-full shadow text-sm flex items-center justify-center hover:bg-white z-10">‹</button>
            <button onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % fotos.length); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 text-[#38629F] w-7 h-7 rounded-full shadow text-sm flex items-center justify-center hover:bg-white z-10">›</button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {fotos.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={"w-1.5 h-1.5 rounded-full transition " + (i === current ? "bg-white" : "bg-white/50")} />
              ))}
            </div>
          </>
        )}
      </div>
      {lightbox && <Lightbox fotos={fotos} startIndex={current} onClose={() => setLightbox(false)} />}
    </>
  );
}

function Descripcion({ texto }) {
  if (!texto) return null;
  return (
    <p className="text-slate-600 text-sm mt-1">
      {texto.split("\n").map((linea, i, arr) => (
        <React.Fragment key={i}>{linea}{i < arr.length - 1 && <br />}</React.Fragment>
      ))}
    </p>
  );
}

/* ── Sección Adopciones ───────────────────────────────────── */
export function AdopcionesSupabase() {
  const { mascotas, loading } = useMascotas(true);
  const trackRef = useRef(null);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 296;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  return (
    <section id="adopciones" className="py-16 bg-white">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">Adopciones</h2>
        <br />
        <p className="text-slate-600 mt-2">
          Adoptar es un acto de amor. Antes de hacerlo, considerá factores como el espacio disponible en tu hogar, el tiempo para dedicarle, y el compromiso a largo plazo que implica tener un compañero peludo.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-3">
          <li>Espacio suficiente en tu hogar para recibirlo cómodamente.</li>
          <li>Tiempo para paseos, higiene, juegos, mimos y acompañamiento diario.</li>
          <li>Costos de alimentación, atención veterinaria y otros cuidados.</li>
          <li>Convivencia con el resto de la familia: niños, adultos mayores o mascotas.</li>
        </ul>
        <p className="text-slate-600 mt-3">Cada rescatado viene de una historia distinta. Es fundamental brindar paciencia, seguridad y cariño durante su adaptación.</p>
        <br />
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSf-7KHtM4XVTRmee_uYTcW3GlZPY6XmX1rlYN5Q6QrGmFh8-w/viewform"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95">
            Quiero adoptar
          </a>
        </div>

        {loading && <p className="text-center text-slate-400 mt-10">Cargando mascotas…</p>}

        {!loading && mascotas.length > 0 && (
          <>
            <h3 className="text-[#38629F] text-xl font-semibold mt-10 mb-4">Mascotas en adopción</h3>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Anterior" onClick={() => scrollByCard(-1)}
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">«</button>
              <div ref={trackRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide flex-1">
                {mascotas.map((m) => (
                  <article key={m.id} data-card className="shrink-0 w-[260px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow border border-slate-100">
                    <PhotoCarousel fotos={urlsToArray(m)} alt={m.nombre} height="h-48" />
                    <div className="p-4">
                      <h3 className="text-[#38629F] font-semibold text-lg">{m.nombre}</h3>
                      <Descripcion texto={m.descripcion} />
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" aria-label="Siguiente" onClick={() => scrollByCard(1)}
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">»</button>
            </div>
          </>
        )}
        <br />
      </div>
    </section>
  );
}

/* ── Sección Tienda ───────────────────────────────────────── */
export function TiendaSupabase() {
  const { productos, loading } = useProductos(true);
  const trackMobileRef = useRef(null);
  const trackDesktopRef = useRef(null);
  const autoScrollRef = useRef(null);

  const scrollByCard = (ref, dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 280;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackMobileRef.current;
    if (!el) return;
    const stop = () => { clearInterval(autoScrollRef.current); autoScrollRef.current = null; };
    el.addEventListener("touchstart", stop);
    el.addEventListener("mousedown", stop);
    if (window.innerWidth < 768) {
      autoScrollRef.current = setInterval(() => {
        const scrollMax = el.scrollWidth - el.clientWidth;
        scrollByCard(trackMobileRef, el.scrollLeft + 10 >= scrollMax ? -1 : 1);
      }, 3000);
    }
    return () => {
      clearInterval(autoScrollRef.current);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("mousedown", stop);
    };
  }, [productos]);

  const formatPrecio = (p) => p != null ? "$" + Number(p).toLocaleString("es-AR") : "";

  const ProductCard = ({ item }) => (
    <article data-card className="shrink-0 w-[85vw] md:w-[280px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      <PhotoCarousel fotos={urlsToArray(item)} alt={item.nombre} height="h-64" />
      <div className="p-4 text-center">
        <h3 className="text-[#38629F] font-semibold text-lg">{item.nombre}</h3>
        {item.descripcion && <p className="text-slate-500 text-xs mt-1">{item.descripcion}</p>}
        <p className="text-slate-600 font-medium mt-1">{formatPrecio(item.precio)}</p>
        <a href="https://wa.me/5492216155465" target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold">Comprar</a>
      </div>
    </article>
  );

  return (
    <section id="tienda" className="py-16 bg-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-6 text-center">Tienda solidaria</h2>
        <p className="text-slate-600 text-center mb-10">
          Todo lo recaudado se destina a la atención veterinaria, alimento y cuidados de nuestros rescatados. 
        </p>

        {loading ? (
          <p className="text-center text-slate-400">Cargando productos…</p>
        ) : productos.length === 0 ? (
          <p className="text-center text-slate-500">Próximamente nuevos productos. ¡Seguinos para enterarte!</p>
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <button type="button" onClick={() => scrollByCard(trackMobileRef, -1)}
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">«</button>
              <div ref={trackMobileRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide flex-1">
                {productos.map((item) => <ProductCard key={item.id} item={item} />)}
              </div>
              <button type="button" onClick={() => scrollByCard(trackMobileRef, 1)}
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">»</button>
            </div>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button type="button" onClick={() => scrollByCard(trackDesktopRef, -1)}
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">«</button>
              <div ref={trackDesktopRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide flex-1">
                {productos.map((item) => <ProductCard key={item.id} item={item} />)}
              </div>
              <button type="button" onClick={() => scrollByCard(trackDesktopRef, 1)}
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border border-slate-200 text-[#38629F]">»</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}