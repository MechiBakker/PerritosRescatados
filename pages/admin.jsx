// pages/admin.jsx
import React, { useEffect, useState, useRef, useCallback, useContext, createContext } from "react";

// 📌 ATENCIÓN: Debes importar el useAuth hook desde donde lo definiste (e.g., PerritosRescatadosApp.jsx o un archivo AuthContext)
// Asumimos que la lógica de Auth y el hook useAuth está disponible.
// Importante: La lógica del frontend ya no necesita las funciones de Firebase client (signInWithEmailAndPassword, etc.)
// porque el useAuth se encarga de eso.
// Por simplicidad, importamos un stub de useAuth para que este archivo pueda ser un módulo separado.
const AuthContext = createContext({
    currentUser: null,
    isAdmin: false,
    loading: false,
    logout: () => {},
    loginAdmin: () => {}
});
const useAuth = () => useContext(AuthContext); // Reemplaza esta línea con la importación real de tu hook.

/**
 * Admin panel — versión estética (Tailwind)
 * * - Usa el hook useAuth para obtener el estado de la sesión (currentUser).
 * - Usa currentUser.getIdToken() para asegurar todas las llamadas a la API (POST, DELETE, PATCH, UPLOAD).
 */

/* ------------------ API UTILS (Con Token de Firebase Auth) ------------------ */

// 📌 Función crucial para asegurar las llamadas
async function getAuthHeader(user) {
    if (!user) throw new Error("Usuario no autenticado para obtener token.");
    
    // Obtiene el token de sesión de Firebase del usuario logueado
    const token = await user.getIdToken(); 
    
    return {
        Authorization: `Bearer ${token}`,
    };
}

// 📌 Función de subida de archivo (usa /api/upload y el token)
async function uploadFileFn(file, user) {
    const headers = await getAuthHeader(user);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        headers: headers, // Ya incluye el token. El 'Content-Type' se agrega automáticamente con FormData
        body: formData,
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al subir la imagen");
    }

    const { urls } = await res.json();
    return urls[0]; // Retorna la URL pública de Storage
}

