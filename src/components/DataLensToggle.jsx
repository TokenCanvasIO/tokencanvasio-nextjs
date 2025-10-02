import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { FaSearch, FaClock, FaListAlt } from 'react-icons/fa';

const DataLensToggle = () => {
  // Get the current mode and the action to set it from the UI store
  const { dataLensMode, setDataLensMode } = useUIStore(state => ({
    dataLensMode: state.dataLensMode,
    setDataLensMode: state.setDataLensMode,
  }));

  // Define the segments for the toggle
  const lensOptions = [
    { mode: 'timeframe', icon: FaClock, label: 'Timeframe' },
    { mode: 'advanced', icon: FaListAlt, label: 'Data' }, // "advanced" corresponds to "Data"
  ];

  return (
    <div className="data-lens-toggle">
      {lensOptions.map((option) => (
        <button
          key={option.mode}
          className={`data-lens-btn ${dataLensMode === option.mode ? 'active' : ''}`}
          onClick={() => setDataLensMode(option.mode)}
          title={option.label}
          aria-label={`Switch to ${option.label} view`}
        >
          <option.icon />
        </button>
      ))}
    </div>
  );
};

export default DataLensToggle;
