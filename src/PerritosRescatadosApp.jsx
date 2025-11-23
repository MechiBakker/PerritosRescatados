import React, { useEffect, useMemo, useState, createContext, useContext } from "react";
// Importaciones de tus componentes visuales y utilidades
// Asegúrate de que las rutas a AdminPanel y Content sean correctas
import InstagramCarousel from "./InstagramCarousel"; // Asumo que existe
import AdminPanel from "./AdminPanel";               // Asumo que existe
import Content from "./components/Content";                     // Asumo que existe

/* ------------------ FIREBASE CLIENT (AUTH) INIT ------------------ */
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";

// 📌 CONFIGURACIÓN: Lee las variables de entorno PÚBLICAS (NEXT_PUBLIC_...)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa Firebase y Auth
// Solo se inicializa una vez, si las variables de entorno están cargadas.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* ================= 1. AUTH CONTEXT Y HOOKS ================= */

// Contexto de Autenticación
const AuthContext = createContext({
    currentUser: null,
    isAdmin: false,
    loading: true,
    logout: () => {},
    loginAdmin: () => {}
});

// Hook de Consumo para otros componentes (e.g., Header, AdminPanel)
export const useAuth = () => useContext(AuthContext);

// Hook de Lógica Central de Firebase
const useFirebaseAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 📌 Listener REAL que se conecta a Firebase para monitorear la sesión
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                
                // Obtener el token con los Custom Claims
                const idTokenResult = await user.getIdTokenResult();
                
                // 📌 VERIFICACIÓN DE ADMIN: Lee el claim 'admin'
                const isAdminUser = idTokenResult.claims.admin === true; 
                setIsAdmin(isAdminUser);

            } else {
                setCurrentUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Limpieza del listener
    }, []);

    const loginAdmin = async (email, password) => {
        setLoading(true);
        try {
            // 📌 Llama a la función REAL de Firebase para iniciar sesión
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // El onAuthStateChanged se disparará y verificará el claim 'admin'
            return { success: true, user: userCredential.user };

        } catch (error) {
            console.error("Error de login:", error.message);
            setIsAdmin(false);
            
            let errorMessage = "Credenciales inválidas o no autorizado.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Email o contraseña incorrectos.";
            } else if (error.code === 'auth/too-many-requests') {
                 errorMessage = "Demasiados intentos. Intenta más tarde.";
            }
            return { success: false, error: errorMessage }; 
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        // 📌 Llama a la función REAL de Firebase para cerrar sesión
        await signOut(auth); 
        window.location.hash = '#'; // Redirige a la Home
    };

    return { currentUser, isAdmin, loading, loginAdmin, logout };
};

// Proveedor de Contexto
function AuthProvider({ children }) {
    const auth = useFirebaseAuth();
    
    const memoizedAuth = useMemo(() => auth, [auth.currentUser, auth.isAdmin, auth.loading]);

    return (
        <AuthContext.Provider value={memoizedAuth}>
            {children}
        </AuthContext.Provider>
    );
}

/* ================= 2. COMPONENTES VISUALES ================= */

function Header() {
    const [open, setOpen] = useState(false);
    // 📌 Usa el hook useAuth para el estado de sesión
    const { currentUser } = useAuth(); 

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
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/EA4E4E/FFFFFF?text=Logo"; }}
                    />
                    <span className="font-title text-xl hidden sm:inline">Perritos Rescatados</span>
                </a>

                {/* Nav Desktop */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium">
                    <a href="#about" className="hover:opacity-80 transition">Nosotros</a>
                    <a href="#adopciones" className="hover:opacity-80 transition">Adopciones</a>
                    <a href="#tienda" className="hover:opacity-80 transition">Tienda</a>
                    <a href="#donaciones" className="hover:opacity-80 transition">Donaciones</a>
                    {/* 📌 Link a Admin solo si hay un usuario logueado */}
                    {currentUser && <a href="#admin" className="hover:opacity-80 transition text-yellow-300">ADMIN</a>}
                </nav>

                {/* Hamburguer Button */}
                <button 
                    className="md:hidden p-2" 
                    onClick={() => setOpen(true)}
                    aria-label="Abrir menú"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>

            {/* Mobile Menu (Modal/Off-canvas) */}
            {open && (
                <div className="fixed inset-0 bg-[#38629F] z-50 md:hidden">
                    <div className="flex justify-between items-center p-4">
                        <span className="font-title text-xl">Menú</span>
                        <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <nav className="flex flex-col text-lg p-4 space-y-4">
                        <a onClick={() => setOpen(false)} href="#about" className="hover:opacity-80 transition">Nosotros</a>
                        <a onClick={() => setOpen(false)} href="#adopciones" className="hover:opacity-80 transition">Adopciones</a>
                        <a onClick={() => setOpen(false)} href="#tienda" className="hover:opacity-80 transition">Tienda</a>
                        <a onClick={() => setOpen(false)} href="#donaciones" className="hover:opacity-80 transition">Donaciones</a>
                        {currentUser && <a onClick={() => setOpen(false)} href="#admin" className="hover:opacity-80 transition text-yellow-300">ADMIN</a>}
                    </nav>
                </div>
            )}
        </header>
    );
}

