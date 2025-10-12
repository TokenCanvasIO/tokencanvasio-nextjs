import React from 'react';
import { useUIStore } from '../store/useUIStore.js';
import { useSearchStore } from '../store/useSearchStore.js';
import { shallow } from 'zustand/shallow';

function GlobalSearchBar() {
  // This is our test to prove the file has updated.
  console.log('--- RUNNING LATEST GlobalSearchBar.jsx ---');

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