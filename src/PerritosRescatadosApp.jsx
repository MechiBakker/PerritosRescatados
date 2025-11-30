import React, { useEffect, useMemo, useRef, useState, useContext, createContext } from "react";
// import InstagramCarousel from "./InstagramCarousel"; // No usado, se mantiene por si acaso


import AdminPanel from "./admin";


/* ------------------ FIREBASE CLIENT (AUTH) INIT ------------------ */
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";

// Configuración de Firebase Client usando variables de entorno PÚBLICAS
/* ================= FIREBASE CLIENT SETUP ================= */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ================= AUTH CONTEXT ================= */
const AuthContext = createContext();

/* ================= CUSTOM HOOK ================= */
const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listener real de Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const token = await user.getIdTokenResult(true);
      setCurrentUser(user);
      setIsAdmin(token.claims.admin === true);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // LOGIN ADMIN
  const loginAdmin = async (email, password) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdTokenResult(true);
      const isAdminUser = token.claims.admin === true;

      if (!isAdminUser) {
        await signOut(auth);
        return { success: false, error: "Este usuario no tiene permisos de administrador." };
      }

      setCurrentUser(userCredential.user);
      setIsAdmin(true);

      return { success: true, user: userCredential.user };

    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return { currentUser, isAdmin, loading, loginAdmin, logout };
};

/* ================= AUTH PROVIDER ================= */
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const authState = useFirebaseAuth();
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};

/* ================= FIN FIREBASE AUTH CONTEXT ================= */


/* ================= API DATA FETCHING (INTEGRADO A FIREBASE BACKEND) ================= */
// Estas funciones ahora hacen peticiones reales a tus endpoints de Firebase/Next.js
// La autenticación es manejada por Firebase Auth en el admin.

const fetchMascotas = async () => {
  // GET /api/pets trae la lista de rescatados de Firestore
  const response = await fetch('/api/pets');
  if (!response.ok) throw new Error("Error fetching pets");
  return response.json();
};

const fetchProductos = async () => {
  // GET /api/products trae la lista de productos de Firestore
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error("Error fetching products");
  return response.json();
};

const fetchEstadisticas = async () => {
  // GET /api/stats lee las métricas de Google Sheets
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error("Error fetching stats");
  // Asumimos que devuelve un objeto { rescatesMes: 'X', adopcionesMes: 'Y', ... }
  return response.json();
};
/* ================= FIN API DATA FETCHING ================= */


/* ================= HEADER ================= */
function Header() {
  const { isAdmin, logout, loading, currentUser } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // Función para cerrar el menú y ejecutar la acción
  const handleAdminAction = () => {
    setOpen(false);
    if (isAdmin) {
      logout();
    } else {
      window.location.hash = '#admin-login';
    }
  }

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
          className="hidden lg:flex gap-6 text-sm font-bold items-center" 
        >
          <a className="hover:text-[#F7E9DC] transition-colors" href="#quienes-somos">¿Quiénes somos?</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#adopciones">Adopciones</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#transitos">Tránsitos</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#tienda">Tienda</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#colabora">Colaborá</a>
           
           {/* 📌 Botón Admin Login/Logout - SOLO visible para Administradores o si NO hay sesión activa */}
           {!loading && (
             (isAdmin || !currentUser) && (
              <button
                onClick={handleAdminAction}
                className="hover:text-[#F7E9DC] transition-colors focus:outline-none text-xs font-bold px-3 py-1 border border-white rounded-full hover:bg-white hover:text-[#38629F]"
                aria-label={isAdmin ? "Cerrar sesión de Admin" : "Iniciar sesión de Admin"}
              >
                {isAdmin ? "Admin (Salir)" : "Admin Login"}
              </button>
             )
           )}
        </nav>
      </div>

      {/* Menú overlay en mobile */}
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
        
        {/* Botón Admin en Mobile */}
        {!loading && (
            (isAdmin || !currentUser) && (
                <button
                    onClick={handleAdminAction}
                    className="mt-4 text-sm hover:text-[#F7E9DC] focus:outline-none px-3 py-1 border border-white rounded-full hover:bg-white hover:text-[#38629F]"
                >
                    {isAdmin ? "Admin (Salir)" : "Admin Login"}
                </button>
            )
        )}
      </nav>
    </header>
  );
}


/* ================= SECTIONS (Se mantienen igual, salvo la carga de datos) ================= */
// ... (Hero, PetImageCarousel, CarouselPetsDynamic se mantienen iguales) ...

