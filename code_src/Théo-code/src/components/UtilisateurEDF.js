import React, { useState, useEffect } from 'react';
import './UtilisateurEDF.css'; // Importation des styles CSS

const UtilisateurEDF = () => {
  const [donneesPuissance, setDonneesPuissance] = useState([]);
  const [vuePar, setVuePar] = useState('jour'); // État pour suivre la vue actuelle (jour/semaine/mois)

  useEffect(() => {
    // Simuler une requête API pour récupérer les données de puissance
    const fetchDonneesPuissance = async () => {
      // Remplacer cette simulation avec une vraie requête API
      let donneesSimulees = [];
      if (vuePar === 'jour') {
        donneesSimulees = [
          { jour: 'Lundi', puissance: 10 },
          { jour: 'Mardi', puissance: 12 },
          { jour: 'Mercredi', puissance: 11 },
          // Ajoutez les autres jours si nécessaire
        ];
      } else if (vuePar === 'semaine') {
        donneesSimulees = [
          { semaine: 'Semaine 1', puissance: 100 },
          { semaine: 'Semaine 2', puissance: 120 },
          { semaine: 'Semaine 3', puissance: 110 },
          // Ajoutez les autres semaines si nécessaire
        ];
      } else if (vuePar === 'mois') {
        donneesSimulees = [
          { mois: 'Janvier', puissance: 1000 },
          { mois: 'Février', puissance: 1200 },
          { mois: 'Mars', puissance: 1100 },
          // Ajoutez les autres mois si nécessaire
        ];
      }
      setDonneesPuissance(donneesSimulees);
    };

    fetchDonneesPuissance();
  }, [vuePar]);

  const changerVuePar = (valeur) => {
    setVuePar(valeur);
  };

  return (
    <div className="user-edf-tracking"> {/* Utilisation de la classe user-edf-tracking */}
      <h2>Suivi de la puissance reçue par le réseau EDF</h2>
      <div className="boutons-vue">
        <button onClick={() => changerVuePar('jour')} className={vuePar === 'jour' ? 'actif' : ''}>Jour</button>
        <button onClick={() => changerVuePar('semaine')} className={vuePar === 'semaine' ? 'actif' : ''}>Semaine</button>
        <button onClick={() => changerVuePar('mois')} className={vuePar === 'mois' ? 'actif' : ''}>Mois</button>
      </div>
      <table className="power-table"> {/* Utilisation de la classe power-table */}
        <thead>
          <tr>
            <th>{vuePar === 'jour' ? 'Jour' : (vuePar === 'semaine' ? 'Semaine' : 'Mois')}</th>
            <th>Puissance (kW)</th>
          </tr>
        </thead>
        <tbody>
          {donneesPuissance.map((donnees, index) => (
            <tr key={index}>
              <td>{donnees[vuePar]}</td>
              <td>{donnees.puissance} kW</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UtilisateurEDF;
