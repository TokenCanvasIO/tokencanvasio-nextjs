// src/components/pages/AboutUs.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useBrand } from '@/context/BrandContext';
import useMediaQuery from '@/hooks/useMediaQuery';
import DocNavigator from '@/components/DocNavigator';

const PolicySection = ({ title, children }) => ( <section className="mb-8"><h2 className="text-2xl font-bold doc-section-title mb-3 border-b pb-2">{title}</h2><div className="doc-text space-y-4">{children}</div></section> );

const PageWrapper = ({ children }) => {
  const brand = useBrand();
  return (
    <div className="doc-page-wrapper max-w-4xl mx-auto rounded-lg shadow-xl p-6 sm:p-10">
      {brand && (
        <Link 
          href={brand.meta.url} 
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] no-underline hover:text-[var(--text-primary)] transition-colors"
        >
          <FaArrowLeft />
          Back to {brand.title}
        </Link>
      )}
      {children}
    </div>
  );
};

const AboutUs = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const titleStyle = isMobile ? { fontSize: '1.8rem', lineHeight: '1.25' } : {};

  return (
    <PageWrapper>
      <div className="text-center mb-10">
        <h1 className="doc-title text-4xl sm:text-5xl font-extrabold mb-2" style={titleStyle}>
          About {isMobile ? <br /> : ' '} TokenCanvasIO
        </h1>
        <p className="doc-subtitle text-xl">
          See the Digital Asset World, Your Way.
        </p>
      </div>
      <PolicySection title="Our Mission: Cut Through the Noise">
        <p>The digital asset world can be daunting no matter how much experince you have. Your investments, collections, and digital identity can be scattered across different networks, lost in a sea of noise from thousands of irrelevant assets.</p>
        <p>We built TokenCanvasIO to fix this. Our mission is to give you a calm, beautiful, and powerful way to see the market, focusing only on what truly matters to you.</p>
      </PolicySection>
      <PolicySection title="What is a 'My Canvas'?">
        <p>A 'My Canvas' is your personal, interactive view of the on-chain world. It’s not a static dashboard; it’s a living, breathing space that you create and control.</p>
        <p>With your 'My Canvas', you can:</p>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Curate Your Story:</strong> Build a public portfolio that showcases your best assets and defines your Web3 identity.</li>
            <li><strong>Showcase Your Collections:</strong> Create beautiful, shareable galleries for your prized digital assets, from NFTs to tokenized real-world items.</li>
            <li><strong>Make sense of Your Portfolio:</strong> See your entire multi-chain portfolio in a single, private, real-time view.</li>
            <li><strong>Build Community Trust:</strong> Launch a transparent canvas to display your project's treasury and key holdings to your community.</li>
        </ul>
      </PolicySection>
      <PolicySection title="Our Vision for the Future">
        <p>Our vision extends beyond the screen. We are building the TokenCanvasIO Grand Gallery, a stunning canvas where you can not only view your assets but truly interact with them.</p>
        <p>The future: Imagine walking through your collections in the Metaworld, picking up a tokenized Real-World Asset—like tickets to a concert or a voucher for a fine dining experience.  Then in the real world you can create lasting memories with those you care about most. This is our ultimate goal: to bridge the gap between digital ownership and real-world experiences.  </p>
      </PolicySection>
      <div className="doc-footer text-center mt-12">
        <p className="text-lg italic">Join us and compose your on-chain world.</p>
      </div>
      <DocNavigator currentPageKey="about" />
    </PageWrapper>
  );
};

export default AboutUs;