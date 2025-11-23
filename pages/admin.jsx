// pages/admin.jsx
import React, { useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

/**
 * Admin panel — versión estética (Tailwind)
 *
 * Requisitos (client env vars):
 * NEXT_PUBLIC_FIREBASE_API_KEY
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * NEXT_PUBLIC_FIREBASE_APP_ID
 *
 * Endpoints esperados en server:
 * GET /api/pets
 * POST /api/pets (Authorization: Bearer <idToken>)
 * GET /api/products
 * POST /api/products (Authorization: Bearer <idToken>)
 * PATCH /api/products (Authorization: Bearer <idToken>)
 * POST /api/upload (Authorization: Bearer <idToken>, multipart/form-data)
 * GET /api/stats
 *
 * - This page uses Firebase Auth to sign in an admin user (email/password).
 * - After login it lists pets and products, allows create, edit stock and delete.
 * - Uploads images via /api/upload (server handles saving to Firebase Storage).
 */

/* ------------------ Firebase client init ------------------ */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
try {
  if (typeof window !== "undefined") {
    app = initializeApp(firebaseConfig);
  }
} catch (e) {
  // ignore if already initialized
}

const auth = typeof window !== "undefined" ? getAuth() : null;

/* ------------------ Small UI components ------------------ */

function Field({ label, children }) {
  return (
    <label className="block mb-2 text-sm">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      {title && <h3 className="font-semibold text-[#38629F] mb-2">{title}</h3>}
      {children}
    </div>
  );
}

/* ------------------ Admin Page ------------------ */

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [uploading, setUploading] = useState(false);

  const [showNewPetModal, setShowNewPetModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  const newPetForm = useRef(null);
  const newProductForm = useRef(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // when auth state changes, refresh lists
      if (u) fetchAll();
      else {
        setPets([]);
        setProducts([]);
        setStats({});
      }
    });
    // initial fetch (public)
    fetchPublicLists();
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPublicLists() {
    try {
      const [pR, prR] = await Promise.all([
        fetch("/api/pets").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
      ]);
      setPets(pR || []);
      setProducts(prR || []);
    } catch (err) {
      console.error("fetch lists:", err);
    }
  }

  async function fetchAll() {
    await fetchPublicLists();
    try {
      const s = await fetch("/api/stats").then((r) => r.json()).catch(() => ({}));
      setStats(s || {});
    } catch (err) {
      console.error("stats error", err);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
      setEmail("");
      setPwd("");
    } catch (err) {
      console.error(err);
      alert("Error en login: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function getIdToken() {
    if (!auth || !auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }

  /* ------------------ Upload helper ------------------ */
  async function uploadFile(file) {
    if (!file) return null;
    const token = await getIdToken();
    if (!token) throw new Error("No token");

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: form,
      });
      const json = await res.json();
      if (res.ok) {
        // endpoint returns { urls: [ ... ] }
        const url = json.urls?.[0] ?? null;
        return url;
      } else {
        console.error("upload failed", json);
        throw new Error(json.error || "upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  /* ------------------ Create pet ------------------ */
  async function handleCreatePet(e) {
    e.preventDefault();
    const form = newPetForm.current;
    const name = form.name.value.trim();
    const desc = form.desc.value.trim();
    const file = form.photo.files[0];

    if (!name) return alert("Nombre requerido");

    try {
      let photoURL = "";
      if (file) {
        photoURL = await uploadFile(file);
      }

      const token = await getIdToken();
      const r = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ name, desc, photoURL }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Error creando rescatado");
      }

      form.reset();
      setShowNewPetModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || err));
    }
  }

  /* ------------------ Create product ------------------ */
  async function handleCreateProduct(e) {
    e.preventDefault();
    const form = newProductForm.current;
    const name = form.name.value.trim();
    const desc = form.desc.value.trim();
    const price = Number(form.price.value);
    const stock = Number(form.stock.value || 0);
    const file = form.photo.files[0];

    if (!name || isNaN(price)) return alert("Nombre y precio requeridos");

    try {
      let photoURL = "";
      if (file) {
        photoURL = await uploadFile(file);
      }

      const token = await getIdToken();
      const r = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ name, desc, price, stock, photoURL }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Error creando producto");
      }

      form.reset();
      setShowNewProductModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || err));
    }
  }

  /* ------------------ Edit stock (prompt) ------------------ */
  async function handleEditStock(product) {
    const input = prompt("Nuevo stock para " + product.name, String(product.stock || 0));
    if (input == null) return;
    const newStock = Number(input);
    if (isNaN(newStock)) return alert("Stock inválido");

    try {
      const token = await getIdToken();
      const r = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ id: product.id, stock: newStock }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Error actualizando stock");
      }
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || err));
    }
  }

  /* ------------------ Delete helpers ------------------ */
  async function handleDeletePet(id) {
    if (!confirm("Eliminar rescatado?")) return;
    try {
      const token = await getIdToken();
      const r = await fetch(`/api/pets?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!r.ok) throw new Error("Error eliminando");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || err));
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Eliminar producto?")) return;
    try {
      const token = await getIdToken();
      const r = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (!r.ok) throw new Error("Error eliminando");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || err));
    }
  }

  /* ------------------ Simple UI render ------------------ */
  return (
    <div className="min-h-screen bg-[#F7E9DC]">
      {/* Top bar */}
      <header className="bg-[#38629F] text-white">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/img/Logo1.jpg" alt="logo" className="h-10" />
            <div>
              <div className="font-bold">Perritos Rescatados — Admin</div>
              <div className="text-xs opacity-80">Panel de gestión</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-sm">Logueado: <strong>{user.email}</strong></div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-full bg-white text-[#38629F] font-semibold"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <form onSubmit={handleLogin} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 rounded-md text-sm"
                  required
                />
                <input
                  type="password"
                  placeholder="contraseña"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="px-3 py-2 rounded-md text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 rounded-md bg-[#F5793B] text-white font-semibold"
                >
                  Entrar
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <Card title="Estadísticas">
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Rescatados este mes</div>
              <div className="text-2xl font-bold text-[#38629F]">{stats.rescatados_mes ?? "-"}</div>

              <div className="text-sm text-slate-600 mt-3">Adoptados este mes</div>
              <div className="text-2xl font-bold text-[#38629F]">{stats.adoptados_mes ?? "-"}</div>

              <div className="text-sm text-slate-600 mt-3">Adoptados históricos</div>
              <div className="text-2xl font-bold text-[#38629F]">{stats.adoptados_total ?? "-"}</div>
            </div>
          </Card>

          <Card title="Acciones rápidas">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowNewPetModal(true)}
                className="px-4 py-2 bg-[#38629F] text-white rounded-md font-semibold"
              >
                + Nuevo rescatado
              </button>

              <button
                onClick={() => setShowNewProductModal(true)}
                className="px-4 py-2 bg-[#F5793B] text-white rounded-md font-semibold"
              >
                + Nuevo producto
              </button>

              <button
                onClick={fetchAll}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Refrescar datos
              </button>
            </div>
          </Card>

          <Card title="Subida de imagen (rápida)">
            <QuickUploader uploadFile={uploadFile} uploading={uploading} />
          </Card>
        </section>

        {/* Lists: pets & products */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Rescatados */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#38629F]">Rescatados</h2>
              <div className="text-sm text-slate-600">{pets.length} items</div>
            </div>

            <div className="grid gap-3">
              {pets.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-3 flex gap-3 items-center shadow">
                  <img src={p.photoURL || "/img/placeholder.jpg"} className="w-20 h-20 object-cover rounded-lg" alt={p.name} />
                  <div className="flex-1">
                    <div className="font-semibold text-[#38629F]">{p.name}</div>
                    <div className="text-sm text-slate-600">{p.desc}</div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(window.location.origin + "/#rescatado-" + p.id)}
                        className="text-xs px-2 py-1 rounded-md border"
                      >
                        Copiar link
                      </button>
                      <button
                        onClick={() => handleDeletePet(p.id)}
                        className="text-xs px-2 py-1 rounded-md bg-red-600 text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[#38629F]">Productos</h2>
              <div className="text-sm text-slate-600">{products.length} items</div>
            </div>

            <div className="grid gap-3">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl p-3 flex gap-3 items-center shadow">
                  <img src={prod.photoURL || "/img/placeholder.jpg"} className="w-20 h-20 object-cover rounded-lg" alt={prod.name} />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#38629F]">{prod.name}</div>
                        <div className="text-sm text-slate-600">{prod.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#38629F]">${prod.price}</div>
                        <div className="text-sm text-slate-600">Stock: {prod.stock ?? 0}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEditStock(prod)}
                        className="px-3 py-1 text-sm border rounded-md"
                      >
                        Editar stock
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t mt-8 py-6">
        <div className="max-w-[1100px] mx-auto px-4 text-center text-sm text-slate-600">
          Panel administrativo — Perritos Rescatados
        </div>
      </footer>

      {/* ------------------- MODALES ------------------- */}
      {showNewPetModal && (
        <Modal onClose={() => setShowNewPetModal(false)} title="Crear nuevo rescatado">
          <form ref={newPetForm} onSubmit={handleCreatePet} className="space-y-3">
            <Field label="Nombre">
              <input name="name" className="w-full border rounded px-3 py-2" required />
            </Field>
            <Field label="Descripción">
              <textarea name="desc" className="w-full border rounded px-3 py-2" rows="3" />
            </Field>
            <Field label="Foto">
              <input name="photo" type="file" accept="image/*" />
              <div className="text-xs text-slate-500 mt-1">Se recomienda 800x600</div>
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewPetModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-[#38629F] text-white rounded">Crear</button>
            </div>
          </form>
        </Modal>
      )}

      {showNewProductModal && (
        <Modal onClose={() => setShowNewProductModal(false)} title="Crear nuevo producto">
          <form ref={newProductForm} onSubmit={handleCreateProduct} className="space-y-3">
            <Field label="Nombre">
              <input name="name" className="w-full border rounded px-3 py-2" required />
            </Field>
            <Field label="Descripción">
              <textarea name="desc" className="w-full border rounded px-3 py-2" rows="3" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio">
                <input name="price" type="number" step="0.01" className="w-full border rounded px-3 py-2" required />
              </Field>
              <Field label="Stock">
                <input name="stock" type="number" className="w-full border rounded px-3 py-2" defaultValue={0} />
              </Field>
            </div>
            <Field label="Foto">
              <input name="photo" type="file" accept="image/*" />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewProductModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-[#F5793B] text-white rounded">Crear producto</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ------------------ Modal component ------------------ */
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-[#38629F]">{title}</h3>
          <button onClick={onClose} className="text-slate-500">Cerrar</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ------------------ QuickUploader ------------------ */
function QuickUploader({ uploadFile, uploading }) {
  const fileRef = useRef(null);

  async function onUpload() {
    const f = fileRef.current.files[0];
    if (!f) return alert("Elegí un archivo");
    try {
      const url = await uploadFile(f);
      if (url) {
        prompt("Imagen subida. Copiala si la querés usar:", url);
      }
    } catch (err) {
      console.error(err);
      alert("Error subiendo imagen");
    }
  }

  return (
    <div className="space-y-2">
      <input ref={fileRef} type="file" accept="image/*" />
      <div className="flex gap-2">
        <button onClick={onUpload} className="px-3 py-2 bg-[#38629F] text-white rounded" disabled={uploading}>
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </div>
      <div className="text-xs text-slate-500">Usa esto para subir imágenes rápidamente y pegar la URL en formularios.</div>
    </div>
  );
}
