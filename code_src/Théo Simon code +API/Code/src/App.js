import React from 'react';
import GraphiqueLuminosite from './components/GraphiqueLuminosite'; 
import PuissanceEnReel from './components/PuissanceEnReel';
import IntensiteEnReel from './components/IntensiteEnReel';
import TableauPanneau from './components/TableauPanneau';
import GraphiqueEnergie from './components/GraphiqueEnergie';
import TableauEDF from './components/TableauEDF';


function App() {
  return (
    <div>
      <GraphiqueLuminosite /> {}
      <PuissanceEnReel /> {}
      <IntensiteEnReel /> {}
      <TableauPanneau /> {}
      <GraphiqueEnergie /> {}
      <TableauEDF /> {}
      
    </div>
  );
}

export default App;
