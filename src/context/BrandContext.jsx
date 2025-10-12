"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBrandConfig_Client, brands } from '@/brandConfig'; // Import the full 'brands' object

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  // 1. Use state to hold the brand config. Start with the default brand.
  // This ensures the server and initial client render are identical.
  const [brandConfig, setBrandConfig] = useState(brands.default);

  // 2. This useEffect runs ONLY in the browser, after the initial render.
  useEffect(() => {
    // Determine the correct brand on the client-side using the hostname.
    const clientBrand = getBrandConfig_Client();
    
    // Update the state to the correct brand, triggering a re-render.
    setBrandConfig(clientBrand);
    
    // Apply the correct theme class to the body.
    document.body.className = '';
    document.body.classList.add(clientBrand.className);

  }, []); // The empty dependency array ensures this runs only once.

  return (
    <BrandContext.Provider value={brandConfig}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  return useContext(BrandContext);
};