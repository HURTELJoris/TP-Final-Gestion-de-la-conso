import React, { useState } from 'react';
import './TableauEDF.css'; // Importation des styles CSS
function SuiviEDF() {
  // Données simulées pour la puissance EDF
  const initialData = [
    { date: '2024-04-01', puissance: 12.5 },
    { date: '2024-04-02', puissance: 11.8 },
    { date: '2024-04-03', puissance: 13.2 },
    { date: '2024-04-04', puissance: 10.7 },
  ];

  // État pour stocker les données
  const [data, setData] = useState(initialData);

  return (
    <div>
      <h2>Suivi de la puissance EDF</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Puissance (kW)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>{entry.puissance.toFixed(1)} kW</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuiviEDF;
