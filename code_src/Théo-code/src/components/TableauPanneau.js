// TableauPanneau.js
import React, { useState, useEffect } from 'react';
import './TableauPanneau.css';

const TableauPanneau = () => {
  const [puissanceRecue, setPuissanceRecue] = useState(0);
  const [historique, setHistorique] = useState([]);
  const [afficherHistorique, setAfficherHistorique] = useState(false);

  useEffect(() => {
    // Fonction pour mettre à jour la puissance reçue
    const mettreAJourPuissanceRecue = () => {
      // Générer des données simulées de puissance reçue
      const puissanceSimulee = Math.random() * 100 + 50; // Puissance reçue aléatoire entre 50 W et 150 W
      
      // Ajouter la nouvelle puissance reçue à l'historique
      setHistorique(prevHistorique => {
        const nouvelHistorique = [...prevHistorique, {
          date: new Date(),
          valeur: puissanceSimulee.toFixed(2)
        }];
        
        // Conserver uniquement les 10 dernières valeurs dans l'historique
        return nouvelHistorique.slice(-10);
      });
      
      // Mettre à jour l'état de la puissance reçue
      setPuissanceRecue(puissanceSimulee.toFixed(2));
    };

    // Mettre à jour la puissance reçue initialement
    mettreAJourPuissanceRecue();

    // Définir un intervalle pour mettre à jour la puissance reçue toutes les minutes
    const intervalle = setInterval(mettreAJourPuissanceRecue, 5000);

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
    <div className="TableauPanneau-container">
      <h2>Suivi de puissance reçue par les panneaux</h2>
      <table className="TableauPanneau-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Puissance reçue (kWh)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{`${jour} ${mois}`}</td>
            <td>{dateActuelle.toLocaleTimeString()}</td>
            <td>{puissanceRecue}</td>
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
      <button onClick={toggleHistorique}>
        {afficherHistorique ? 'Masquer Historique' : 'Afficher Historique'}
      </button>
    </div>
  );
};

export default TableauPanneau;
