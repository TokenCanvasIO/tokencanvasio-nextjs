import React from 'react';
import { useUIStore } from '../store/useUIStore.js';
import { useSearchStore } from '../store/useSearchStore.js';
import { shallow } from 'zustand/shallow';

// --- THE FIX ---
// The path is now corrected to go up one level ('../')
// and the filename is assumed to be the matching one.
import '../styles/GlobalSearchBar.css';

function GlobalSearchBar() {
  const { searchTerm, setSearchTerm } = useSearchStore(
    (state) => ({
      searchTerm: state.searchTerm,
      setSearchTerm: state.setSearchTerm,
    }),
    shallow
  );

  const { openSearch } = useUIStore();

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length > 0) {
      openSearch();
    }
  };

  return (
    <div className="global-search-bar-container">
      <input
        type="text"
        placeholder="Search anything..."
        className="global-search-input"
        value={searchTerm}
        onChange={handleSearchChange}
        autoFocus
      />
    </div>
  );
}

export default GlobalSearchBar;