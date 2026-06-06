import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * useMascotas — devuelve las mascotas disponibles para mostrar en el sitio público.
 * Filtra solo las que tienen estado = 'disponible' por defecto.
 * @param {boolean} soloDisponibles - si true, filtra solo disponibles
 */
export function useMascotas(soloDisponibles = true) {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from("mascotas")
      .select("*")
      .order("created_at", { ascending: false });

    if (soloDisponibles) query = query.eq("estado", "disponible");

    query.then(({ data }) => {
      setMascotas(data || []);
      setLoading(false);
    });
  }, [soloDisponibles]);

  return { mascotas, loading };
}

/**
 * useProductos — devuelve los productos disponibles en tienda.
 */
export function useProductos(soloDisponibles = true) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });

    if (soloDisponibles) query = query.eq("disponible", true);

    query.then(({ data }) => {
      setProductos(data || []);
      setLoading(false);
    });
  }, [soloDisponibles]);

  return { productos, loading };
}

/**
 * useEstadisticas — devuelve todas las estadísticas ordenadas por fecha.
 * También calcula totales globales.
 */
export function useEstadisticas() {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("estadisticas")
      .select("*")
      .order("anio", { ascending: true })
      .order("mes", { ascending: true })
      .then(({ data }) => {
        setEstadisticas(data || []);
        setLoading(false);
      });
  }, []);

  const totalRescates = estadisticas.reduce((a, s) => a + (s.rescates || 0), 0);
  const totalAdopciones = estadisticas.reduce((a, s) => a + (s.adopciones || 0), 0);

  return { estadisticas, totalRescates, totalAdopciones, loading };
}
