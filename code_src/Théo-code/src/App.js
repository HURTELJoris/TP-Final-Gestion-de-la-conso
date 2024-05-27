
import React, { useState } from 'react';
import PuissanceEnReel from './components/PuissanceEnReel';
import IntensiteEnReel from './components/IntensiteEnReel';
import GraphiqueEnergie from './components/GraphiqueEnergie';
import GraphiqueLuminosite from './components/GraphiqueLuminosite';
import TableauPanneau from './components/TableauPanneau';
import TableauEDF from './components/TableauEDF';
import Menu from './Menu';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('PuissanceEnReel');

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  return (
    <div>
      <Menu onSelect={handleComponentSelect} />
      {selectedComponent === 'PuissanceEnReel' && <PuissanceEnReel />}
      {selectedComponent === 'IntensiteEnReel' && <IntensiteEnReel />}
      {selectedComponent === 'GraphiqueEnergie' && <GraphiqueEnergie/>}
      {selectedComponent === 'GraphiqueLuminosite' && <GraphiqueLuminosite />}
      {selectedComponent === 'TableauPanneau' && <TableauPanneau />}
      {selectedComponent === 'TableauEDF' && <TableauEDF />}
    </div>
  );
}

export default App;
/*
import React from 'react';
import RealTimePowerValues from './components/RealTimePowerValues';
import IntensiteEnReel from './components/IntensiteEnReel';
import EnergyProductionChart from './components/EnergyProductionChart';
import GraphiqueLuminosite from './components/GraphiqueLuminosite';
import UserPowerTracking from './components/UserPowerTracking';
import TableauEDF from './components/TableauEDF'; 

function App() {
  return (
    <div>
      <RealTimePowerValues />
      <IntensiteEnReel/>
      <EnergyProductionChart />
      <GraphiqueLuminosite /> 
      <UserPowerTracking />
      <TableauEDF /> 
    </div>
  );
}

export default App;

*/