// src/components/DocNavigator.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const DocNavigator = ({ currentPageKey }) => {
  const brand = useBrand();
  // Use the brand-specific navLinks from the context
  const documentFlow = brand?.navLinks.filter(link => link.path) || [];
  
  const currentIndex = documentFlow.findIndex(doc => doc.key === currentPageKey);

  if (currentIndex === -1) {
    return null;
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
          <div></div> // Empty div for spacing
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