// src/components/pages/FaqSwitcher.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Faq from '@/components/pages/Faq';
import FaqXRP from '@/components/pages/FaqXRP';

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

const FaqSwitcher = () => {
  const [brand, setBrand] = useState('default');

  useEffect(() => {
    setBrand(getBrandKey());
  }, []);

  if (brand === 'xrp') {
    return <FaqXRP />;
  }
  
  return <Faq />;
};

export default FaqSwitcher;