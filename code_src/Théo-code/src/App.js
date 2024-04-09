import React from 'react';
import RealTimePowerValues from './components/RealTimePowerValues';
import IntensiteEnReel from './components/IntensiteEnReel';
import EnergyProductionChart from './components/EnergyProductionChart';
import GraphiqueLuminosite from './components/GraphiqueLuminosite';
import UserPowerTracking from './components/UserPowerTracking';
import UtilisateurEDF from './components/UtilisateurEDF'; 

function App() {
  return (
    <div>
      <RealTimePowerValues />
      <IntensiteEnReel/>
      <EnergyProductionChart />
      <GraphiqueLuminosite /> 
      <UserPowerTracking />
      <UtilisateurEDF /> 
    </div>
  );
}

export default App;
