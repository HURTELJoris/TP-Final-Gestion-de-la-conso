import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const GraphiqueEnergie = () => {
  const [donneesEnergie, setDonneesEnergie] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchDonneesEnergie = async () => {
      // Simulation des données de production d'énergie
      const donneesSimulees = Array.from({ length: 10 }, () => Math.random() * 100);
      setDonneesEnergie(donneesSimulees);
    };

    fetchDonneesEnergie();
    const intervalId = setInterval(fetchDonneesEnergie, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (donneesEnergie.length > 0) {
      if (!chartRef.current) {
        const ctx = document.getElementById('graphiqueEnergie');
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: Array.from({ length: donneesEnergie.length }, (_, i) => i + 1),
            datasets: [{
              label: 'Production d’énergie',
              data: donneesEnergie,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value + ' kWh'; // Ajout de l'unité "kWh" sur les ticks de l'axe y
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    return tooltipItem.raw + ' kWh'; // Ajout de l'unité "kWh" dans les infobulles
                  }
                }
              }
            }
          }
        });
      } else {
        chartRef.current.data.datasets[0].data = donneesEnergie;
        chartRef.current.update();
      }
    }
  }, [donneesEnergie]);

  return (
    <div>
      <h2>Graphique de production d’énergie en temps réel</h2>
      <canvas id="graphiqueEnergie" width="400" height="200"></canvas>
    </div>
  );
};

export default GraphiqueEnergie;
