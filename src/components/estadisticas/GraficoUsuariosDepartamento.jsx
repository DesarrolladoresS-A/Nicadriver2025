import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEPARTAMENTOS = [
  'Boaco','Carazo','Chinandega','Chontales','Estelí','Granada','Jinotega','León','Madriz','Managua','Masaya','Matagalpa','Nueva Segovia','Rivas','Río San Juan','RAAN','RAAS','Costa Caribe Norte','Costa Caribe Sur'
];

const normaliza = (s='') => s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();

const detectarDepartamento = (texto='') => {
  const t = normaliza(texto);
  for (const dep of DEPARTAMENTOS) {
    const d = normaliza(dep);
    if (t.includes(d)) return dep;
  }
  return 'Sin identificar';
};

const GraficoUsuariosDepartamento = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const conteo = Object.fromEntries([...DEPARTAMENTOS, 'Sin identificar'].map(d => [d, 0]));
        snap.forEach(docu => {
          const { direccion = '' } = docu.data() || {};
          const dep = detectarDepartamento(direccion);
          conteo[dep] = (conteo[dep] || 0) + 1;
        });
        const arr = Object.entries(conteo).map(([departamento, cantidad]) => ({ departamento, cantidad }));
        arr.sort((a,b) => b.cantidad - a.cantidad);
        setData(arr.slice(0, 10));
      } catch (e) {}
    };
    load();
  }, []);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <h6 className="mb-2 text-center">Usuarios por dep.</h6>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data} margin={{ top: 0, left: 6, right: 6, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="departamento" interval={0} height={10} tick={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
          <Tooltip formatter={(value) => [value, 'Usuarios']} labelFormatter={(label) => `Departamento: ${label}`} />
          <Bar dataKey="cantidad" fill="#10b981" barSize={16} radius={[4,4,0,0]} isAnimationActive animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoUsuariosDepartamento;
