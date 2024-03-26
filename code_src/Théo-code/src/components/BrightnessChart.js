// Dossier components/BrightnessChart.js

import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const BrightnessChart = () => {
  const [brightnessData, setBrightnessData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    // Simuler une requête API pour récupérer les données de luminosité
    const fetchBrightnessData = async () => {
      // Remplacer cette simulation avec une vraie requête API
      const simulatedData = Array.from({ length: 10 }, () => Math.random() * 100);
      setBrightnessData(simulatedData);
    };

    fetchBrightnessData();
    const intervalId = setInterval(fetchBrightnessData, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Créer ou mettre à jour le graphique lorsque les données changent
    if (brightnessData.length > 0) {
      if (chartRef.current) {
        chartRef.current.destroy(); // Détruire le graphique précédent
      }
      const ctx = document.getElementById('brightnessChart');
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: brightnessData.length }, (_, i) => i + 1),
          datasets: [{
            label: 'Luminosité',
            data: brightnessData,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [brightnessData]);

  return (
    <div>
      <h2>Graphique de luminosité en temps réel</h2>
      <canvas id="brightnessChart" width="400" height="200"></canvas>
    </div>
  );
};

export default BrightnessChart;
