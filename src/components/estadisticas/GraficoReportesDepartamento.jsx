import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEPARTAMENTOS = [
  'Boaco','Carazo','Chinandega','Chontales','Estelí','Granada','Jinotega','León','Madriz','Managua','Masaya','Matagalpa','Nueva Segovia','Rivas','Río San Juan','RAAN','RAAS','Costa Caribe Norte','Costa Caribe Sur'
];

const getCacheKey = (lat, lng) => `geo_dep_${lat.toFixed(4)}_${lng.toFixed(4)}`;

const resolveDepartamento = async (lat, lng, apiKey) => {
  try {
    const cacheKey = getCacheKey(lat, lng);
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    if (!apiKey) return 'Sin identificar';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;
    const res = await fetch(url);
    const json = await res.json();
    const comps = json?.results?.[0]?.address_components || [];
    const comp = comps.find(c => c.types.includes('administrative_area_level_1'));
    const nombre = comp?.long_name || 'Sin identificar';
    localStorage.setItem(cacheKey, nombre);
    return nombre;
  } catch {
    return 'Sin identificar';
  }
};

const GraficoReportesDepartamento = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const snap = await getDocs(collection(db, 'incidentes'));
        const conteo = {};
        const tasks = snap.docs.map(async (d) => {
          const { lat, lng } = d.data() || {};
          if (typeof lat === 'number' && typeof lng === 'number') {
            const dep = await resolveDepartamento(lat, lng, apiKey);
            conteo[dep] = (conteo[dep] || 0) + 1;
          }
        });
        await Promise.all(tasks);
        const arr = Object.entries(conteo).map(([departamento, cantidad]) => ({ departamento, cantidad }));
        arr.sort((a,b) => b.cantidad - a.cantidad);
        setData(arr.slice(0, 10));
      } catch {}
    };
    load();
  }, []);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <h6 className="mb-2 text-center">Reportes por dep.</h6>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data} margin={{ top: 0, left: 6, right: 6, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="departamento" interval={0} height={10} tick={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
          <Tooltip formatter={(value) => [value, 'Cantidad']} labelFormatter={(label) => `Departamento: ${label}`} />
          <Bar dataKey="cantidad" fill="#1e3d87" barSize={16} radius={[4,4,0,0]} isAnimationActive animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoReportesDepartamento;
