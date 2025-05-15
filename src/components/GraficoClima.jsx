import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const GraficosClima = () => {
  const datosBarra = {
    labels: ["Lluvia", "Temperatura extrema", "Humedad alta", "Vientos fuertes"],
    datasets: [
      {
        label: "Daños reportados por condición climática",
        data: [20, 35, 15, 30],
        backgroundColor: ["#3498db", "#e74c3c", "#f1c40f", "#2ecc71"],
      },
    ],
  };

  const datosCircular = {
    labels: ["Baches", "Inundaciones", "Derrumbes", "Fallas eléctricas"],
    datasets: [
      {
        label: "Tipos de daños",
        data: [40, 25, 20, 15],
        backgroundColor: ["#9b59b6", "#1abc9c", "#f39c12", "#e67e22"],
      },
    ],
  };

  return (
    <div className="graficos-container" style={{ marginTop: "30px" }}>
      <h2>Impacto del Clima en la Infraestructura Vial</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        <div style={{ width: "300px" }}>
          <Bar data={datosBarra} />
        </div>
        <div style={{ width: "300px" }}>
          <Pie data={datosCircular} />
        </div>
      </div>
    </div>
  );
};

export default GraficosClima;