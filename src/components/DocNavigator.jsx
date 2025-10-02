// src/components/DocNavigator.jsx -- DEBUGGING VERSION
"use client";

import React from 'react';
import Link from 'next/link';
import { useBrand } from '@/context/BrandContext';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const DocNavigator = ({ currentPageKey }) => {
  const brand = useBrand();
  const documentFlow = brand?.navLinks.filter(link => link.path) || [];
  const currentIndex = documentFlow.findIndex(doc => doc.key === currentPageKey);

  // --- DEBUGGING LINES ---
  console.log("--- DOC NAVIGATOR DEBUG ---");
  console.log("Current Page Key Prop:", currentPageKey);
  console.log("Brand object:", brand);
  console.log("Document Flow Array:", documentFlow);
  console.log("Found Index:", currentIndex);
  if (currentIndex === -1) {
    console.error("CRITICAL ERROR: The key '" + currentPageKey + "' was NOT FOUND in the Document Flow Array. The navigator will not render.");
  }
  console.log("-------------------------");
  // --- END DEBUGGING ---

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