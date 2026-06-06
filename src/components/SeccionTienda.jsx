import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CMS_URL, API_URL } from "../config";

const SeccionTienda = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Obtenemos solo productos con stock > 0
        const response = await axios.get(`${CMS_URL}/productos?filters[stock][$gt]=0&populate=fotos`);
        
        const dataFormateada = response.data.data.map(item => ({
            id: item.id,
            nombre: item.attributes.nombre,
            precio: item.attributes.precio,
            descripcion: item.attributes.descripcion,
            talle_o_tamaño: item.attributes.talle_o_tamaño,
            stock: item.attributes.stock,
            url_foto: item.attributes.fotos.data[0] ? `${CMS_URL}${item.attributes.fotos.data[0].attributes.url}` : '/img/placeholder.jpg',
        }));

        setProductos(dataFormateada);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
      }
    };

    fetchProductos();
  }, []);

  // Función que llama a tu API Express para crear la preferencia de pago
  const handleCheckout = async (producto) => {
    try {
      const items = [{
        title: producto.nombre,
        unit_price: producto.precio,
        quantity: 1,
      }];

      const response = await axios.post(`${API_URL}/api/checkout`, { items });

      // Redirige al usuario al enlace de pago de Mercado Pago
      window.location.href = response.data.init_point;

    } catch (error) {
      alert("Hubo un error al procesar el pago. Intenta más tarde.");
      console.error("Error en el checkout:", error);
    }
  };

  return (
    <div className="contenedor-tienda-existente">
      <h2>Nuestra Tienda</h2>
      {productos.map(producto => (
        <div key={producto.id} className="tarjeta-producto-existente">
          <img src={producto.url_foto} alt={producto.nombre} />
          <h3>{producto.nombre}</h3>
          <p>{producto.descripcion}</p>
          <p>Precio: ${producto.precio}</p>
          <p>Talle/Tamaño: {producto.talle_o_tamaño}</p>
          {/* El botón llama a la función de Mercado Pago */}
          <button 
            className="boton-existente-tailwind"
            onClick={() => handleCheckout(producto)}
          >
            Comprar (Mercado Pago)
          </button>
        </div>
      ))}
    </div>
  );
};

export default SeccionTienda;