import React from "react";
import { useEstadisticas } from "../lib/useSupabaseData";

/**
 * SeccionEstadisticas — componente público que muestra los totales
 * de rescates y adopciones. Se puede agregar en cualquier sección del sitio.
 *
 * Uso en PerritosRescatadosApp.jsx:
 *   import SeccionEstadisticas from "./components/SeccionEstadisticas";
 *   // dentro de <main>:
 *   <SeccionEstadisticas />
 */
export default function SeccionEstadisticas() {
  const { totalRescates, totalAdopciones, estadisticas, loading } =
    useEstadisticas();

  // Mes más reciente con datos
  const ultimo = estadisticas[estadisticas.length - 1];

  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  if (loading) return null; // no muestra nada mientras carga

  return (
    <section id="estadisticas" className="py-16 bg-[#eff4fb]">
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#38629F] mb-2">
          Nuestro impacto 🐾
        </h2>
        <p className="text-slate-500 text-sm mb-10">
          Cada número es una historia real de amor y segunda oportunidad.
        </p>

        {/* Totales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-1">
            <span className="text-4xl font-bold text-[#38629F]">
              {totalRescates}
            </span>
            <span className="text-slate-500 text-sm">rescates totales</span>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-1">
            <span className="text-4xl font-bold text-[#F5793B]">
              {totalAdopciones}
            </span>
            <span className="text-slate-500 text-sm">adopciones totales</span>
          </div>
          {ultimo && (
            <>
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-1">
                <span className="text-4xl font-bold text-[#38629F]">
                  {ultimo.rescates}
                </span>
                <span className="text-slate-500 text-sm capitalize">
                  rescates en {MESES[ultimo.mes - 1]}
                </span>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-1">
                <span className="text-4xl font-bold text-[#F5793B]">
                  {ultimo.adopciones}
                </span>
                <span className="text-slate-500 text-sm capitalize">
                  adopciones en {MESES[ultimo.mes - 1]}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Tabla historial (últimos 6 meses) */}
        {estadisticas.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden max-w-lg mx-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#38629F] text-white">
                  <th className="py-3 px-4 text-left font-medium">Mes</th>
                  <th className="py-3 px-4 text-center font-medium">🐕 Rescates</th>
                  <th className="py-3 px-4 text-center font-medium">🏡 Adopciones</th>
                </tr>
              </thead>
              <tbody>
                {[...estadisticas]
                  .reverse()
                  .slice(0, 6)
                  .map((s, i) => (
                    <tr
                      key={s.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#F7E9DC]/40"}
                    >
                      <td className="py-3 px-4 text-slate-700 capitalize font-medium">
                        {MESES[s.mes - 1]} {s.anio}
                      </td>
                      <td className="py-3 px-4 text-center text-[#38629F] font-semibold">
                        {s.rescates}
                      </td>
                      <td className="py-3 px-4 text-center text-[#F5793B] font-semibold">
                        {s.adopciones}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
