import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatDate = (d) => {
  try {
    if (d?.toDate) return d.toDate();
    if (typeof d === 'number') return new Date(d);
    if (typeof d === 'string') return new Date(d);
    return new Date();
  } catch { return new Date(); }
};

const GraficoReportesTendencia = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'reportes'));
        const conteo = {};
        snap.forEach((docu) => {
          const { fechaHora, fechaRegistro } = docu.data() || {};
          const d = formatDate(fechaHora || fechaRegistro);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const h = String(d.getHours()).padStart(2, '0');
          const key = `${y}-${m}-${day} ${h}:00`;
          conteo[key] = (conteo[key] || 0) + 1;
        });
        const arr = Object.entries(conteo)
          .sort((a,b) => a[0].localeCompare(b[0]))
          .map(([hora, cantidad]) => ({ hora, cantidad }));
        setData(arr);
      } catch (e) {}
    };
    load();
  }, []);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <h6 className="mb-2 text-center">Reportes por hora</h6>
      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={data} margin={{ top: 0, left: 6, right: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e3d87" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#1e3d87" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval={0} height={10} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
          <Tooltip />
          <Area type="monotone" dataKey="cantidad" stroke="#1e3d87" fillOpacity={1} fill="url(#colorA)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoReportesTendencia;
