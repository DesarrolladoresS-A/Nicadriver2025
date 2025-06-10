import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';

const GraficoEstadoReporte = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={data}
        dataKey="cantidad"
        nameKey="nombre"
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#82ca9d"
        label
      />
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export default GraficoEstadoReporte;
