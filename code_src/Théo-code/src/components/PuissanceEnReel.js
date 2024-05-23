import React, { useState, useEffect } from 'react';
import './PuissanceEnReel.css'; // Assurez-vous que le chemin est correct

function PuissanceEnReel() {
  const [power, setPower] = useState(0);
  const [unit, setUnit] = useState('W');

  const updatePower = () => {
    const newPower = Math.random() * 100; // Modifier la plage pour la puissance
    setPower(newPower.toFixed(2));
  };

  useEffect(() => {
    const interval = setInterval(updatePower, 5000); // Mettre à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const changeUnit = (newUnit) => {
    setUnit(newUnit);
  };

  let displayPower;
  switch (unit) {
    case 'W':
      displayPower = power + ' W';
      break;
    case 'kW':
      displayPower = (power / 1000).toFixed(2) + ' kW';
      break;
    case 'MW':
      displayPower = (power / 1000000).toFixed(2) + ' MW';
      break;
    default:
      displayPower = power + ' W';
  }

  return (
    <div className="puissance-container">
      <h2>Afficher les valeurs de puissance des panneaux photovoltaïques</h2>
      <p>Puissance en temps réel : {displayPower}</p>
      <p>Unité :
        <button onClick={() => changeUnit('W')}>W</button>
        <button onClick={() => changeUnit('kW')}>kW</button>
        <button onClick={() => changeUnit('MW')}>MW</button>
      </p>
    </div>
  );
}

export default PuissanceEnReel;
