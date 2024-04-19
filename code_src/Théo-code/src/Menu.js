// Menu.js
import React, { useState } from 'react';
import './Menu.css'; // Import du fichier CSS

const Menu = ({ onSelect }) => {
  const options = ['RealTimePowerValues', 'IntensiteEnReel', 'EnergyProductionChart', 'GraphiqueLuminosite', 'UserPowerTracking', 'TableauEDF'];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onSelect(option);
  };

  return (
    <div className="menu"> {/* Ajout de la classe CSS 'menu' */}
      <h2>Menu</h2>
      <ul>
        {options.map((option, index) => (
          <li key={index} onClick={() => handleSelect(option)} className={selectedOption === option ? 'selected' : ''}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menu;