function Footer() {
    return (
        <footer className="bg-[#38629F] text-white py-8">
            <div className="max-w-[1100px] mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Columna 1: Logo y contacto */}
                    <div>
                        <a href="#" className="inline-flex items-center gap-2 mb-4">
                            <img
                                src="/img/Logo1.jpg"
                                alt="Perritos Rescatados"
                                className="h-10 w-auto drop-shadow rounded-full"
                                loading="lazy"
                            />
                            <span className="font-title text-lg">Perritos Rescatados</span>
                        </a>
                        <p className="text-sm opacity-80 mt-2">
                            Rescatando y buscando hogares responsables para perros en Argentina.
                        </p>
                    </div>

                    {/* Columna 2: Navegación */}
                    <div>
                        <h4 className="font-semibold mb-3">Secciones</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li><a href="#about" className="hover:underline">Nosotros</a></li>
                            <li><a href="#adopciones" className="hover:underline">Adopciones</a></li>
                            <li><a href="#tienda" className="hover:underline">Tienda</a></li>
                            <li><a href="#donaciones" className="hover:underline">Donaciones</a></li>
                        </ul>
                    </div>

                    {/* Columna 3: Legal/Ayuda */}
                    <div>
                        <h4 className="font-semibold mb-3">Ayuda</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li><a href="#" className="hover:underline">Términos y Condiciones</a></li>
                            <li><a href="#" className="hover:underline">Política de Privacidad</a></li>
                            <li><a href="#" className="hover:underline">Preguntas Frecuentes</a></li>
                        </ul>
                    </div>

                    {/* Columna 4: Redes Sociales */}
                    <div>
                        <h4 className="font-semibold mb-3">Seguinos</h4>
                        <div className="flex space-x-3">
                            {/* Iconos de redes sociales */}
                            <a 
                                href="https://www.instagram.com/perritosrescatados_/"
                                target="_blank"
                                rel="noopener"
                                aria-label="Instagram"
                                className="hover:opacity-80"
                            >
                                <img src="/img/instagram.png" alt="Instagram" className="h-6 w-6" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/EA4E4E/FFFFFF?text=IG"; }}/>
                            </a>
                            <a 
                                href="https://www.facebook.com/perritosrescatadosoficial"
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
                        &copy; {new Date().getFullYear()} Perritos Rescatados. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function Login() {
    const { loginAdmin, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        
        const result = await loginAdmin(email, password);

        if (!result.success) {
            setError(result.error);
        } 
        // Si es exitoso, el hook useFirebaseAuth se re-renderizará y mostrará el AdminPanel

        setSubmitting(false);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-[#eff4fb]">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-center text-[#38629F] mb-6">Acceso Admin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F5793B] focus:border-[#F5793B] sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F5793B] focus:border-[#F5793B] sm:text-sm"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting || loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F5793B] hover:bg-[#F5793B]/80 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F5793B]"
                    >
                        {submitting ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                    <a href="#" className="block text-center text-sm text-[#38629F] hover:text-[#38629F]/80 mt-3">
                        Volver a la página principal
                    </a>
                </form>
            </div>
        </div>
    );
}

function AppContent() {
    const { isAdmin, loading } = useAuth();
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Si está cargando el estado de Firebase Auth (inicial)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#eff4fb]">
                <p className="text-xl font-semibold text-[#38629F]">Cargando sesión...</p>
            </div>
        );
    }

    let contentComponent;

    // Lógica de ruteo simple basada en el hash
    if (hash === '#admin') {
        if (isAdmin) {
            contentComponent = <AdminPanel />; // Si es admin, muestra el panel
        } else {
            contentComponent = <Login />;      // Si no es admin, muestra el login
        }
    } else {
        // Muestra el contenido principal (Home, Adopciones, Tienda, etc.)
        contentComponent = <Content />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                {contentComponent}
            </main>
            {/* El Footer se oculta en el Admin Panel */}
            {hash !== '#admin' && <Footer />}
        </div>
    );
}


/* ================= 3. COMPONENTE RAÍZ (ROOT) ================= */

export default function PerritosRescatadosApp() {
    // 📌 El componente AppContent y sus hijos ahora tienen acceso al contexto de autenticación
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}