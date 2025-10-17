import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraficoBachesPie = () => {
  const [data, setData] = useState([
    { nombre: 'Baches', cantidad: 0 },
    { nombre: 'Otros', cantidad: 0 },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'reportes'));
        let baches = 0;
        let otros = 0;
        snap.forEach((d) => {
          const { titulo = '' } = d.data() || {};
          const t = String(titulo).toLowerCase();
          if (t.includes('bache') || t.includes('baches')) baches++;
          else otros++;
        });
        setData([
          { nombre: 'Baches', cantidad: baches },
          { nombre: 'Otros', cantidad: otros },
        ]);
      } catch (e) {
        // Silencioso
      }
    };
    load();
  }, []);

  const colors = ['#ff6b6b', '#4dabf7'];

  return (
    <div style={{ width: '100%', height: 250 }}>
      <h6 className="mb-2 text-center">Baches vs Otros</h6>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="nombre"
            cx="50%"
            cy="50%"
            outerRadius="75%"
            label={false}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoBachesPie;