function useYear() {
  return useMemo(() => new Date().getFullYear(), []);
}

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
        // Altura aumentada a h-72
        <div className="relative h-72 overflow-hidden rounded-t-2xl"> 
            {/* Contenedor de imágenes que se desplaza */}
            <div 
                className="flex transition-transform duration-300 h-full"
                style={{ width: `${imgs.length * 100}%`, transform: `translateX(-${currentIndex * (100 / imgs.length)}%)` }}
            >
                {imgs.map((src, index) => (
                    <img
                        key={index}
                        // 📌 Las URL de las imágenes ahora serán de Firebase Storage
                        src={src} 
                        alt={`${name} - Foto ${index + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                        style={{ width: `${100 / imgs.length}%` }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x288/D9E3F1/38629F?text=Foto"; }}
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
    const delta = card ? card.getBoundingClientRect().width + 16 : 400; // Ajustado a nueva medida
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
            // 📌 Ancho ajustado para 3 cards
            className="min-w-[340px] max-w-[400px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow"
          >
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
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    fetchMascotas() // Llama a la API /api/pets
      .then(setMascotas)
      .catch(e => console.error("Error cargando mascotas:", e))
      .finally(() => setLoading(false));
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

        <div className="mt-10">
          <h3 className="text-[#38629F] text-xl font-semibold text-center mb-3">
            🐾 Nuestros rescatados buscando hogar
          </h3>
          {loading ? (
            <p className="text-center text-slate-500 mt-5">Cargando rescatados...</p>
          ) : (
            <CarouselPetsDynamic mascotas={mascotas} /> 
          )}
        </div>

        <br />
      </div>
    </section>
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
      // 📌 REEMPLAZO: Llama al API /api/checkout que gestiona Mercado Pago y Stock
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.id, // ID del producto en Firestore
          quantity,
          size,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.checkoutUrl) {
        // Redirige a la URL de pago de Mercado Pago
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert(data.error || "Error al generar el link de pago.");
      }

    } catch (error) {
      console.error("Error en la compra:", error);
      alert("Hubo un error al procesar la compra.");
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
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    // 📌 Llama a la API /api/products para cargar datos de Firestore
    setLoading(true);
    fetchProductos()
      .then(setProductos)
      .catch(e => console.error("Error cargando productos:", e))
      .finally(() => setLoading(false));
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
    // ... (Lógica de Autoplay se mantiene igual)
    const el = trackRef.current;
    if (!el || productos.length === 0) return;

    const handleUserInteraction = () => {
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

    if (window.innerWidth < 768 && !loading) {
      autoScrollRef.current = setInterval(autoplay, 3000);
    }

    return () => {
      clearInterval(autoScrollRef.current);
      el?.removeEventListener("touchstart", handleUserInteraction);
      el?.removeEventListener("mousedown", handleUserInteraction);
    };
  }, [productos, loading]);

  return (
    <section id="tienda" className="py-16 bg-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-6 text-center">
          🛍️ Tienda solidaria
        </h2>

        <p className="text-slate-600 text-center mb-10">
          Todo lo recaudado se destina a la atención veterinaria, alimento y cuidados de nuestros rescatados. 💕
        </p>
        
        {loading ? (
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


function StatCard({ title, value }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#38629F]/20">
        {/* 📌 Color del número a naranja (#F5793B) */}
        <p className="text-5xl font-extrabold text-[#F5793B] mb-2">{value}</p> 
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 📌 Llama a la API /api/stats para cargar métricas
        setLoading(true);
        fetchEstadisticas()
          .then(data => {
            // Asume que las claves son correctas o mapea si es necesario
            setStats(data); 
          })
          .catch(e => console.error("Error cargando estadísticas:", e))
          .finally(() => setLoading(false));
    }, []);

    return (
        <section id="estadisticas" className="py-16 bg-[#eff4fb]">
            <div className="max-w-[1100px] mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-12">
                    📈 Nuestro Impacto
                </h2>
                {loading ? (
                    <p className="text-center text-slate-500">Cargando datos...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard title="Rescates del Mes" value={stats.rescatesMes || '0'} />
                        <StatCard title="Adopciones del Mes" value={stats.adopcionesMes || '0'} />
                        <StatCard title="Rescates Históricos" value={stats.rescatesHistorico || '0'} />
                    </div>
                )}
            </div>
        </section>
    );
}

function Colabora() {
  // Se mantiene sin cambios, pero usamos los links directos para Donar y Suscribir
  const year = useYear();
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
            // 📌 Link de MP para donación simple
            href="https://link.mercadopago.com.ar/perritosrescatados1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#F5793B] hover:brightness-95"
          >
            Donar ahora
           </a>
          
          <a
            // 📌 Link de MP para suscripción
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

/* ================= COMPONENTES DE ADMINISTRACIÓN ================= */

// 📌 Componente de Login (Separado por hash routing)
function AdminLogin() {
    const { loginAdmin, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const { success, error: loginError } = await loginAdmin(email, password);
        if (success) {
            // Éxito: redirige al panel de administración (o simplemente borra el hash)
            window.location.hash = '#admin-panel'; 
        } else {
            setError(loginError || "Email o contraseña incorrectos.");
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16 min-h-screen">
            <h1 className="text-3xl font-bold text-[#38629F] mb-6 text-center">Acceso de Administrador</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-[#38629F]/20 space-y-4">
                <p className="text-xs text-center text-slate-500 mb-4">
                    Credenciales de prueba: **admin@perritos.com** / **password_segura**
                </p>
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full p-2 border border-slate-300 rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full p-2 border border-slate-300 rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-2 px-4 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95 disabled:bg-gray-400"
                >
                    {loading ? 'Iniciando sesión...' : 'Ingresar'}
                </button>
                <div className="text-center">
                    <a href="#" className="text-sm text-[#38629F] hover:underline" onClick={() => window.location.hash = '#'}>
                        Volver al inicio
                    </a>
                </div>
            </form>
        </div>
    );
}


/* ================= APP PRINCIPAL ================= */
// Se envuelve la App con el AuthProvider
export default function PerritosRescatadosAppWrapper() {
    return (
        <AuthProvider>
            <PerritosRescatadosApp />
        </AuthProvider>
    );
}

function PerritosRescatadosApp() {
  const { isAdmin, loading } = useAuth();
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Hook para escuchar cambios en el hash (simulación de routing)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      const hash = window.location.hash;
      if (hash) {
        const el = document.querySelector(hash);
        el?.setAttribute("tabindex", "-1");
        el?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-[#38629F]">Cargando sesión...</div>;
  }

  // Lógica de "Routing" de la aplicación
  if (currentHash === '#admin-login' && !isAdmin) {
    return <AdminLogin />;
  }
  
  if (isAdmin) {
    return <AdminPanel />;
  }
  
  // Muestra la aplicación pública
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
        {/* 📌 Orden solicitado: Estadísticas después de Tránsitos */}
        <Estadisticas /> 
        <Tienda/>        
        <Colabora />
      </main>

      <Footer />
    </div>
  );
}