import React, { useState, useEffect } from 'react';
import axios from 'axios';



const ContadorEstadisticas = () => {
  const [stats, setStats] = useState({
    rescatados_mes: 0,
    adopciones_mes: 0,
    adopciones_historica: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Error al cargar las estadísticas:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="seccion-stats-existente">
      <div className="contador">
        {/* Asegúrate de que los IDs/clases coincidan con tu diseño original */}
        <h3>{stats.rescatados_mes}</h3>
        <p>Rescatados del Mes</p>
      </div>
      <div className="contador">
        <h3>{stats.adopciones_mes}</h3>
        <p>Adopciones del Mes</p>
      </div>
      <div className="contador">
        <h3>{stats.adopciones_historica}</h3>
        <p>Adopciones Históricas</p>
      </div>
    </div>
  );
};

export default ContadorEstadisticas;