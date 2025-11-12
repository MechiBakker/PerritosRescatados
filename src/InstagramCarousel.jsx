import React, { useEffect, useRef } from "react";

export default function InstagramCarousel() {
  // Lista de URLs de posts de Instagram
  const POSTS = [
    "https://www.instagram.com/p/DQfamPpDQrf/",
    "https://www.instagram.com/p/DQMczN8jUUl/",
    "https://www.instagram.com/p/DPwQfcBDewu/",
    "https://www.instagram.com/p/DPv66d1DasA/",
    "https://www.instagram.com/p/DPgrS8ijcL6/",
    "https://www.instagram.com/p/DPW-FPfEV-H/",
    "https://www.instagram.com/p/DPMuxi8kU6p/",
    "https://www.instagram.com/p/DPMD-yAjTDr/",
    "https://www.instagram.com/p/DPCwqtEjaFc/",
    "https://www.instagram.com/p/DObr1CIESHF/",
  ];

  const trackRef = useRef(null);

  const scrollByPage = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-post]");
    const cardWidth = card ? card.getBoundingClientRect().width + 16 : 320;
    const visibleCards = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    el.scrollBy({ left: dir * cardWidth * visibleCards, behavior: "smooth" });
  };

  useEffect(() => {
    // Carga el script de Instagram para renderizar los embeds
    const ensureInstagramScript = () => {
      if (!window.instgrm) {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => window.instgrm?.Embeds?.process();
        document.body.appendChild(script);
      } else {
        window.instgrm?.Embeds?.process();
      }
    };
    ensureInstagramScript();
  }, []);

  useEffect(() => {
    // Reprocesa los embeds si cambian los posts
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [POSTS]);

  if (POSTS.length === 0) {
    return (
      <div className="p-4 border-2 border-[#38629F]/20 rounded-xl bg-white shadow-inner text-center text-slate-500">
        <p className="font-semibold text-[#38629F]">
          Carrusel de publicaciones de Instagram
        </p>
        <p className="text-sm mt-1">Todavía no hay publicaciones cargadas.</p>
      </div>
    );
  }

  return (
    <div className="relative mt-6">
      {/* Botón anterior */}
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-[#38629F] text-white shadow hover:shadow-md z-10"
        aria-label="Anterior"
      >
        ‹
      </button>

      {/* Contenedor del carrusel */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 scrollbar-hide"
        role="region"
      >
        {POSTS.map((url, i) => (
          <div
            key={i}
            data-post
            className="snap-start flex-shrink-0 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden"
            style={{
              width: "calc((100% - 2rem) / 3)", // 3 columnas en escritorio
              height: "450px",
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center bg-gray-100"
              style={{ overflow: "hidden" }}
            >
              <blockquote
                className="instagram-media w-full h-full"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{
                  border: 0,
                  margin: 0,
                  width: "100%",
                  height: "100%",
                  background: "#FFF",
                }}
              ></blockquote>
            </div>
          </div>
        ))}
      </div>

      {/* Botón siguiente */}
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-[#38629F] text-white shadow hover:shadow-md z-10"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Responsive styles */}
      <style>
        {`
          @media (max-width: 1024px) {
            [data-post] {
              width: calc((100% - 1rem) / 2) !important;
            }
          }
          @media (max-width: 640px) {
            [data-post] {
              width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
}
