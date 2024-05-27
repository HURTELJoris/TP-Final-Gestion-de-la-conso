import React, { useState, useEffect } from 'react';
import './TableauPanneau.css';

const TableauPanneau = () => {
  const [puissanceRecue, setPuissanceRecue] = useState(0);
  const [historique, setHistorique] = useState([]);
  const [afficherHistorique, setAfficherHistorique] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPuissanceData = async () => {
    try {
      const response = await fetch('http://192.168.65.12:8060/selectPui'); // Assurez-vous que l'endpoint est correct
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      const dernierRecord = data[data.length - 1]; // Supposons que le dernier enregistrement contient la dernière puissance reçue

      setHistorique(prevHistorique => {
        const nouvelHistorique = [
          ...prevHistorique,
          {
            date: new Date(),
            valeur: dernierRecord.puissance.toFixed(2)
          }
        ];
        
        // Conserver uniquement les 10 dernières valeurs dans l'historique
        return nouvelHistorique.slice(-10);
      });

      setPuissanceRecue(dernierRecord.puissance.toFixed(2));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuissanceData();
    const intervalle = setInterval(fetchPuissanceData, 5000);
    return () => clearInterval(intervalle);
  }, []);

  const dateActuelle = new Date();
  const jour = dateActuelle.getDate();
  const mois = dateActuelle.toLocaleString('default', { month: 'long' });

  const toggleHistorique = () => {
    setAfficherHistorique(!afficherHistorique);
  };

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

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
