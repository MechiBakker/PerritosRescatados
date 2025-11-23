/* --- PERRITOS RESCATADOS APP — BACKEND-INTEGRATED VERSION ---
   Este archivo reemplaza completamente al original.
   Cambios principales:
   ✔ Carrusel de rescatados dinámico (sin Instagram)
   ✔ Tienda dinámica desde backend
   ✔ Botón Comprar (Mercado Pago)
   ✔ Código limpio y organizado
---------------------------------------------------------------- */

import React, { useEffect, useState, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";

/* ================================================================
   UTILS
================================================================ */

async function comprarProducto(productId, quantity = 1) {
  try {
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity })
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
   COMPONENTE: CARRUSEL RESCATADOS
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
        {/* Botón PREV */}
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
                  <h3 className="text-[#38629F] font-semibold text-lg">
                    {p.name}
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">{p.desc}</p>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Botón NEXT */}
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
   COMPONENTE: TIENDA — PRODUCTOS DINÁMICOS
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
                  <p className="text-slate-600 text-sm mt-2">
                    {producto.desc}
                  </p>
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
    <div className="bg-[#f8f9fa]">
      <Header />

      {/* Carrusel DINÁMICO de Rescatados */}
      <CarouselPets />

      {/* Tienda con productos */}
      <Tienda />

      <Footer />
    </div>
  );
}
