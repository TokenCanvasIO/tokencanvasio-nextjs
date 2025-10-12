"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // 1. Import usePathname
import { getBrandConfig_Client, brands } from '@/brandConfig';

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  const [brandConfig, setBrandConfig] = useState(brands.default);
  const pathname = usePathname(); // 2. Get the current URL path

  useEffect(() => {
    const clientBrand = getBrandConfig_Client();
    setBrandConfig(clientBrand);
    
    document.body.className = '';
    document.body.classList.add(clientBrand.className);

  }, [pathname]); // 3. Add pathname to the dependency array

  return (
    <BrandContext.Provider value={brandConfig}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  return useContext(BrandContext);
};