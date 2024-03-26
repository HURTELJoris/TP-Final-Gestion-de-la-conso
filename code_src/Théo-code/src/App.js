// App.js
import React from 'react';
import RealTimePowerValues from './components/RealTimePowerValues';
import RealTimeIntensityValues from './components/RealTimeIntensityValues';
import EnergyProductionChart from './components/EnergyProductionChart';
import BrightnessChart from './components/BrightnessChart';
import UserPowerTracking from './components/UserPowerTracking';
import UserEDFTracking from './components/UserEDFTracking';

function App() {
  return (
    <div>
      <RealTimePowerValues />
      <RealTimeIntensityValues />
      <EnergyProductionChart />
      <BrightnessChart />
      <UserPowerTracking />
      <UserEDFTracking />
    </div>
  );
}

export default App;
