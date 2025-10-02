// src/app/layout.js
import React from 'react';
import Header from '@/components/Header';
import StaticFooter from '@/components/StaticFooter';
import { BrandProvider } from '@/context/BrandContext';
import Breadcrumbs from '@/components/Breadcrumbs'; // 1. Import the new component
import './globals.css';
import '@/styles/_variables.css';
import '@/styles/document-styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BrandProvider>
          <Header />
          <main style={{ paddingTop: '100px' }}>
            {/* 2. Add the Breadcrumbs component here */}
            <Breadcrumbs />
            {children}
          </main>
          <StaticFooter />
        </BrandProvider>
      </body>
    </html>
  );
}