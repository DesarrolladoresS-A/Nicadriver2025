import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Puedes definir colores personalizados para cada estado
const coloresEstado = {
  pendiente: "#FF8042",
  en_proceso: "#0088FE",
  resuelto: "#00C49F",
  rechazado: "#FFBB28"
};

const GraficoEstadoReporte = ({ data }) => {
  return (
    <div style={{ width: "100%", height: 300, padding: 20, boxSizing: 'border-box' }}>
      <h3 style={{ textAlign: 'center' }}></h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="cantidad"
            nameKey="nombre"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={coloresEstado[entry.nombre.toLowerCase()] || "#ccc"}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoEstadoReporte;
