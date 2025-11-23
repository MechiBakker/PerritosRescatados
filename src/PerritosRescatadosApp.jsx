import React, { useEffect, useMemo, useRef, useState } from "react";
import InstagramCarousel from "./InstagramCarousel"; // Asumo que este componente sigue siendo útil
// import Login from "./Login"; // En una app real, este se importaría aparte
// import AdminPanel from "./AdminPanel"; // En una app real, este se importaría aparte

/* ================= SIMULACIÓN DE DATOS DINÁMICOS (Backend) ================= */
// Función de simulación para cargar datos de adopciones
const fetchMascotas = () => {
  // 📌 CAMBIO: 'imgs' es un array de URLs
  return [
    { 
      id: 1, 
      name: "Max", 
      age: "2 años", 
      desc: "Perro muy juguetón, ideal para familias activas.", 
      imgs: ["/img/perro1_a.jpg", "/img/perro1_b.jpg", "/img/perro1_c.jpg"], // Múltiples fotos
      link: "https://www.instagram.com/p/mascota1/" 
    },
    { 
      id: 2, 
      name: "Luna", 
      age: "6 meses", 
      desc: "Cachorra tímida, necesita un hogar con mucha paciencia.", 
      imgs: ["/img/perro2_a.jpg", "/img/perro2_b.jpg"], 
      link: "https://www.instagram.com/p/mascota2/" 
    },
    { 
      id: 3, 
      name: "Coco", 
      age: "5 años", 
      desc: "Gato tranquilo, busca un lugar para descansar y recibir mimos.", 
      imgs: ["/img/gato1_a.jpg"], 
      link: "https://www.instagram.com/p/mascota3/" 
    },
    { 
      id: 4, 
      name: "Toby", 
      age: "1 año", 
      desc: "Energético, necesita mucho ejercicio y espacio para correr.", 
      imgs: ["/img/perro3_a.jpg", "/img/perro3_b.jpg"], 
      link: "https://www.instagram.com/p/mascota4/" 
    },
  ];
};

// Función de simulación para cargar datos de la tienda
const fetchProductos = () => {
  return [
    { id: 1, nombre: "Remeras", img: "/img/remera.jpg", precio: "25.000", hasSizes: true, mpUrl: "https://link-mp-remeras" },
    { id: 2, nombre: "Totebags", img: "/img/totebag.jpg", precio: "13.000", hasSizes: false, mpUrl: "https://link-mp-totebags" },
    { id: 3, nombre: "Velas", img: "/img/vela.jpg", precio: "5.000", hasSizes: false, mpUrl: "https://link-mp-velas" },
    { id: 4, nombre: "Comederos Marote", img: "/img/comederos.jpg", precio: "3.000 / 4.000", hasSizes: false, mpUrl: "https://link-mp-comederos" },
    { id: 5, nombre: "Frisbees", img: "/img/frisbee.jpg", precio: "4.000", hasSizes: false, mpUrl: "https://link-mp-frisbees" },
    { id: 6, nombre: "Cepillos", img: "/img/cepillo.jpg", precio: "2.500", hasSizes: false, mpUrl: "https://link-mp-cepillo" },
  ];
};

// Función de simulación para cargar estadísticas desde Google Sheets
const fetchEstadisticas = () => {
    // Aquí tu backend llamaría al API de Google Sheets
    return {
        rescatesMes: '45',
        adopcionesMes: '22',
        rescatesHistorico: '1.280',
    };
};
/* ================= FIN SIMULACIÓN ================= */