/* ------------------ QuickUploader ------------------ */
function QuickUploader({ user }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function onUpload() {
    const f = fileRef.current.files[0];
    if (!f) return alert("Elegí un archivo");
    setUploading(true);
    
    try {
      // 📌 Llamada a la función de subida con el token de usuario
      const url = await uploadFileFn(f, user); 
      if (url) {
        // Muestra la URL para que el admin la copie y la use en los formularios de mascotas/productos
        prompt("✅ Imagen subida a Firebase Storage. Copia la URL para usarla:", url); 
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error subiendo imagen: " + err.message);
    } finally {
        setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Subida Rápida de Imágenes</h4>
      <input ref={fileRef} type="file" accept="image/*" />
      <div className="flex gap-2">
        <button 
            onClick={onUpload} 
            disabled={uploading}
            className="px-3 py-2 bg-[#38629F] text-white rounded-lg hover:bg-[#38629F]/80 disabled:bg-gray-400 text-sm"
        >
          {uploading ? "Subiendo..." : "Subir a Storage"}
        </button>
      </div>
    </div>
  );
}

/* ------------------ Componente Administrador Principal ------------------ */

export default function AdminPanel() {
  // 📌 1. Usa el hook centralizado para obtener el estado y el usuario
  const { currentUser, isAdmin, logout } = useAuth(); 
  
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'pet', 'product'
  const [creating, setCreating] = useState(false);

  /* === PETS HANDLERS === */

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      // GET no necesita token, la API lo permite (ver pets.js)
      const res = await fetch("/api/pets"); 
      if (!res.ok) throw new Error("Error fetching pets");
      const data = await res.json();
      setPets(data);
    } catch (e) {
      console.error(e);
      alert("Error cargando mascotas");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreatePet = async (petData) => {
    if (!currentUser) return alert("Sesión expirada. Inicie sesión nuevamente.");
    setCreating(true);
    try {
      const headers = await getAuthHeader(currentUser);
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });

      if (!res.ok) throw new Error("Error creando mascota");
      setActiveModal(null);
      await fetchPets(); // Recargar la lista
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
        setCreating(false);
    }
  };

  const handleDeletePet = async (id) => {
    if (!currentUser || !window.confirm(`¿Seguro que querés eliminar la mascota ${id}?`)) return;
    try {
      const headers = await getAuthHeader(currentUser);
      const res = await fetch(`/api/pets?id=${id}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!res.ok) throw new Error("Error eliminando mascota");
      await fetchPets();
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  /* === PRODUCTS HANDLERS === */

  const fetchProducts = useCallback(async () => {
    try {
      // GET no necesita token
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error fetching products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
      alert("Error cargando productos");
    }
  }, []);

  const handleCreateProduct = async (productData) => {
    if (!currentUser) return alert("Sesión expirada. Inicie sesión nuevamente.");
    setCreating(true);
    try {
      const headers = await getAuthHeader(currentUser);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Error creando producto");
      setActiveModal(null);
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
        setCreating(false);
    }
  };

  const handleUpdateProductStock = async (id, newStock) => {
    if (!currentUser) return alert("Sesión expirada. Inicie sesión nuevamente.");
    try {
      const headers = await getAuthHeader(currentUser);
      const res = await fetch(`/api/products?id=${id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) throw new Error("Error actualizando stock");
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!currentUser || !window.confirm(`¿Seguro que querés eliminar el producto ${id}?`)) return;
    try {
      const headers = await getAuthHeader(currentUser);
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!res.ok) throw new Error("Error eliminando producto");
      await fetchProducts();
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      // Si ya está logueado, carga los datos
      fetchPets();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Si no es admin (o si el componente está fuera del AdminPanel del PerritosRescatadosApp.jsx)
  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl font-bold text-red-500">Acceso Denegado</h1>
        <p className="mt-4">Solo administradores pueden acceder a esta sección.</p>
        <button onClick={logout} className="mt-4 text-[#38629F] underline">Volver al Login</button>
      </div>
    );
  }

  // Si está cargando por primera vez (o el useEffect está cargando datos)
  if (loading) {
    return <div className="p-10 text-center text-xl text-[#38629F]">Cargando datos del panel...</div>;
  }

  return (
    <div className="p-6 md:p-10 bg-[#eff4fb] min-h-screen">
      <div className="max-w-[1100px] mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#38629F]">Panel de Administración</h1>
          <button 
            onClick={logout} 
            className="px-4 py-2 bg-[#EA4E4E] text-white rounded-full text-sm hover:bg-[#EA4E4E]/80"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* ------------------ Sección 1: Subida de Imágenes ------------------ */}
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <QuickUploader user={currentUser} /> {/* Pasa el currentUser para obtener el token */}
        </section>

        {/* ------------------ Sección 2: Mascotas ------------------ */}
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#38629F]">Mascotas en Adopción ({pets.length})</h2>
            <button 
                onClick={() => setActiveModal('pet')}
                className="px-4 py-2 bg-[#38629F] text-white rounded-lg hover:bg-[#38629F]/80 text-sm disabled:bg-gray-400"
                disabled={creating}
            >
                {creating ? 'Creando...' : '+ Nueva Mascota'}
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Datos de Firestore que aparecen en la sección "Adopciones".
          </p>
          {pets.length === 0 ? (
            <p className="text-slate-500 italic">No hay mascotas en la lista.</p>
          ) : (
            <MascotasTable pets={pets} onDelete={handleDeletePet} />
          )}
        </section>

        {/* ------------------ Sección 3: Tienda ------------------ */}
        <section className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#38629F]">Productos de la Tienda ({products.length})</h2>
            <button 
                onClick={() => setActiveModal('product')}
                className="px-4 py-2 bg-[#38629F] text-white rounded-lg hover:bg-[#38629F]/80 text-sm disabled:bg-gray-400"
                disabled={creating}
            >
                {creating ? 'Creando...' : '+ Nuevo Producto'}
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Datos de Firestore para la sección "Tienda". Stock afecta a las compras de Mercado Pago.
          </p>
          {products.length === 0 ? (
             <p className="text-slate-500 italic">No hay productos en la tienda.</p>
          ) : (
            <ProductsTable 
                products={products} 
                onDelete={handleDeleteProduct} 
                onUpdateStock={handleUpdateProductStock} 
            />
          )}
        </section>
      </div>

      {/* ------------------ Modals ------------------ */}
      {activeModal === 'pet' && (
        <Modal onClose={() => setActiveModal(null)} title="Crear Nueva Mascota">
          <PetForm onSubmit={handleCreatePet} isSubmitting={creating} />
        </Modal>
      )}

      {activeModal === 'product' && (
        <Modal onClose={() => setActiveModal(null)} title="Crear Nuevo Producto">
          <ProductForm onSubmit={handleCreateProduct} isSubmitting={creating} />
        </Modal>
      )}
    </div>
  );
}

