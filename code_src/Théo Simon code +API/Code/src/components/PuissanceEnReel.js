import React, { useState, useEffect } from 'react';
import './PuissanceEnReel.css'; 

function PuissanceEnReel() {
  const generateRandomPower = () => (Math.random() * 100).toFixed(2);

  const [power, setPower] = useState(generateRandomPower());
  const [unit, setUnit] = useState('W');

  const updatePower = () => {
    const newPower = generateRandomPower();
    setPower(newPower);
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
    case 'mW':
      displayPower = (power * 1000).toFixed(2) + ' mW';
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
        <button onClick={() => changeUnit('mW')}>mW</button>
      </p>
    </div>
  );
}

export default PuissanceEnReel;
