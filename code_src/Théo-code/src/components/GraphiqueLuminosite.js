import React, { useState, useEffect, useRef } from 'react';
import Graphique from 'chart.js/auto';

const GraphiqueLuminosite = () => {
  const [donneesLuminosite, setDonneesLuminosite] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchDonneesLuminosite = async () => {
      const donneesSimulees = Array.from({ length: 10 }, () => Math.random() * 100);
      setDonneesLuminosite(donneesSimulees);
    };

    fetchDonneesLuminosite();
    const intervalId = setInterval(fetchDonneesLuminosite, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (donneesLuminosite.length > 0) {
      if (!chartRef.current) {
        const ctx = document.getElementById('graphiqueLuminosite');
        chartRef.current = new Graphique(ctx, {
          type: 'line',
          data: {
            labels: Array.from({ length: donneesLuminosite.length }, (_, i) => i + 1),
            datasets: [{
              label: 'Luminosité',
              data: donneesLuminosite,
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
      } else {
        chartRef.current.data.datasets[0].data = donneesLuminosite;
        chartRef.current.update();
      }
    }
  }, [donneesLuminosite]);

  return (
    <div>
      <h2>Graphique de luminosité en temps réel</h2>
      <canvas id="graphiqueLuminosite" width="400" height="200"></canvas>
    </div>
  );
};

export default GraphiqueLuminosite;
