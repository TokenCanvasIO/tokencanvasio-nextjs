// In GlobalSearchBar.jsx
import React from 'react';
import { useUIStore } from '../store/useUIStore.js';
import { shallow } from 'zustand/shallow';

function GlobalSearchBar() {
  const { searchTerm, setGlobalSearchTerm } = useUIStore(
  (state) => ({
    searchTerm: state.searchTerm,
    setGlobalSearchTerm: state.setGlobalSearchTerm,
  }),
  shallow
);

  return (
    <div className="global-search-bar-container">
      <input
        type="text"
        placeholder="Search anything..."
        className="global-search-input"
        value={searchTerm}
        onChange={(e) => setGlobalSearchTerm(e.target.value)}
        autoFocus
      />
    </div>
  );
}

export default GlobalSearchBar;