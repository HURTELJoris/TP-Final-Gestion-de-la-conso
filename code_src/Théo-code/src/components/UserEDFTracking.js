// Dossier components/UserEDFTracking.js

import React, { useState, useEffect } from 'react';
import './UserEDFTracking.css'; // Importation des styles CSS

const UserEDFTracking = () => {
  const [powerData, setPowerData] = useState([]);
  const [viewBy, setViewBy] = useState('day'); // État pour suivre la vue actuelle (jour/semaine/mois)

  useEffect(() => {
    // Simuler une requête API pour récupérer les données de puissance
    const fetchPowerData = async () => {
      // Remplacer cette simulation avec une vraie requête API
      let simulatedData = [];
      if (viewBy === 'day') {
        simulatedData = [
          { day: 'Lundi', power: 10 },
          { day: 'Mardi', power: 12 },
          { day: 'Mercredi', power: 11 },
          // Ajoutez les autres jours si nécessaire
        ];
      } else if (viewBy === 'week') {
        simulatedData = [
          { week: 'Semaine 1', power: 100 },
          { week: 'Semaine 2', power: 120 },
          { week: 'Semaine 3', power: 110 },
          // Ajoutez les autres semaines si nécessaire
        ];
      } else if (viewBy === 'month') {
        simulatedData = [
          { month: 'Janvier', power: 1000 },
          { month: 'Février', power: 1200 },
          { month: 'Mars', power: 1100 },
          // Ajoutez les autres mois si nécessaire
        ];
      }
      setPowerData(simulatedData);
    };

    fetchPowerData();
  }, [viewBy]);

  const handleViewByChange = (value) => {
    setViewBy(value);
  };

  return (
    <div className="user-edf-tracking">
      <h2>Suivi de la puissance reçue par le réseau EDF</h2>
      <div className="view-buttons">
        <button onClick={() => handleViewByChange('day')} className={viewBy === 'day' ? 'active' : ''}>Jour</button>
        <button onClick={() => handleViewByChange('week')} className={viewBy === 'week' ? 'active' : ''}>Semaine</button>
        <button onClick={() => handleViewByChange('month')} className={viewBy === 'month' ? 'active' : ''}>Mois</button>
      </div>
      <table className="power-table">
        <thead>
          <tr>
            <th>{viewBy === 'day' ? 'Jour' : (viewBy === 'week' ? 'Semaine' : 'Mois')}</th>
            <th>Puissance (kW)</th>
          </tr>
        </thead>
        <tbody>
          {powerData.map((data, index) => (
            <tr key={index}>
              <td>{data[viewBy]}</td>
              <td>{data.power} kW</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserEDFTracking;