/* ================= HEADER ================= */
// Se mantiene igual. Solo se añade el link al login simulado.
function Header({ onLoginToggle, isAdmin }) {
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
           {/* Botón Admin - Simulación */}
           <button
            onClick={() => onLoginToggle(!isAdmin)}
            className="hover:text-[#F7E9DC] transition-colors focus:outline-none text-xs font-bold"
            aria-label={isAdmin ? "Cerrar sesión de Admin" : "Iniciar sesión de Admin"}
          >
            {isAdmin ? "Admin (Salir)" : "Login"}
          </button>
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
        <button
            onClick={() => { onLoginToggle(!isAdmin); setOpen(false); }}
            className="mt-4 text-sm hover:text-[#F7E9DC] focus:outline-none"
          >
            {isAdmin ? "Admin (Salir)" : "Login"}
          </button>
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
  // Se mantiene sin cambios
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

// 📌 Nuevo Componente: Carrusel interno de imágenes
function PetImageCarousel({ imgs, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imgs.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + imgs.length) % imgs.length);
    };

    return (
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
            {/* Contenedor de imágenes que se desplaza */}
            <div 
                className="flex transition-transform duration-300 h-full"
                style={{ width: `${imgs.length * 100}%`, transform: `translateX(-${currentIndex * (100 / imgs.length)}%)` }}
            >
                {imgs.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`${name} - Foto ${index + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                        style={{ width: `${100 / imgs.length}%` }}
                        // Ajuste para simulación: usa un placeholder si la URL es incorrecta
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/340x256/D9E3F1/38629F?text=Foto"; }}
                    />
                ))}
            </div>
            
            {/* Controles de navegación */}
            {imgs.length > 1 && (
                <>
                    {/* Flechas */}
                    <button 
                        onClick={prevImage} 
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full text-xs hover:bg-black/60 transition" 
                        aria-label="Foto anterior"
                    >
                        «
                    </button>
                    <button 
                        onClick={nextImage} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full text-xs hover:bg-black/60 transition" 
                        aria-label="Foto siguiente"
                    >
                        »
                    </button>
                    
                    {/* Puntos indicadores */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                        {imgs.map((_, index) => (
                            <button 
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white shadow' : 'bg-gray-400/80'}`}
                                aria-label={`Ver foto ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// 📌 Componente de Carrusel para Adopciones
function CarouselPetsDynamic({ mascotas }) {
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    // Calcula el desplazamiento: ancho de la tarjeta + gap (16px)
    const delta = card ? card.getBoundingClientRect().width + 16 : 340; // Ajustado a nueva medida
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  if (mascotas.length === 0) {
      return <p className="text-center text-slate-500 mt-5">¡No hay perritos o gatitos en adopción por el momento! 💔</p>;
  }

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
        {mascotas.map((p) => (
          <article
            key={p.id}
            data-card
            // 📌 CAMBIO: Aumento del ancho de la tarjeta
            className="min-w-[300px] max-w-[340px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow"
          >
            {/* 📌 CAMBIO: Uso del nuevo carrusel interno para múltiples imágenes */}
            <PetImageCarousel imgs={p.imgs} name={p.name} />

            <div className="p-4">
              <h3 className="text-[#38629F] font-semibold text-lg">
                {p.name}
              </h3>
              <p className="text-slate-600 text-sm mt-1">**Edad:** {p.age}</p>
              <p className="text-slate-600 text-sm mt-1">{p.desc}</p>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-3 items-center justify-center px-3 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm"
              >
                Ver más
              </a>
            </div>
          </article>
        ))}
        {/* Sombra al final del carrusel */}
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
  // 📌 Carga de datos dinámica de mascotas
  const [mascotas, setMascotas] = useState([]);
  
  useEffect(() => {
    // Aquí se reemplazaría por tu llamada a la API
    // fetch('/api/mascotas-adopcion').then(res => res.json()).then(setMascotas);
    setMascotas(fetchMascotas());
  }, []);

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

        {/* 📌 Reemplazando el carrusel de Instagram por el Carrusel Dinámico de Mascotas */}
          <div className="mt-10">
            <h3 className="text-[#38629F] text-xl font-semibold text-center mb-3">
              🐾 Nuestros rescatados buscando hogar
            </h3>
            <CarouselPetsDynamic mascotas={mascotas} /> 
          </div>

        <br />
      </div>
    </section>
  );
}


function Transitos() {
  // Se mantiene sin cambios
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

// 📌 Componente de Formulario de Compra de Producto
function BuyForm({ item }) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(item.hasSizes ? '' : 'N/A');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (item.hasSizes && !size) {
      alert("Por favor, selecciona un talle.");
      return;
    }

    setLoading(true);

    try {
      // 💡 Aquí se reemplazaría por tu llamada al API de Mercado Pago
      /*
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.id,
          productName: item.nombre,
          price: item.precio, // Idealmente enviar el precio como número desde el backend
          quantity,
          size,
        }),
      });
      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert("Error al generar el link de pago.");
      }
      */

      // SIMULACIÓN: Usar el URL estático proporcionado en la simulación
      console.log(`Simulando compra de ${quantity}x ${item.nombre} (Talle: ${size || 'N/A'}). Redirigiendo a: ${item.mpUrl}`);
      window.open(item.mpUrl, '_blank');

    } catch (error) {
      console.error("Error en la compra:", error);
      alert("Hubo un error al procesar la compra. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-3">
      {item.hasSizes && (
        <select 
          value={size} 
          onChange={(e) => setSize(e.target.value)} 
          className="mt-2 block w-full p-2 border border-slate-300 rounded text-sm text-slate-700"
        >
          <option value="">Selecciona Talle</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
      )}

      <input
        type="number"
        value={quantity}
        min="1"
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} // Asegura que sea al menos 1
        className="mt-2 block w-full p-2 border border-slate-300 rounded text-center text-sm text-slate-700"
      />

      <button
        onClick={handleBuy}
        disabled={loading || (item.hasSizes && !size)}
        className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold disabled:bg-gray-400"
      >
        {loading ? 'Procesando...' : 'Comprar'}
      </button>
    </div>
  );
}


function Tienda() {
  const [productos, setProductos] = useState([]);
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    // 📌 Carga de datos dinámica de productos
    // fetch('/api/productos').then(res => res.json()).then(setProductos);
    setProductos(fetchProductos());
  }, []);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 280;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  /* === AUTOPLAY === */
  useEffect(() => {
    const el = trackRef.current;
    if (!el || productos.length === 0) return;

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
      el?.removeEventListener("touchstart", handleUserInteraction);
      el?.removeEventListener("mousedown", handleUserInteraction);
    };
  }, [productos]);

  return (
    <section id="tienda" className="py-16 bg-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-6 text-center">
          🛍️ Tienda solidaria
        </h2>

        <p className="text-slate-600 text-center mb-10">
          Todo lo recaudado se destina a la atención veterinaria, alimento y cuidados de nuestros rescatados. 💕
        </p>
        
        {productos.length === 0 ? (
            <p className="text-center text-slate-500">Cargando productos...</p>
        ) : (
            <>
              {/* Carrusel en mobile */}
              <div className="relative md:hidden">
                {/* Flechas de control */}
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
                      key={item.id}
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
                        <p className="text-slate-600 font-medium mt-1">${item.precio}</p>
                        {/* 📌 Nuevo Formulario de Compra */}
                        <BuyForm item={item} /> 
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
                    key={item.id}
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
                      <p className="text-slate-600 font-medium mt-1">${item.precio}</p>
                      {/* 📌 Nuevo Formulario de Compra */}
                      <BuyForm item={item} />
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

// 📌 Nuevo Componente de Estadísticas
function StatCard({ title, value }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#38629F]/20">
        <p className="text-5xl font-extrabold text-[#EA4E4E] mb-2">{value}</p>
        <h3 className="text-lg font-medium text-slate-700">{title}</h3>
      </div>
    );
}

function Estadisticas() {
    const [stats, setStats] = useState({
        rescatesMes: '...',
        adopcionesMes: '...',
        rescatesHistorico: '...'
    });

    useEffect(() => {
        // 📌 Carga de datos dinámica de estadísticas desde el backend/Google Sheets
        // fetch('/api/stats-google-sheets').then(res => res.json()).then(setStats);
        setStats(fetchEstadisticas());
    }, []);

    return (
        <section id="estadisticas" className="py-16 bg-[#eff4fb]">
            <div className="max-w-[1100px] mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-12">
                    📈 Nuestro Impacto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard title="Rescates del Mes" value={stats.rescatesMes} />
                    <StatCard title="Adopciones del Mes" value={stats.adopcionesMes} />
                    <StatCard title="Rescates Históricos" value={stats.rescatesHistorico} />
                </div>
            </div>
        </section>
    );
}

function Colabora() {
  // Se mantiene sin cambios
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
          <a
            href="https://link.mercadopago.com.ar/perritosrescatados1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#F5793B] hover:brightness-95"
          >
            Donar ahora
           </a>
          
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
  // Se mantiene sin cambios
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

// 📌 Nuevo componente simulado de Panel de Administración (ejemplo)
function AdminPanel({ onLogout }) {
    return (
        <div className="max-w-[1100px] mx-auto px-4 py-16 min-h-screen">
            <h1 className="text-4xl font-bold text-[#38629F] mb-8">Panel de Administración 🔐</h1>
            <p className="text-slate-700 mb-6">Aquí puedes gestionar el contenido dinámico de la página.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#38629F]">
                    <h2 className="text-xl font-semibold mb-3">Gestión de Adopciones</h2>
                    <p className="text-sm text-slate-600">Agregar, editar o eliminar mascotas disponibles para adopción, incluyendo la subida de múltiples fotos.</p>
                    <button className="mt-4 text-white bg-green-500 px-4 py-2 rounded text-sm hover:bg-green-600">Abrir Panel</button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#38629F]">
                    <h2 className="text-xl font-semibold mb-3">Gestión de Tienda</h2>
                    <p className="text-sm text-slate-600">Administrar stock, precios, talles y URL de Mercado Pago de los productos.</p>
                    <button className="mt-4 text-white bg-green-500 px-4 py-2 rounded text-sm hover:bg-green-600">Abrir Panel</button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#38629F]">
                    <h2 className="text-xl font-semibold mb-3">Actualizar Estadísticas</h2>
                    <p className="text-sm text-slate-600">Sincronizar o editar manualmente los números de rescates/adopciones (Google Sheets).</p>
                    <button className="mt-4 text-white bg-green-500 px-4 py-2 rounded text-sm hover:bg-green-600">Abrir Panel</button>
                </div>
            </div>

            <button
                onClick={onLogout}
                className="mt-10 inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold text-white bg-[#EA4E4E] hover:brightness-95"
            >
                Cerrar Sesión
            </button>
        </div>
    );
}

/* ================= APP ================= */
export default function PerritosRescatadosApp() {
  // 📌 SIMULACIÓN DE AUTENTICACIÓN
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      el?.setAttribute("tabindex", "-1");
      el?.focus({ preventScroll: true });
    }
  }, []);

  if (isAdmin) {
    // 📌 Muestra el Panel de Administración si está logueado
    return <AdminPanel onLogout={() => setIsAdmin(false)} />;
  }
  
  // 📌 Muestra la aplicación normal si no es administrador
  return (
    <div className="min-h-screen bg-[#F7E9DC] text-slate-800">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Saltar al contenido
      </a>

      {/* Se pasa el estado y la función para que el Header pueda mostrar/cambiar el Login */}
      <Header isAdmin={isAdmin} onLoginToggle={setIsAdmin} />

      <main id="main">
        <Hero />
        <Adopciones />
        <Transitos />
        <Tienda/>        
        {/* 📌 SECCIÓN DE ESTADÍSTICAS AGREGADA AQUÍ */}
        <Estadisticas /> 
        <Colabora />
      </main>

      <Footer />
    </div>
  );
}