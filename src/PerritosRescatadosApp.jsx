import React, { useEffect, useMemo, useRef, useState, useContext, createContext } from "react";
import AdminPanel from "../pages/admin";

/* ------------------ FIREBASE CLIENT (AUTH) INIT ------------------ */
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Configuración de Firebase Client usando variables de entorno PÚBLICAS
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase y Auth (si no está inicializado aún)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // initializeApp puede lanzar si ya está inicializado; ignoramos
  // Esto permite que el archivo sea usado en entornos con hot-reload
}
const auth = getAuth(app);

const AuthContext = createContext();

/* ================= FIREBASE AUTH HOOK ================= */
const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha los cambios de autenticación
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Forzamos refrescar token para asegurarnos de tener los custom claims actualizados
        const token = await user.getIdTokenResult(true);
        const isAdminUser = token.claims && token.claims.admin === true;

        setCurrentUser(user);
        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error("Error obteniendo claims:", err);
        setCurrentUser(user);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Obtener claims actualizados
      const token = await userCredential.user.getIdTokenResult(true);
      const isAdminUser = token.claims && token.claims.admin === true;

      if (!isAdminUser) {
        // Si no es admin, cerramos sesión y retornamos error controlado
        await signOut(auth);
        return { success: false, error: "Este usuario no tiene permisos de administrador." };
      }

      setCurrentUser(userCredential.user);
      setIsAdmin(true);
      return { success: true, user: userCredential.user };
    } catch (error) {
      // Devuelve siempre un objeto consistente
      return { success: false, error: error?.message || "Error en el login" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Error during signOut:", e);
    } finally {
      setCurrentUser(null);
      setIsAdmin(false);
      window.location.hash = '#';
    }
  };

  return { currentUser, isAdmin, loading, loginAdmin, logout };
};

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const authState = useFirebaseAuth();
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};
/* ================= FIN FIREBASE AUTH CONTEXT ================= */


/* ================= API DATA FETCHING (INTEGRADO A FIREBASE BACKEND) ================= */
const fetchMascotas = async () => {
  const response = await fetch('/api/pets');
  if (!response.ok) throw new Error("Error fetching pets");
  return response.json();
};

const fetchProductos = async () => {
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error("Error fetching products");
  return response.json();
};

