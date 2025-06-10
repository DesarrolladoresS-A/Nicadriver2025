import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/firebaseconfig';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const colores = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1",
  "#a4de6c", "#d0ed57", "#ffbb28", "#ff8042", "#00C49F"
];

const GraficoTipoReporte = () => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const snapshot = await getDocs(collection(db, "reportes"));
      const conteo = {};

      snapshot.forEach(doc => {
        const { titulo } = doc.data();
        if (titulo) {
          conteo[titulo] = (conteo[titulo] || 0) + 1;
        }
      });

      const datosFormateados = Object.entries(conteo).map(([titulo, cantidad], index) => ({
        tipo: titulo,
        cantidad,
        color: colores[index % colores.length]
      }));

      setDatos(datosFormateados);
    };

    obtenerDatos();
  }, []);

  return (
    <div style={{ width: '100%', height: 400, padding: 20, boxSizing: 'border-box' }}>
  <h3 style={{ textAlign: 'center' }}></h3>
  <ResponsiveContainer width="100%" height="90%">
    <BarChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="tipo" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      {datos.map((entry, index) => (
        <Bar
          key={`bar-${index}`}
          dataKey="cantidad"
          data={[entry]}
          name={entry.tipo}
          fill={entry.color}
          barSize={30}
          xAxisId={0}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
</div>

  );
};

export default GraficoTipoReporte;
