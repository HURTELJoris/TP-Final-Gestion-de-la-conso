import React from 'react';
import RealTimePowerValues from './components/RealTimePowerValues';
import RealTimeIntensityValues from './components/RealTimeIntensityValues';
import EnergyProductionChart from './components/EnergyProductionChart';
import GraphiqueLuminosite from './components/GraphiqueLuminosite'; // Import du composant GraphiqueLuminosite
import UserPowerTracking from './components/UserPowerTracking';
import UserEDFTracking from './components/UserEDFTracking';

function App() {
  return (
    <div>
      <RealTimePowerValues />
      <RealTimeIntensityValues />
      <EnergyProductionChart />
      <GraphiqueLuminosite /> 
      <UserPowerTracking />
      <UserEDFTracking />
    </div>
  );
}

export default App;
