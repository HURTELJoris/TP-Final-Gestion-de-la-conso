import React, { useState, useEffect } from 'react';
import './IntensiteEnReel.css'; // Assurez-vous que le chemin est correct

function IntensiteEnReel() {
  const [intensity, setIntensity] = useState(0);
  const [unit, setUnit] = useState('A');

  const updateIntensity = () => {
    const newIntensity = Math.random() * 10;
    setIntensity(newIntensity.toFixed(2));
  };

  useEffect(() => {
    const interval = setInterval(updateIntensity, 5000);
    return () => clearInterval(interval);
  }, []);

  const changeUnit = (newUnit) => {
    setUnit(newUnit);
  };

  return (
    <div className="intensite-container">
      <h2>Afficher les valeurs de l'intensité des panneaux photovoltaïques</h2>
      <p>Intensité en temps réel : {intensity} {unit}</p>
      <p>Unité :
        <button onClick={() => changeUnit('A')}>A</button>
        <button onClick={() => changeUnit('mA')}>mA</button>
        <button onClick={() => changeUnit('µA')}>µA</button>
      </p>
    </div>
  );
}

export default IntensiteEnReel;
