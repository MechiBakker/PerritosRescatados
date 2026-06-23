import React, { useEffect, useMemo, useRef, useState } from "react";
import { AdopcionesSupabase, TiendaSupabase } from "./SeccionesPublicas.jsx";
import SeccionEstadisticas from "./SeccionEstadisticas.jsx";
import SeccionNoticias from "./SeccionNoticias.jsx";

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

        <button
          className="lg:hidden text-2xl px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav id="primary-nav" className="hidden lg:flex gap-6 text-sm font-bold items-center">
          <a className="hover:text-[#F7E9DC] transition-colors" href="#quienes-somos">¿Quiénes somos?</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#adopciones">Adopciones</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#transitos">Tránsitos</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#tienda">Tienda</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#tienda">Nuestro impacto</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#noticias">Noticias</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#colabora">Colaborá</a>
          <a
            href="/admin"
            className="bg-white text-[#38629F] px-3 py-1.5 rounded-lg font-bold hover:bg-[#F7E9DC] transition-colors"
          >
            Admin
          </a>
        </nav>
      </div>

      <nav
        className={`lg:hidden fixed inset-0 bg-[#38629F] flex flex-col items-center justify-center gap-6 text-lg font-semibold transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <a href="#quienes-somos" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>¿Quiénes somos?</a>
        <a href="#adopciones" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>Adopciones</a>
        <a href="#transitos" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>Tránsitos</a>
        <a href="#tienda" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>Tienda</a>
        <a href="#colabora" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>Colaborá</a>
        <a href="#colabora" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>Nuestro impacto</a>
        <a href="/admin" className="hover:text-[#F7E9DC]" onClick={() => setOpen(false)}>Admin</a>
      </nav>
    </header>
  );
}

const COLLAGE = [
  "/img/013.jpeg", "/img/008.jpeg", "/img/001.jpeg",
  "/img/018.jpeg", "/img/002.jpeg", "/img/019.jpeg",
  "/img/024.jpeg", "/img/033.jpeg", "/img/030.jpeg",
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
          <h1 className="font-semibold text-3xl md:text-4xl text-[#38629F] mb-4">¿Quiénes somos?</h1>
          <br />
          <p className="text-slate-600 leading-relaxed mb-3">
            ¡Bienvenidos! Somos un grupo de rescatistas de La Plata
            que unimos fuerzas en 2023 bajo el nombre de Perritos Rescatados.
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

function Transitos() {
  return (
    <section id="transitos" className="py-16 bg-[#eff4fb]">
      <div className="max-w-[1100px] mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">Tránsitos</h2>
          <br />
          <p className="text-slate-600 mt-2">
            Para poder rescatar, es necesario contar con un espacio temporario donde el animal rescatado puede recuperarse, sanar, aprender y recibir afecto mientras encuentra su hogar definitivo.
          </p>
          <p className="text-slate-600 mt-2">Perritos Rescatados se hace cargo de los gastos de alimentación, atención veterinaria y otros que requiera.</p>
          <br />
          <p className="text-slate-600 mt-2">Requisitos:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 mt-3">
            <li>Un entorno seguro y amoroso.</li>
            <li>Tener tiempo para dedicarle al animal.</li>
            <li>Estar en contacto fluido con la organización.</li>
            <li>Ser resolutivo y flexible.</li>
            <li>Ser responsable y comprometido.</li>
          </ul>
          <br />
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

        <div aria-label="Momentos de tránsito" className="grid grid-cols-3 gap-2 md:gap-3">
          {COLLAGE.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={"Foto " + (i + 1) + " del collage de tránsitos"}
              loading="lazy"
              className="w-full h-32 md:h-40 object-cover rounded-xl hover:scale-[1.03] transition-transform"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x160/D9E3F1/38629F?text=Foto"; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Colabora() {
  return (
    <section id="colabora" className="py-16 bg-gradient-to-b from-[#38629F]/10 to-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">
          Colaborá con Perritos Rescatados
        </h2>
        <br />
        <p className="text-slate-600 mt-2">
          Nuestro trabajo es completamente ad honorem. Perritos Rescatados subsiste gracias a las donaciones y el aporte económico de ustedes.
        </p>
        <p className="text-slate-600 mt-2">Si querés donar o suscribirte para colaborar mensualmente:</p>
        <br />
                <div className="mt-6 flex flex-col items-center justify-center gap-4">
          {/* Botón Principal (Arriba) */}
          <a
            href="https://link.mercadopago.com.ar/perritosrescatados1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#F5793B] hover:brightness-95"
          >
            Donar ahora
          </a>

          {/* Contenedor de Suscripciones (Abajo) */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <a
              href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=f136b0af870d467bba525aed525f74f6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
            >
              Suscribirme $3.000
            </a>
            <a
              href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=feb774cfde544ddd939bd2893b2137d5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
            >
              Suscribirme $5.000
            </a>
            <a
              href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=1dae99c69f3c49d485dd2540c3a5b89e"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
            >
              Suscribirme $10.000
            </a>
            <a
              href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=39ad68c7b6b04721a48997c1ff2037f1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
            >
              Suscribirme $15.000
            </a>
            <a
              href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=1d46bf3a71f54c2ca0a5e8fcaa8d0ec7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95"
            >
              Suscribirme $20.000
            </a>
          </div>
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
        <div className="flex flex-col items-center md:items-start">
          <img
            src="/img/Logo2.jpg"
            alt="Perritos Rescatados"
            className="h-14 w-auto"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/56x56/EA4E4E/FFFFFF?text=PR"; }}
          />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="font-semibold mb-2">Contacto</h3>
          <a href="mailto:perritosrescatados@hotmail.com" className="hover:underline">
            perritosrescatados@hotmail.com
          </a>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <h3 className="font-semibold mb-2">Seguinos</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/perritosrescatados/" target="_blank" rel="noopener" aria-label="Instagram" className="hover:opacity-80">
              <img src="/img/instagram.png" alt="Instagram" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=IG"; }} />
            </a>
            <a href="https://www.facebook.com/perritos.rescatados.198465/" target="_blank" rel="noopener" aria-label="Facebook" className="hover:opacity-80">
              <img src="/img/facebook.png" alt="Facebook" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=FB"; }} />
            </a>
            <a href="https://www.tiktok.com/@perritosrescatados_?_r=1&_t=ZM-91LwOvbMCDr" target="_blank" rel="noopener" aria-label="TikTok" className="hover:opacity-80">
              <img src="/img/tiktok.png" alt="Tiktok" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=TK"; }} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/30 mt-6">
        <p className="text-center text-sm opacity-80 py-4">© {year} Perritos Rescatados - Desarrollo: Mechi Bakker</p>
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
        <AdopcionesSupabase />
        <Transitos />
        <TiendaSupabase />
        <SeccionEstadisticas />
        <SeccionNoticias />
        <Colabora />
      </main>

      <Footer />
    </div>
  );
}