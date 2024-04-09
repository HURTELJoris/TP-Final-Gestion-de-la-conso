import React, { useState, useEffect, useRef } from 'react';
import Graphique from 'chart.js/auto';
import axios from 'axios';

const GraphiqueLuminosite = () => {
  const [donneesLuminosite, setDonneesLuminosite] = useState([]);
  const refGraphique = useRef(null);

  useEffect(() => {
    const obtenirDonneesLuminosite = async () => {
      try {
        const response = await axios.get('http://192.168.65.185:8080/select');
        setDonneesLuminosite(response.data.map(entry => entry.luminosité));
      } catch (error) {
        console.error('Erreur lors de la récupération des données de luminosité : ', error);
      }
    };

    obtenirDonneesLuminosite();
    const intervalId = setInterval(obtenirDonneesLuminosite, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (donneesLuminosite.length > 0) {
      if (!refGraphique.current) {
        const ctx = document.getElementById('graphiqueLuminosite');
        refGraphique.current = new Graphique(ctx, {
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
        refGraphique.current.data.labels = Array.from({ length: donneesLuminosite.length }, (_, i) => i + 1);
        refGraphique.current.data.datasets[0].data = donneesLuminosite;
        refGraphique.current.update();
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
