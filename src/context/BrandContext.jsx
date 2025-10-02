// src/context/BrandContext.jsx
"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { getBrandConfig_Client } from '@/brandConfig';

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  const brandConfig = getBrandConfig_Client();

  // This useEffect will run in the browser and apply the theme class
  useEffect(() => {
    // Clear any existing theme classes
    document.body.className = '';
    // Add the correct brand theme class
    document.body.classList.add(brandConfig.className);
  }, [brandConfig.className]);

  return (
    <BrandContext.Provider value={brandConfig}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  return useContext(BrandContext);
};