const fetchEstadisticas = async () => {
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error("Error fetching stats");
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

        <nav
          id="primary-nav"
          className="hidden lg:flex gap-6 text-sm font-bold items-center" 
        >
          <a className="hover:text-[#F7E9DC] transition-colors" href="#quienes-somos">¿Quiénes somos?</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#adopciones">Adopciones</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#transitos">Tránsitos</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#tienda">Tienda</a>
          <a className="hover:text-[#F7E9DC] transition-colors" href="#colabora">Colaborá</a>

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


/* ================= SECTIONS ================= */
function useYear() {
  return useMemo(() => new Date().getFullYear(), []);
}

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

// PetImageCarousel, CarouselPetsDynamic, Adopciones, Transitos, Tienda, BuyForm, Estadisticas, Colabora, Footer
// Reutilizamos tu código original para estos componentes y lo mantuvimos igual salvo pequeñas correcciones
function PetImageCarousel({ imgs, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const nextImage = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % imgs.length);
    const prevImage = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + imgs.length) % imgs.length);

    return (
        <div className="relative h-72 overflow-hidden rounded-t-2xl"> 
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
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x288/D9E3F1/38629F?text=Foto"; }}
                    />
                ))}
            </div>
            {imgs.length > 1 && (
                <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full text-xs hover:bg-black/60 transition" aria-label="Foto anterior">«</button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full text-xs hover:bg-black/60 transition" aria-label="Foto siguiente">»</button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                        {imgs.map((_, index) => (
                            <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white shadow' : 'bg-gray-400/80'}`} aria-label={`Ver foto ${index + 1}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function CarouselPetsDynamic({ mascotas }) {
  const trackRef = useRef(null);
  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const delta = card ? card.getBoundingClientRect().width + 16 : 400;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  if (!mascotas || mascotas.length === 0) {
      return <p className="text-center text-slate-500 mt-5">¡No hay perritos o gatitos en adopción por el momento! 💔</p>;
  }

  return (
    <div className="relative mt-6">
      <button type="button" className="absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10" aria-label="Anterior" onClick={() => scrollByCard(-1)}>«</button>

      <div ref={trackRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 scrollbar-hide relative" role="region">
        {mascotas.map((p) => (
          <article key={p.id} data-card className="min-w-[340px] max-w-[400px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow">
            <PetImageCarousel imgs={p.imgs} name={p.name} />
            <div className="p-4">
              <h3 className="text-[#38629F] font-semibold text-lg">{p.name}</h3>
              <p className="text-slate-600 text-sm mt-1">**Edad:** {p.age}</p>
              <p className="text-slate-600 text-sm mt-1">{p.desc}</p>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex mt-3 items-center justify-center px-3 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm">Ver más</a>
            </div>
          </article>
        ))}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      </div>

      <button type="button" className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white shadow hover:shadow-md border text-[#38629F] z-10" aria-label="Siguiente" onClick={() => scrollByCard(1)}>»</button>
    </div>
  );
}

function Adopciones() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMascotas()
      .then(setMascotas)
      .catch(e => console.error("Error cargando mascotas:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="adopciones" className="py-16 bg-white">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">Adopciones</h2>
        <br />
        <p className="text-slate-600 mt-2">Adoptar es un acto de amor...</p>
        <br />
        <div className="mt-10">
          <h3 className="text-[#38629F] text-xl font-semibold text-center mb-3">🐾 Nuestros rescatados buscando hogar</h3>
          {loading ? (
            <p className="text-center text-slate-500 mt-5">Cargando rescatados...</p>
          ) : (
            <CarouselPetsDynamic mascotas={mascotas} /> 
          )}
        </div>
      </div>
    </section>
  );
}

const COLLAGE = ["/img/013.jpeg","/img/008.jpeg","/img/001.jpeg","/img/018.jpeg","/img/002.jpeg","/img/019.jpeg","/img/024.jpeg","/img/033.jpeg","/img/030.jpeg"];

function Transitos() {
  return (
    <section id="transitos" className="py-16 bg-[#eff4fb]">
      <div className="max-w-[1100px] mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">Tránsitos</h2>
          <br></br>
          <p className="text-slate-600 mt-2">Para poder rescatar, es necesario contar con un espacio temporario...</p>
        </div>

        <div aria-label="Momentos de tránsito" className="grid grid-cols-3 gap-2 md:gap-3">
          {COLLAGE.map((src, i) => (
            <img key={i} src={src} alt={`Foto ${i + 1} del collage de tránsitos`} loading="lazy" className="w-full h-32 md:h-40 object-cover rounded-xl hover:scale-[1.03] transition-transform" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x160/D9E3F1/38629F?text=Foto ${i + 1}`; }} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.id, quantity, size }),
      });
      const data = await response.json();
      if (response.ok && data.checkoutUrl) {
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
        <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-2 block w-full p-2 border border-slate-300 rounded text-sm text-slate-700">
          <option value="">Selecciona Talle</option>
          <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
        </select>
      )}
      <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="mt-2 block w-full p-2 border border-slate-300 rounded text-center text-sm text-slate-700" />
      <button onClick={handleBuy} disabled={loading || (item.hasSizes && !size)} className="mt-3 inline-block px-4 py-2 rounded-full text-white bg-[#38629F] hover:brightness-95 text-sm font-semibold disabled:bg-gray-400">
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

  useEffect(() => {
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
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-6 text-center">🛍️ Tienda solidaria</h2>
        <p className="text-slate-600 text-center mb-10">Todo lo recaudado se destina a la atención veterinaria, alimento y cuidados de nuestros rescatados. 💕</p>
        {loading ? (
            <p className="text-center text-slate-500">Cargando productos...</p>
        ) : (
            <>
              <div className="relative md:hidden">
                <button type="button" onClick={() => scrollByCard(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white text-[#38629F] w-8 h-8 rounded-full shadow hover:shadow-md z-10">«</button>
                <div ref={trackRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-1">
                  {productos.map((item) => (
                    <article key={item.id} data-card className="min-w-[240px] max-w-[260px] snap-start bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                      <img src={item.img} alt={item.nombre} className="w-full h-64 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x300/eff4fb/38629F?text=${item.nombre}`; }} />
                      <div className="p-4 text-center">
                        <h3 className="text-[#38629F] font-semibold text-lg">{item.nombre}</h3>
                        <p className="text-slate-600 font-medium mt-1">${item.precio}</p>
                        <BuyForm item={item} />
                      </div>
                    </article>
                  ))}
                </div>
                <button type="button" onClick={() => scrollByCard(1)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#38629F] w-8 h-8 rounded-full shadow hover:shadow-md z-10">»</button>
              </div>

              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {productos.map((item) => (
                  <article key={item.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                    <img src={item.img} alt={item.nombre} className="w-full h-80 object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x300/eff4fb/38629F?text=${item.nombre}`; }} />
                    <div className="p-4 text-center">
                      <h3 className="text-[#38629F] font-semibold text-lg">{item.nombre}</h3>
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
        <p className="text-5xl font-extrabold text-[#F5793B] mb-2">{value}</p>
        <h3 className="text-lg font-medium text-slate-700">{title}</h3>
      </div>
    );
}

function Estadisticas() {
    const [stats, setStats] = useState({ rescatesMes: '...', adopcionesMes: '...', rescatesHistorico: '...' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchEstadisticas()
          .then(data => setStats(data))
          .catch(e => console.error("Error cargando estadísticas:", e))
          .finally(() => setLoading(false));
    }, []);

    return (
        <section id="estadisticas" className="py-16 bg-[#eff4fb]">
            <div className="max-w-[1100px] mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-12">📈 Nuestro Impacto</h2>
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
  const year = useYear();
  return (
    <section id="colabora" className="py-16 bg-gradient-to-b from-[#38629F]/10 to-[#F7E9DC]">
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F]">Colaborá con Perritos Rescatados</h2>
        <br></br>
        <p className="text-slate-600 mt-2">Nuestro trabajo es completamente ad honorem. Perritos Rescatados subsiste gracias a las donaciones y el aporte económico de ustedes.</p>
        <p className="text-slate-600 mt-2">Si querés donar o suscribirte para colaborar mensualmente:</p>
        <br></br>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="https://link.mercadopago.com.ar/perritosrescatados1" target="_blank" rel="noopener noreferrer" className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#F5793B] hover:brightness-95">Donar ahora</a>
          <a href="https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=0335e4d01d024164a176c82074e2b61b" target="_blank" rel="noopener noreferrer" className="inline-flex px-5 py-3 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95">Suscribirme</a>
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
          <img src="/img/Logo2.jpg" alt="Perritos Rescatados" className="h-14 w-auto" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/56x56/EA4E4E/FFFFFF?text=PR"; }} />
        </div>

        <div className="flex flex-col items-center">
          <h3 className="font-semibold mb-2">Contacto</h3>
          <a href="mailto:perritosrescatados@hotmail.com" className="hover:underline">perritosrescatados@hotmail.com</a>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <h3 className="font-semibold mb-2">Seguinos</h3>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/perritosrescatados/" target="_blank" rel="noopener" aria-label="Instagram" className="hover:opacity-80"><img src="/img/instagram.png" alt="Instagram" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=IG"; }} /></a>
            <a href="https://www.facebook.com/perritos.rescatados.198465/" target="_blank" rel="noopener" aria-label="Facebook" className="hover:opacity-80"><img src="/img/facebook.png" alt="Facebook" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=FB"; }} /></a>
            <a href="https://www.tiktok.com/@perritosrescatados_?_r=1&_t=ZM-91LwOvbMCDr" target="_blank" rel="noopener" aria-label="TikTok" className="hover:opacity-80"><img src="/img/tiktok.png" alt="Tiktok" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=FB"; }} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/30 mt-6">
        <p className="text-center text-sm opacity-80 py-4">© {year} Perritos Rescatados</p>
      </div>
    </footer>
  );
}

/* ================= COMPONENTES DE ADMINISTRACIÓN ================= */
function AdminLogin() {
    const { loginAdmin, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await loginAdmin(email, password);
        const success = result?.success;
        const loginError = result?.error;
        if (success) {
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
                    Iniciá sesión con tu cuenta de administrador.
                </p>
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded" required />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded" required />
                </div>
                <button type="submit" disabled={loading} className="w-full mt-4 py-2 px-4 rounded-full font-semibold text-white bg-[#38629F] hover:brightness-95 disabled:bg-gray-400">
                    {loading ? 'Iniciando sesión...' : 'Ingresar'}
                </button>
                <div className="text-center">
                    <a href="#" className="text-sm text-[#38629F] hover:underline" onClick={() => window.location.hash = '#'}>Volver al inicio</a>
                </div>
            </form>
        </div>
    );
}

/* ================= APP PRINCIPAL ================= */
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

  if (currentHash === '#admin-login' && !isAdmin) {
    return <AdminLogin />;
  }

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-[#F7E9DC] text-slate-800">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:rounded">Saltar al contenido</a>
      <Header />
      <main id="main">
        <Hero />
        <Adopciones />
        <Transitos />
        <Estadisticas /> 
        <Tienda/>        
        <Colabora />
      </main>
      <Footer />
    </div>
  );
}