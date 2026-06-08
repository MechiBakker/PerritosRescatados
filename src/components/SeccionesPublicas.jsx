import React, { useRef, useEffect, useState } from "react";
import { useMascotas, useProductos } from "../lib/useSupabaseData";

const urlsToArray = (item) =>
  [item.imagen_url, item.imagen_url_2, item.imagen_url_3, item.imagen_url_4, item.imagen_url_5].filter(Boolean);

function PhotoCarousel({ fotos, alt, height = "h-48" }) {
  const [current, setCurrent] = useState(0);
  if (!fotos.length) return (
    <img src="https://placehold.co/280x192/eff4fb/38629F?text=Sin+foto" alt={alt} className={"w-full object-cover rounded-t-2xl " + height} />
  );
  return (
    <div className="relative overflow-hidden rounded-t-2xl">
      <img src={fotos[current]} alt={alt + " foto " + (current + 1)} className={"w-full object-cover " + height} />
      {fotos.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + fotos.length) % fotos.length)}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 text-[#38629F] w-7 h-7 rounded-full shadow text-sm flex items-center justify-center hover:bg-white"
          >‹</button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % fotos.length)}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 text-[#38629F] w-7 h-7 rounded-full shadow text-sm flex items-center justify-center hover:bg-white"
          >›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {fotos.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={"w-1.5 h-1.5 rounded-full transition " + (i === current ? "bg-white" : "bg-white/50")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function AdopcionesSupabase() {
  const { mascotas, loading } = useMascotas(true);
  const trackRef = useRef(null);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  return (
    <section id="adopciones" className="py-16 bg-white">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">Adopciones</h2>
        <br />
        <p className="text-slate-600 mt-2">
          Adoptar es un acto de amor. Antes de hacerlo, considerá factores como
          el espacio disponible en tu hogar, el tiempo para dedicarle, y el
          compromiso a largo plazo que implica tener un compañero peludo.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-3">
          <li>Espacio suficiente en tu hogar para recibirlo cómodamente.</li>
          <li>Tiempo para paseos, higiene, juegos, mimos y acompañamiento diario.</li>
          <li>Costos de alimentación, atención veterinaria y otros cuidados.</li>
          <li>Convivencia con el resto de la familia: niños, adultos mayores o mascotas.</li>
        </ul>
        <p className="text-slate-600 mt-3">
          Cada rescatado viene de una historia distinta. Es fundamental brindar
          paciencia, seguridad y cariño durante su adaptación. 🐾
        </p>
        <br />
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf-7KHtM4XVTRmee_uYTcW3GlZPY6XmX1rlYN5Q6QrGmFh8-w/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
          >
            Quiero adoptar
          </a>
        </div>

        {loading && <p className="text-center text-slate-400 mt-10">Cargando mascotas…</p>}

        {!loading && mascotas.length > 0 && (
          <>
            <h3 className="text-[#38629F] text-xl font-semibold mt-10 mb-3">🐾 Mascotas en adopción</h3>
            <div className="relative mt-2">
              <button type="button"
                className="absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10"
                aria-label="Anterior" onClick={() => scrollByCard(-1)}>«</button>
              <div ref={trackRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 scrollbar-hide relative">
                {mascotas.map((m) => (
                  <article key={m.id} data-card
                    className="min-w-[260px] max-w-[280px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow border border-slate-100">
                    <PhotoCarousel fotos={urlsToArray(m)} alt={m.nombre} height="h-48" />
                    <div className="p-4">
                      <h3 className="text-[#38629F] font-semibold text-lg">{m.nombre}</h3>
                      <p className="text-slate-600 text-sm mt-1">{m.descripcion}</p>
                    </div>
                  </article>
                ))}
                <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
              </div>
              <button type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10"
                aria-label="Siguiente" onClick={() => scrollByCard(1)}>»</button>
            </div>
          </>
        )}
        <br />
      </div>
    </section>
  );
}

export function TiendaSupabase() {
  const { productos, loading } = useProductos(true);
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 280;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const stop = () => { clearInterval(autoScrollRef.current); autoScrollRef.current = null; };
    el.addEventListener("touchstart", stop);
    el.addEventListener("mousedown", stop);
    if (window.innerWidth < 768) {
      autoScrollRef.current = setInterval(() => {
        const scrollMax = el.scrollWidth - el.clientWidth;
        scrollByCard(el.scrollLeft + 10 >= scrollMax ? -1 : 1);
      }, 3000);
    }
    return () => {
      clearInterval(autoScrollRef.current);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("mousedown", stop);
    };
  }, [productos]);

  const formatPrecio = (p) => p != null ? "$" + Number(p).toLocaleString("es-AR") : "";

  return (
    <section id="tienda" className="py-16 bg-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-6 text-center">🛍️ Tienda solidaria</h2>
        <p className="text-slate-600 text-center mb-10">
          Todo lo recaudado se destina a la atención veterinaria, alimento y cuidados de nuestros rescatados. 💕
        </p>

        {loading ? (
          <p className="text-center text-slate-400">Cargando productos…</p>
        ) : productos.length === 0 ? (
          <p className="text-center text-slate-500">Próximamente nuevos productos. ¡Seguinos para enterarte!</p>
        ) : (
          <>
            {/* Carrusel mobile */}
            <div className="relative md:hidden">
              <button type="button" onClick={() => scrollByCard(-1)}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white text-[#38629F] w-8 h-8 rounded-full shadow hover:shadow-md z-10">«</button>
              <div ref={trackRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-1">
                {productos.map((item) => (
                  <article key={item.id} data-card
                    className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                    <PhotoCarousel fotos={urlsToArray(item)} alt={item.nombre} height="h-64" />
                    <div className="p-4 text-center">
                      <h3 className="text-[#38629F] font-semibold text-lg">{item.nombre}</h3>
                      {item.descripcion && <p className="text-slate-500 text-xs mt-1">{item.descripcion}</p>}
                      <p className="text-slate-600 font-medium mt-1">{formatPrecio(item.precio)}</p>
                      <a href="https://wa.me/5492216155465" target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold">Comprar</a>
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" onClick={() => scrollByCard(1)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#38629F] w-8 h-8 rounded-full shadow hover:shadow-md z-10">»</button>
            </div>

            {/* Grid desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map((item) => (
                <article key={item.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  <PhotoCarousel fotos={urlsToArray(item)} alt={item.nombre} height="h-80" />
                  <div className="p-4 text-center">
                    <h3 className="text-[#38629F] font-semibold text-lg">{item.nombre}</h3>
                    {item.descripcion && <p className="text-slate-500 text-xs mt-1">{item.descripcion}</p>}
                    <p className="text-slate-600 font-medium mt-1">{formatPrecio(item.precio)}</p>
                    <a href="https://wa.me/5492216155465" target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold">Comprar</a>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}