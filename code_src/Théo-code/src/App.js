// App.js
import React, { useState } from 'react';
import RealTimePowerValues from './components/RealTimePowerValues';
import IntensiteEnReel from './components/IntensiteEnReel';
import EnergyProductionChart from './components/EnergyProductionChart';
import GraphiqueLuminosite from './components/GraphiqueLuminosite';
import UserPowerTracking from './components/UserPowerTracking';
import TableauEDF from './components/TableauEDF';
import Menu from './Menu';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('RealTimePowerValues');

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  return (
    <div>
      <Menu onSelect={handleComponentSelect} />
      {selectedComponent === 'RealTimePowerValues' && <RealTimePowerValues />}
      {selectedComponent === 'IntensiteEnReel' && <IntensiteEnReel />}
      {selectedComponent === 'EnergyProductionChart' && <EnergyProductionChart />}
      {selectedComponent === 'GraphiqueLuminosite' && <GraphiqueLuminosite />}
      {selectedComponent === 'UserPowerTracking' && <UserPowerTracking />}
      {selectedComponent === 'TableauEDF' && <TableauEDF />}
    </div>
  );
}

export default App;
