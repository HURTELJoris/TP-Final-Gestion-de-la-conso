// TableauEDF.js
import React, { useState, useEffect } from 'react';
import './TableauEDF.css';

const TableauEDF = () => {
  const [consommationEnergie, setConsommationEnergie] = useState(0);
  const [historique, setHistorique] = useState([]);
  const [afficherHistorique, setAfficherHistorique] = useState(false);

  useEffect(() => {
    // Fonction pour mettre à jour la consommation d'énergie
    const mettreAJourConsommationEnergie = () => {
      // Générer des données simulées de consommation d'énergie
      const energieSimulee = Math.random() * 100 + 50; // Consommation d'énergie aléatoire entre 50 kWh et 150 kWh
      
      // Ajouter la nouvelle consommation d'énergie à l'historique
      setHistorique(prevHistorique => {
        const nouvelHistorique = [...prevHistorique, {
          date: new Date(),
          valeur: energieSimulee.toFixed(2)
        }];
        
        // Conserver uniquement les 10 dernières valeurs dans l'historique
        return nouvelHistorique.slice(-10);
      });
      
      // Mettre à jour l'état de la consommation d'énergie
      setConsommationEnergie(energieSimulee.toFixed(2));
    };

    // Mettre à jour la consommation d'énergie initialement
    mettreAJourConsommationEnergie();

    // Définir un intervalle pour mettre à jour la consommation d'énergie toutes les minutes
    const intervalle = setInterval(mettreAJourConsommationEnergie, 6000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalle);
  }, []); // Exécuté uniquement lors du montage initial

  const dateActuelle = new Date();
  const jour = dateActuelle.getDate();
  const mois = dateActuelle.toLocaleString('default', { month: 'long' });

  const toggleHistorique = () => {
    setAfficherHistorique(!afficherHistorique);
  };

  return (
    <div className="TableauEDF-container">
      <h2>Consommation d'énergie EDF</h2>
      <table className="TableauEDF-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Consommation d'énergie (kWh)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{`${jour} ${mois}`}</td>
            <td>{dateActuelle.toLocaleTimeString()}</td>
            <td>{consommationEnergie}</td>
          </tr>
          {afficherHistorique && historique.map((item, index) => (
            <tr key={index}>
              <td>{item.date.toLocaleDateString()}</td>
              <td>{item.date.toLocaleTimeString()}</td>
              <td>{item.valeur}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={toggleHistorique}>Historique</button>
    </div>
  );
};

export default TableauEDF;
