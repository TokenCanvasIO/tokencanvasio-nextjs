// src/components/pages/AboutSwitcher.jsx
"use client";

import React, { useState, useEffect } from 'react';
import AboutUs from '@/components/pages/AboutUs';
import AboutXRP from '@/components/pages/AboutXRP';

const getBrandKey = () => {
  if (typeof window === 'undefined') {
    return 'default';
  }
  const hostname = window.location.hostname;
  if (hostname.includes('xrpmemecoins.com')) {
    return 'xrp';
  }
  return 'default';
};

const AboutSwitcher = () => {
  // This state will default to 'default' on the server, then update in the browser
  const [brand, setBrand] = useState('default');

  useEffect(() => {
    // This runs only in the browser and sets the correct brand
    setBrand(getBrandKey());
  }, []);

  if (brand === 'xrp') {
    return <AboutXRP />;
  }
  
  return <AboutUs />;
};

export default AboutSwitcher;