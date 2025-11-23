import React, { useEffect, useState, useRef } from "react";

/* ================================================================
   HEADER
================================================================ */

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
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/40x40/38629F/FFFFFF?text=PR";
            }}
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
        <nav id="primary-nav" className="hidden lg:flex gap-6 text-sm font-bold">
          <a className="hover:text-[#F7E9DC] transition-colors" href="#quienes-somos">¿Quiénes somos?</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#adopciones">Adopciones</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#transitos">Tránsitos</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#tienda">Tienda</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#colabora">Colaborá</a>
        </nav>
      </div>

      {/* Menú mobile */}
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
      </nav>
    </header>
  );
}

/* ================================================================
   FOOTER
================================================================ */

function Footer() {
  // useYear no existe, usaremos Date
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#EA4E4E] text-white mt-12">
      <div className="max-w-[1100px] mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-center md:text-left">
        {/* Logo */}
        <div className="flex flex-col items-center md:items-start">
          <img
            src="/img/Logo2.jpg"
            alt="Perritos Rescatados"
            className="h-14 w-auto"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/56x56/EA4E4E/FFFFFF?text=PR";
            }}
          />
        </div>

        {/* Contacto */}
        <div className="flex flex-col items-center">
          <h3 className="font-semibold mb-2">Contacto</h3>
          <a href="mailto:perritosrescatados@hotmail.com" className="hover:underline">
            perritosrescatados@hotmail.com
          </a>
        </div>

        {/* Redes */}
        <div className="flex flex-col items-center md:items-end">
          <h3 className="font-semibold mb-2">Seguinos</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/perritosrescatados/" target="_blank" rel="noopener" aria-label="Instagram" className="hover:opacity-80">
              <img src="/img/instagram.png" alt="Instagram" className="h-6 w-6" />
            </a>
            <a href="https://www.facebook.com/perritos.rescatados.198465/" target="_blank" rel="noopener" aria-label="Facebook" className="hover:opacity-80">
              <img src="/img/facebook.png" alt="Facebook" className="h-6 w-6" />
            </a>
            <a href="https://www.tiktok.com/@perritosrescatados_?_r=1&_t=ZM-91LwOvbMCDr" target="_blank" rel="noopener" aria-label="TikTok" className="hover:opacity-80">
              <img src="/img/tiktok.png" alt="TikTok" className="h-6 w-6" />
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

/* ================================================================
   UTILITY: COMPRAR CON MERCADO PAGO
================================================================ */

async function comprarProducto(productId, quantity = 1) {
  try {
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const j = await r.json();
    if (j.init_point) {
      window.location.href = j.init_point;
    } else {
      alert("Error procesando el pago.");
    }
  } catch (err) {
    console.error(err);
    alert("Error conectando con Mercado Pago.");
  }
}

/* ================================================================
   COMPONENTE: CARRUSEL DE RESCATADOS
================================================================ */

function CarouselPets() {
  const [pets, setPets] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch("/api/pets")
      .then((r) => r.json())
      .then((data) => setPets(data))
      .catch(console.error);
  }, []);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  return (
    <section id="rescatados" className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#38629F] mb-4 text-left">
        Rescatados
      </h2>
      <div className="relative mt-6">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-md bg-white hover:bg-slate-100 active:scale-95 flex items-center justify-center text-[#38629F]"
        >
          ‹
        </button>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pr-4"
        >
          {pets.length === 0 ? (
            <p className="text-slate-500">Cargando rescates...</p>
          ) : (
            pets.map((p) => (
              <article
                key={p.id}
                data-card
                className="bg-white rounded-2xl shadow hover:shadow-lg transition-all min-w-[260px] max-w-[260px] overflow-hidden"
              >
                <img
                  src={p.photoURL}
                  alt={p.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-[#38629F] font-semibold text-lg">{p.name}</h3>
                  <p className="text-slate-600 text-sm mt-1">{p.desc}</p>
                </div>
              </article>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-md bg-white hover:bg-slate-100 active:scale-95 flex items-center justify-center text-[#38629F]"
        >
          ›
        </button>
      </div>
    </section>
  );
}

/* ================================================================
   COMPONENTE: TIENDA DE PRODUCTOS
================================================================ */

function Tienda() {
  const [productos, setProductos] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProductos(data))
      .catch(console.error);
  }, []);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  return (
    <section id="tienda" className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#38629F] mb-4">
        Productos Solidarios
      </h2>
      <div className="relative mt-6">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow bg-white hover:bg-slate-100 active:scale-95 text-[#38629F]"
        >
          ‹
        </button>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pr-4"
        >
          {productos.length === 0 ? (
            <p className="text-slate-500">Cargando productos...</p>
          ) : (
            productos.map((producto) => (
              <article
                key={producto.id}
                data-card
                className="bg-white rounded-2xl shadow hover:shadow-lg transition-all min-w-[260px] max-w-[260px] overflow-hidden"
              >
                <img
                  src={producto.photoURL}
                  alt={producto.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-[#38629F] text-xl font-semibold">
                    {producto.name}
                  </h3>
                  <p className="text-slate-600 text-sm mt-2">{producto.desc}</p>
                  <p className="text-[#38629F] text-lg font-bold mt-3">
                    ${producto.price}
                  </p>
                  <button
                    onClick={() => comprarProducto(producto.id, 1)}
                    className="mt-4 w-full py-2 px-4 bg-[#38629F] text-white rounded-2xl font-medium hover:bg-[#2a4c78] transition-all active:scale-95"
                  >
                    Comprar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow bg-white hover:bg-slate-100 active:scale-95 text-[#38629F]"
        >
          ›
        </button>
      </div>
    </section>
  );
}

/* ================================================================
   COMPONENTE PRINCIPAL
================================================================ */

export default function PerritosRescatadosApp() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <Header />
      <main>
        <CarouselPets />
        <Tienda />
      </main>
      <Footer />
    </div>
  );
}
