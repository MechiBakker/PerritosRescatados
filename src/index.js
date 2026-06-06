import React from 'react';
import ReactDOM from 'react-dom/client';
// Asumo que tu componente principal se llama 'App' y está en './App.js'
import App from './components/App'; 

// Obtenemos el contenedor raíz del DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizamos la aplicación dentro del contenedor raíz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Nota: Este archivo necesita que también exista 'src/App.js' y 'public/index.html'.
// Ya superaste los errores de esos archivos, por lo que deberían estar correctos.
