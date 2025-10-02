// src/hooks/useMediaQuery.js
"use client";

import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  // Initialize state to a default value (e.g., false) on the server.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // This code will only run in the browser, where 'window' is available.
    const mediaQueryList = window.matchMedia(query);
    
    // Function to update state when the media query status changes.
    const listener = (event) => setMatches(event.matches);

    // Set the initial state correctly once we are in the browser.
    setMatches(mediaQueryList.matches);
    
    // Set up the listener for future changes.
    mediaQueryList.addEventListener('change', listener);

    // Clean up the listener when the component is no longer on the screen.
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]); // Re-run this effect if the query string changes.

  return matches;
}

export default useMediaQuery;