/* ------------------ Sub-Componentes (Forms y Tablas) ------------------ */

function Modal({ children, onClose, title }) {
  // Se mantiene igual
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

function PetForm({ onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [photoURL, setPhotoURL] = useState(''); // Usa 'photoURL' para la URL de la imagen principal
  const [link, setLink] = useState(''); // Link para más información

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !desc || !photoURL) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    // 📌 Se asume que tu API de pets acepta 'name', 'desc', 'photoURL' y 'link'.
    onSubmit({ name, desc, photoURL, link, imgs: [photoURL] }); // Usamos photoURL también como primer elemento del array imgs
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-red-500">
        Recordá usar el "Subidor Rápido" para obtener la URL de la imagen (debe ser de Storage).
      </p>
      <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
      <textarea placeholder="Descripción (Edad, carácter, etc.)" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="url" placeholder="URL de la Foto Principal (Firebase Storage)" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="url" placeholder="Link de Facebook/Instagram (Opcional)" value={link} onChange={(e) => setLink(e.target.value)} className="w-full p-2 border rounded" />
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-[#F5793B] text-white rounded-lg hover:bg-[#F5793B]/80 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Guardando...' : 'Crear Mascota'}
      </button>
    </form>
  );
}

function ProductForm({ onSubmit, isSubmitting }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(1);
  const [img, setImg] = useState('');
  const [hasSizes, setHasSizes] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !img) {
      alert("Por favor, completa el nombre, precio e imagen.");
      return;
    }
    // 📌 Se asume que tu API de products acepta estos campos.
    onSubmit({ name, desc, price: Number(price), stock: Number(stock), img, hasSizes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Nombre del Producto" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="url" placeholder="URL de la Imagen (Firebase Storage)" value={img} onChange={(e) => setImg(e.target.value)} className="w-full p-2 border rounded" required />
      <input type="number" placeholder="Precio ($ARS)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded" required min="1" />
      <input type="number" placeholder="Stock Inicial" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded" required min="1" />
      <textarea placeholder="Descripción (Opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 border rounded" />
      
      <div className="flex items-center">
        <input 
            id="hasSizes" 
            type="checkbox" 
            checked={hasSizes} 
            onChange={(e) => setHasSizes(e.target.checked)} 
            className="w-4 h-4 text-[#38629F] border-gray-300 rounded"
        />
        <label htmlFor="hasSizes" className="ml-2 text-sm text-slate-700">El producto tiene talles (S, M, L, XL)</label>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-[#F5793B] text-white rounded-lg hover:bg-[#F5793B]/80 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Guardando...' : 'Crear Producto'}
      </button>
    </form>
  );
}


function MascotasTable({ pets, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pets.map((pet) => (
            <tr key={pet.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pet.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {pet.createdAt ? new Date(pet.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onDelete(pet.id)}
                  className="text-red-600 hover:text-red-900 ml-4"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTable({ products, onDelete, onUpdateStock }) {
  const [editStockId, setEditStockId] = useState(null);
  const [newStock, setNewStock] = useState('');

  const handleEdit = (id, currentStock) => {
    setEditStockId(id);
    setNewStock(currentStock.toString());
  };

  const handleSaveStock = (id) => {
    if (newStock === '' || isNaN(Number(newStock))) {
      alert("Stock inválido.");
      return;
    }
    onUpdateStock(id, Number(newStock));
    setEditStockId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.price}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {editStockId === p.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-16 p-1 border rounded text-sm"
                      min="0"
                    />
                    <button
                      onClick={() => handleSaveStock(p.id)}
                      className="text-green-600 hover:text-green-900 font-semibold"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{p.stock}</span>
                    <button
                      onClick={() => handleEdit(p.id, p.stock)}
                      className="text-[#38629F] hover:text-[#38629F]/70"
                    >
                      (Editar)
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}