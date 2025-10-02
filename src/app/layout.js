// src/app/layout.js
import React from 'react';
import Header from '@/components/Header';
import StaticFooter from '@/components/StaticFooter';
import { BrandProvider } from '@/context/BrandContext';

// --- THIS IS THE FIX ---
// Corrected the path to globals.css to point to the styles folder.
import '@/styles/globals.css';
// --------------------

import '@/styles/_variables.css';
import '@/styles/document-styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BrandProvider>
          <Header />
          <main style={{ paddingTop: '100px' }}>
            {children}
          </main>
          <StaticFooter />
        </BrandProvider>
      </body>
    </html>
  );
}