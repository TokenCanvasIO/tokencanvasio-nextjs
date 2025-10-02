// src/components/pages/AboutXRP.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useBrand } from '@/context/BrandContext';
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

const AboutXRP = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-10">
        <h1 className="doc-title text-4xl sm:text-5xl font-extrabold mb-2">The Portal to the XRPL Community</h1>
        <p className="doc-subtitle text-xl">
          Built by the community, for the community.
        </p>
      </div>
      <PolicySection title="Our Purpose">
        <p>Welcome to your dedicated gateway to the XRP Ledger's vibrant ecosystem of community-driven projects. While the crypto world is vast, we believe some of the most exciting innovations are happening right here. This platform was built with a single purpose: to provide the XRPL community with a powerful, intuitive, and real-time tool to visualize the market.</p>
        <p>We transform complex on-chain data into the dynamic bubble canvas you see on our homepage, allowing you to instantly see market movements, track trends, and discover new projects. This isn't just a data site; it's a living snapshot of the XRPL space.</p>
      </PolicySection>
      <PolicySection title="Why We're Different">
        <p>Our focus is singular: to serve the XRP Ledger community.</p>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Curated View:</strong> By focusing on a select number of projects, we provide a clean, high-signal view of the most relevant assets, cutting through the noise of the broader market.</li>
            <li><strong>Community-First Approach:</strong> We are active members of the XRPL community and built this tool to solve our own needs. Our roadmap is driven by community feedback and the evolution of the ecosystem.</li>
            <li><strong>Intuitive Visualization:</strong> The bubble canvas is designed to make complex data immediately understandable, helping both new and experienced users grasp market dynamics at a glance.</li>
        </ul>
      </PolicySection>
      <PolicySection title="Our Mission">
        <p>Our mission is to be the essential navigation tool for every XRPL enthusiast. We are committed to providing the most accurate, engaging, and insightful data visualization experience possible. What you see today is just the beginning of our journey to support and grow with this incredible community.</p>
      </PolicySection>
      <DocNavigator currentPageKey="about" />
    </PageWrapper>
  );
};

export default AboutXRP;