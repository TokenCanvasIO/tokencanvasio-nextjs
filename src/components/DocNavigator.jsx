// src/components/DocNavigator.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// This array defines the order and paths of your pages
const documentFlow = [
  { key: 'about', path: '/about', label: 'About' },
  { key: 'whitepaper', path: '/white-paper', label: 'White Paper' },
  { key: 'faq', path: '/faq', label: 'FAQ' },
  { key: 'terms', path: '/terms-of-service', label: 'Terms' },
  { key: 'privacy', path: '/privacy-policy', label: 'Privacy' },
];

const DocNavigator = ({ currentPageKey }) => {
  const currentIndex = documentFlow.findIndex(doc => doc.key === currentPageKey);

  if (currentIndex === -1) {
    return null; // Don't render if the page isn't in our defined flow
  }

  const prevDoc = currentIndex > 0 ? documentFlow[currentIndex - 1] : null;
  const nextDoc = currentIndex < documentFlow.length - 1 ? documentFlow[currentIndex + 1] : null;

  return (
    <nav className="doc-navigator">
      <div>
        {prevDoc ? (
          <Link href={prevDoc.path} className="nav-arrow prev">
            <FaArrowLeft />
            <span>{prevDoc.label}</span>
          </Link>
        ) : (
          // Empty div to maintain spacing
          <div></div>
        )}
      </div>
      <div>
        {nextDoc && (
          <Link href={nextDoc.path} className="nav-arrow next">
            <span>{nextDoc.label}</span>
            <FaArrowRight />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default DocNavigator;