import React, { useEffect, useMemo, useRef, useState } from "react";
import InstagramCarousel from "./InstagramCarousel";



/* ================= HEADER ================= */
function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#38629F] text-white shadow-md">
      <div className="max-w-[1100px] mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="inline-flex items-center gap-2">
          <img
            src="/img/Logo1.jpg"
            alt="Perritos Rescatados"
            className="h-10 w-auto drop-shadow"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/38629F/FFFFFF?text=PR"; }}
          />
        </a>

        {/* Botón hamburguesa en mobile */}
        <button
          className="lg:hidden text-2xl px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        {/* Menú en desktop */}
        <nav
          id="primary-nav"
          className="hidden lg:flex gap-6 text-sm font-bold"
        >
          <a
            className="hover:text-[#F7E9DC] transition-colors"
            href="#quienes-somos"
          >
            ¿Quiénes somos?
          </a>
          <a
            className="hover:text-[#F7E9DC] transition-colors"
            href="#adopciones"
          >
            Adopciones
          </a>
          <a
            className="hover:text-[#F7E9DC] transition-colors"
            href="#transitos"
          >
            Tránsitos
          </a>
          <a
            className="hover:text-[#F7E9DC] transition-colors"
            href="#tienda"
            >
              Tienda
            </a>
          <a
            className="hover:text-[#F7E9DC] transition-colors"
            href="#colabora"
          >
            Colaborá
          </a>
        </nav>
      </div>

      {/* Menú overlay en mobile */}
      <nav
        className={`lg:hidden fixed inset-0 bg-[#38629F] flex flex-col items-center justify-center gap-6 text-lg font-semibold transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <a
          href="#quienes-somos"
          className="hover:text-[#F7E9DC]"
          onClick={() => setOpen(false)}
        >
          ¿Quiénes somos?
        </a>
        <a
          href="#adopciones"
          className="hover:text-[#F7E9DC]"
          onClick={() => setOpen(false)}
        >
          Adopciones
        </a>
        <a
          href="#transitos"
          className="hover:text-[#F7E9DC]"
          onClick={() => setOpen(false)}
        >
          Tránsitos
        </a>
        <a
          href="#tienda"
          className="hover:text-[#F7E9DC]"
          onClick={() => setOpen(false)}
        >
          Tienda
        </a>
        <a
          href="#colabora"
          className="hover:text-[#F7E9DC]"
          onClick={() => setOpen(false)}
        >
          Colaborá
        </a>
      </nav>
    </header>
  );
}


const COLLAGE = [
  "/img/013.jpeg",
  "/img/008.jpeg",
  "/img/001.jpeg",
  "/img/018.jpeg",
  "/img/002.jpeg",
  "/img/019.jpeg",
  "/img/024.jpeg",
  "/img/033.jpeg",
  "/img/030.jpeg",
];

function useYear() {
  return useMemo(() => new Date().getFullYear(), []);
}

/* ================= SECTIONS ================= */
function Hero() {
  return (
    <section id="quienes-somos" className="py-16 bg-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <h1 className="font-semibold text-3xl md:text-4xl text-[#38629F] mb-4">
            ¿Quiénes somos?
          </h1>
          <br></br>
          <p className="text-slate-600 leading-relaxed mb-3">
            ¡Bienvenidos! Somos un grupo de rescatistas de La Plata
            que unimos fuerzas en 2023 bajo el nombre de Perritos
            Rescatados.
          </p>
          <p className="text-slate-600 leading-relaxed mb-3">
            Nos dedicamos a dar una segunda (o tercera) oportunidad a perros y
            gatos que han sido abandonados, viven en la calle o han sufrido
            maltrato. No tenemos un refugio físico: gracias al trabajo
            colaborativo, les brindamos tránsito en hogares temporales hasta
            encontrar a la familia ideal para cada uno.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Con donaciones, rifas y membresías, cubrimos atención veterinaria,
            alimento y cuidados hasta su recuperación. Luego abrimos el proceso
            de adopción para encontrarles un hogar definitivo.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <img
            src="/img/LogoTrans1.png"
            alt="Logo Perritos Rescatados"
            className="w-56 md:w-72 mx-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

function CarouselPets() {
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  return (
    <div className="relative mt-6">
      <button
        type="button"
        className="absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10"
        aria-label="Anterior"
        onClick={() => scrollByCard(-1)}
      >
        «
      </button>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 scrollbar-hide relative"
        role="region"
      >
        {PETS.map((p) => (
          <article
            key={p.id}
            data-card
            className="min-w-[260px] max-w-[280px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow"
          >
            <img
              src={p.img}
              alt={p.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <div className="p-4">
              <h3 className="text-[#38629F] font-semibold text-lg">
                {p.name}
              </h3>
              <p className="text-slate-600 text-sm mt-1">{p.desc}</p>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-3 items-center justify-center px-3 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm"
              >
                Ver en Instagram
              </a>
            </div>
          </article>
        ))}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      </div>

      <button
        type="button"
        className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10"
        aria-label="Siguiente"
        onClick={() => scrollByCard(1)}
      >
        »
      </button>
    </div>
  );
}

function Adopciones() {
  return (
    <section id="adopciones" className="py-16 bg-white">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">
          Adopciones
        </h2>
        <br />

        <p className="text-slate-600 mt-2">
          Adoptar es un acto de amor. Antes de hacerlo, considerá factores como
          el espacio disponible en tu hogar, el tiempo para dedicarle, y el
          compromiso a largo plazo que implica tener un compañero peludo.
        </p>

        <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-3">
          <li>Espacio suficiente en tu hogar para recibirlo cómodamente.</li>
          <li>
            Tiempo para paseos, higiene, juegos, mimos y acompañamiento diario.
          </li>
          <li>Costos de alimentación, atención veterinaria y otros cuidados.</li>
          <li>
            Convivencia con el resto de la familia: niños, adultos mayores o
            mascotas.
          </li>
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

        <br />

        {/* Carrusel de Instagram */}
          <div className="mt-10">
            <h3 className="text-[#38629F] text-xl font-semibold text-center mb-3">
              🐾 Últimos posteos en Instagram
            </h3>
            <InstagramCarousel />
          </div>

        <br />
      </div>
    </section>
  );
}


function Transitos() {
  return (
    <section id="transitos" className="py-16 bg-[#eff4fb]">
      <div className="max-w-[1100px] mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">
            Tránsitos
          </h2>
          <br></br>
          <p className="text-slate-600 mt-2">
            Para poder rescatar, es necesario contar con un espacio temporario donde el animal rescatado puede recuperarse, sanar, aprender y recibir afecto mientras encuentra su hogar definitivo.
          </p>
          <p className="text-slate-600 mt-2">Perritos Rescatados se hace cargo de los gastos de alimentación, atención veterinaria y otros que requiera.</p> 
          <br></br>
          <p className="text-slate-600 mt-2">Requisitos:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-3">
            <li>Un entorno seguro y amoroso.</li>
            <li>Tener tiempo para dedicarle al animal.</li>
            <li>Estar en contacto fluido con la organización.</li>
            <li>Ser resolutivo y flexible.</li>
            <li>Ser responsable y comprometido.</li>
          </ul>
          <br></br>
          <div className="mt-5">
            <a
              href="https://docs.google.com/forms/d/1psmwmUdoamfKHZjbwkPfinvq_X7pGGP71w30lCrDdCk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold text-white bg-[#F5793B] hover:brightness-95"
            >
              Quiero ser hogar de tránsito
            </a>
          </div>
        </div>

        <div
          aria-label="Momentos de tránsito"
          className="grid grid-cols-3 gap-2 md:gap-3"
        >
          {COLLAGE.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Foto ${i + 1} del collage de tránsitos`}
              loading="lazy"
              className="w-full h-32 md:h-40 object-cover rounded-xl hover:scale-[1.03] transition-transform"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x160/D9E3F1/38629F?text=Foto ${i + 1}`; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Tienda() {
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 280;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  const productos = [
    { nombre: "Remeras", img: "/img/remera.jpg", precio: "$25.000" },
    { nombre: "Totebags", img: "/img/totebag.jpg", precio: "$13.000" },
    { nombre: "Velas", img: "/img/vela.jpg", precio: "$5.000" },
    { nombre: "Comederos Marote", img: "/img/comederos.jpg", precio: "$3.000 / $4.000" },
    { nombre: "Frisbees", img: "/img/frisbee.jpg", precio: "$4.000" },
    { nombre: "Cepillos", img: "/img/cepillo.jpg", precio: "$2.500" },
  ];

  /* === AUTOPLAY === */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleUserInteraction = () => {
      // Detiene autoplay al tocar o arrastrar
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    };

    el.addEventListener("touchstart", handleUserInteraction);
    el.addEventListener("mousedown", handleUserInteraction);

    const autoplay = () => {
      const scrollMax = el.scrollWidth - el.clientWidth;
      const nearEnd = el.scrollLeft + 10 >= scrollMax;
      const dir = nearEnd ? -1 : 1;
      scrollByCard(dir);
    };

    // Solo se activa en mobile (<768px)
    if (window.innerWidth < 768) {
      autoScrollRef.current = setInterval(autoplay, 3000);
    }

    return () => {
      clearInterval(autoScrollRef.current);
      el.removeEventListener("touchstart", handleUserInteraction);
      el.removeEventListener("mousedown", handleUserInteraction);
    };
  }, []);

  return (
    <section id="tienda" className="py-16 bg-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-6 text-center">
          🛍️ Tienda solidaria
        </h2>

        <p className="text-slate-600 text-center mb-10">
          Todo lo recaudado se destina a la atención veterinaria, alimento y cuidados de nuestros rescatados. 💕
        </p>

        {/* Carrusel en mobile */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white text-[#38629F] w-8 h-8 rounded-full shadow hover:shadow-md z-10"
          >
            «
          </button>

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-1"
          >
            {productos.map((item, i) => (
              <article
                key={i}
                data-card
                className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                <img
                  src={item.img}
                  alt={item.nombre}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/300x300/eff4fb/38629F?text=${item.nombre}`;
                  }}
                />
                <div className="p-4 text-center">
                  <h3 className="text-[#38629F] font-semibold text-lg">
                    {item.nombre}
                  </h3>
                  <p className="text-slate-600 font-medium mt-1">{item.precio}</p>
                  <a
                    href="https://wa.me/5492216155465"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold"
                  >
                    Comprar
                  </a>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#38629F] w-8 h-8 rounded-full shadow hover:shadow-md z-10"
          >
            »
          </button>
        </div>

        {/* Grilla normal en desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productos.map((item, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              <img
                src={item.img}
                alt={item.nombre}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/300x300/eff4fb/38629F?text=${item.nombre}`;
                }}
              />
              <div className="p-4 text-center">
                <h3 className="text-[#38629F] font-semibold text-lg">
                  {item.nombre}
                </h3>
                <p className="text-slate-600 font-medium mt-1">{item.precio}</p>
                <a
                  href="https://wa.me/5492216155465"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold"
                >
                  Comprar
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


function Colabora() {
  return (
    <section
      id="colabora"
      className="py-16 bg-gradient-to-b from-[#38629F]/10 to-[#F7E9DC]"
    >
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">
          Colaborá con Perritos Rescatados
        </h2>
        <br></br>
        <p className="text-slate-600 mt-2">
              Nuestro trabajo es completamente ad honorem. Perritos Rescatados subsiste gracias a las donaciones y el aporte económico de ustedes.</p>
        <p className="text-slate-600 mt-2">Si querés donar o suscribirte para colaborar mensualmente:</p>
        <br></br>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* DONAR AHORA: URL COMPLETA bla bla*/}
          <a
            href="https://link.mercadopago.com.ar/perritosrescatados1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#F5793B] hover:brightness-95"
          >
            Donar ahora
           </a>
          
          {/* Mismo cambio para el botón de Suscripción bla bla */}
          <a
            href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=0335e4d01d024164a176c82074e2b61b"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
          >
            Suscribirme
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = useYear();
  return (
    <footer className="bg-[#EA4E4E] text-white mt-12">
      <div className="max-w-[1100px] mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-center md:text-left">
        
        {/* Logo + ubicación */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src="/img/Logo2.jpg"
            alt="Perritos Rescatados"
            className="h-14 w-auto"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/56x56/EA4E4E/FFFFFF?text=PR"; }}
          />
        </div>

        {/* Contacto */}
        <div className="flex flex-col items-center">
          <h3 className="font-semibold mb-2">Contacto</h3>
          <a
            href="mailto:perritosrescatados@hotmail.com"
            className="hover:underline"
          >
            perritosrescatados@hotmail.com
          </a>
        </div>

        {/* Redes Sociales */}
        <div className="flex flex-col items-center md:items-end">
          <h3 className="font-semibold mb-2">Seguinos</h3>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/perritosrescatados/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="hover:opacity-80"
            >
              <img src="/img/instagram.png" alt="Instagram" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=IG"; }}/>
            </a>
            <a
              href="https://www.facebook.com/perritos.rescatados.198465/"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              className="hover:opacity-80"
            >
              <img src="/img/facebook.png" alt="Facebook" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=FB"; }}/>
            </a>
             <a
              href="https://www.tiktok.com/@perritosrescatados_?_r=1&_t=ZM-91LwOvbMCDr"
              target="_blank"
              rel="noopener"
              aria-label="TikTok"
              className="hover:opacity-80"
            >
              <img src="/img/tiktok.png" alt="Tiktok" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=FB"; }}/>
            </a>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-white/30 mt-6">
        <p className="text-center text-sm opacity-80 py-4">
          © {year} Perritos Rescatados
          </p>
      </div>
    </footer>
  );
}


/* ================= APP ================= */
export default function PerritosRescatadosApp() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      el?.setAttribute("tabindex", "-1");
      el?.focus({ preventScroll: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7E9DC] text-slate-800">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="main">
        <Hero />
        <Adopciones />
        <Transitos />
        <Tienda/>        
        <Colabora />
      </main>

      <Footer />
    </div>
  );
}