// ================= INSTAGRAM CAROUSEL (Embeds desde links) =================
function InstagramCarousel() {
  // Lista de URLs de posts de Instagram
  const POSTS = [
    "https://www.instagram.com/p/DQfamPpDQrf/?utm_source=ig_web_copy_link&igsh=MWplaHY4ZjloMXphZA==",
    "https://www.instagram.com/p/DQMczN8jUUl/?utm_source=ig_web_copy_link&igsh=MXR6ZnF3MnpiZXc4cA==",
    "https://www.instagram.com/p/DPwQfcBDewu/?utm_source=ig_web_copy_link&igsh=MWZiZHZ4OGtrNDhmag==",
    "https://www.instagram.com/p/DPv66d1DasA/?utm_source=ig_web_copy_link&igsh=bnNzcG9ub21rMm9k",
    "https://www.instagram.com/p/DPgrS8ijcL6/?utm_source=ig_web_copy_link&igsh=MXU5c25rcnBlaHNjaA==",
    "https://www.instagram.com/p/DPW-FPfEV-H/?utm_source=ig_web_copy_link&igsh=MWp5cjU1ZDB3b2Rhag==",
    "https://www.instagram.com/p/DPMuxi8kU6p/?utm_source=ig_web_copy_link&igsh=MjduN2VrZGRrZGE4",
    "https://www.instagram.com/p/DPMD-yAjTDr/?utm_source=ig_web_copy_link&igsh=d3VhMDEzcW5ubzVh",
    "https://www.instagram.com/p/DPCwqtEjaFc/?utm_source=ig_web_copy_link&igsh=cGdxMmJ6M3oxOXlr",
    "https://www.instagram.com/p/DObr1CIESHF/?utm_source=ig_web_copy_link&igsh=c3BnNGpjMnB2Njlq",
  ];

  const trackRef = useRef(null);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-post]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  useEffect(() => {
    // Carga el script de Instagram para renderizar los embeds
    if (!window.instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => window.instgrm?.Embeds?.process();
      document.body.appendChild(script);
    } else {
      window.instgrm?.Embeds?.process();
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
    <div className="relative mt-4">
      {/* Botón anterior */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        className="absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10"
        aria-label="Anterior"
      >
        «
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
            className="min-w-[300px] max-w-[350px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                margin: 0,
                minWidth: "300px",
                maxWidth: "350px",
              }}
            ></blockquote>
          </div>
        ))}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      </div>

      {/* Botón siguiente */}
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10"
        aria-label="Siguiente"
      >
        »
      </button>
    </div>
  );
}
