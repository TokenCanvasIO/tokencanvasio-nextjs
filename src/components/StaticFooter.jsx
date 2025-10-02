// src/components/StaticFooter.jsx
import React from 'react';

const StaticFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '2rem', 
      color: 'var(--text-secondary)', 
      fontSize: '0.9rem' 
    }}>
      Data provided by CoinGecko & Bithomp. All Rights Reserved by TokenCanvasIO © {currentYear}.
    </footer>
  );
};

export default StaticFooter;