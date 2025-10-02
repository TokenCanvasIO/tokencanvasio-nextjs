// src/components/pages/WhitePaper.jsx
"use client"; 

import React from 'react';
import useMediaQuery from '@/hooks/useMediaQuery';
import DocNavigator from '@/components/DocNavigator'; // 1. Import the navigator

// Reusable helper components for consistent styling.
const PolicySection = ({ title, children }) => (
  <section className="doc-section mb-8">
    <h2 className="doc-section-title text-2xl font-bold mb-3 border-b pb-2">{title}</h2>
    <div className="doc-text">
      {children}
    </div>
  </section>
);

const PageWrapper = ({ children }) => (
  <div className="doc-page-wrapper">
    {children}
  </div>
);

const WhitePaper = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const titleStyle = isMobile ? { fontSize: '2rem', lineHeight: '1.2' } : {};

  return (
    <PageWrapper>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="doc-title" style={titleStyle}>
          TokenCanvasIO: A Serene Interface for the Real-World Asset Economy
        </h1>
        <p className="doc-subtitle">September 18, 2025 | Version 7.0</p>
      </div>

      <PolicySection title="Abstract">
        <p>The global economy is being tokenised. For the first time, every form of value—from digital art to physical real estate—can be represented, owned, and traded on-chain as a Real-World Asset (RWA). This financial and cultural revolution promises a new era of transparency and user ownership. However, it has also created a tsunami of complexity. The immense potential of this new economy is currently trapped behind the chaos of a fragmented, multi-chain universe.</p>
        <p>To unlock this potential, users require a new kind of interface—a tool that brings clarity, order, and serenity to the noise. TokenCanvasIO is that tool. We provide a non-custodial, user-owned platform that transforms a person's scattered on-chain footprint into a single, beautiful, and interactive "Living Canvas." By providing a serene environment for users to curate and control their on-chain story, we are not merely visualising data; we are building the essential user interface layer for the tokenised world.</p>
      </PolicySection>

      <PolicySection title="1. The Problem: The Chaos of a Tokenised World">
        <p>The promise of a user-owned internet has arrived, but it has resulted in a fractured digital existence. A user's assets are scattered across a disconnected archipelago of networks. Their investments might live on the XRP Ledger, their digital identity in an Ethereum NFT, and their future property holdings on a specialised RWA chain. To view their complete digital estate, they must navigate a bewildering maze of block explorers, wallets, and dashboards—each an isolated island of information.</p>
        <p>This is not just an inconvenience; it is a fundamental barrier to mass adoption. As tokenisation expands beyond digital collectibles to include stocks, bonds, carbon credits, and property deeds, this complexity will grow exponentially. To unlock the full potential of this new economy, we must build the tools that make it navigable, understandable, and beautiful. We must create order from chaos.</p>
      </PolicySection>
      
      <PolicySection title="2. The Solution: A Serene Environment for Your On-Chain Story">
        <p>TokenCanvasIO provides the shared UI layer for the next generation of the decentralised economy. We believe that when owning a digital asset feels less like a line in a database and more like a rich, interactive experience, widespread adoption can finally be realised.</p>
        <p>Our platform is a sophisticated workshop, providing the tools for users to build and control their own "Living Canvases." These are not static dashboards; they are real-time, interactive, and serene environments where users can navigate their on-chain self. Digital assets retain all their on-chain advantages—scarcity, ownership, and tradability—but can now be presented with purpose.</p>
        <div style={{marginTop: '1rem'}}>
          <p>With TokenCanvasIO, you can:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '0.5rem' }}>
            <li>Curate a professional Web3 identity by creating a public canvas of your most important assets.</li>
            <li>Showcase your prized NFT collections in a beautiful, shareable digital gallery.</li>
            <li>Analyse your entire multi-chain portfolio in a single, private, real-time view.</li>
            <li>Build community trust by launching a transparent canvas for your project's treasury and key holdings.</li>
          </ul>
        </div>
        <p style={{marginTop: '1rem'}}>This is all powered by a high-performance, self-managed backend stack, utilising Node.js microservices on an Edge.network server, managed by PM2, and accelerated by a Redis caching layer for maximum speed and resilience.</p>
      </PolicySection>

      <PolicySection title="3. Market Positioning & Competitive Landscape">
          <p>The digital asset management space includes a variety of tools, from DeFi portfolio trackers to virtual galleries. However, TokenCanvasIO is uniquely positioned by focusing on a different core principle: serenity through curation.</p>
          <p>While DeFi dashboards like Zapper and Zerion excel at providing raw financial metrics for traders, they often contribute to the sense of data overload. On the other hand, gallery platforms like Oncyber create beautiful but often isolated 3D spaces.</p>
          <p>TokenCanvasIO carves its own niche. We are not just another dashboard or another gallery; we are the first platform dedicated to the holistic curation of a user's on-chain identity. Our focus is on aesthetic presentation, narrative control, and the high-fidelity representation of high-value Real-World Assets. We provide the tools for users to tell their story, not just count their tokens. This focus on user-centric curation and the coming RWA revolution is our key differentiator in a crowded market.</p>
      </PolicySection>

      <PolicySection title="4. Core Architecture: The Non-Custodial Principle">
        <p>Our entire ecosystem is architected to be fundamentally non-custodial. This is the cornerstone of our security model and our commitment to user ownership, ensuring we never hold, manage, or transfer user assets or data. This principle allows us to operate outside the perimeter of VASP (Virtual Asset Service Provider) regulations in jurisdictions like Guernsey.</p>
        <p>This is achieved through three pillars of decentralisation:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '0.5rem' }}>
          <li><strong>Wallet Connection (Your Keys, Your Control):</strong> Our application never has access to a user's private keys. All actions requiring ownership are cryptographically signed by the user from within the secure environment of their own wallet (e.g., Xaman, MetaMask) on our client-side React application.</li>
          <li><strong>Decentralised Storage (Your Data, Your Property):</strong> A user's personalised canvas settings are not stored on our servers. They are uploaded directly from the user's browser to the decentralised IPFS network. The user is the sole owner of the "key" (the IPFS CID) to their data.</li>
          <li><strong>Smart Contracts (Your Transactions, Your Trust):</strong> All value-based interactions, such as paying a fee to be featured, are handled by autonomous, transparent, and audited smart contracts on a public blockchain. Users transact directly with the contract, not with our company.</li>
        </ul>
      </PolicySection>

      <PolicySection title="5. The Team & Advisors">
        <p>TokenCanvasIO is led by a team with a deep understanding of both technology and the strategic landscape of digital assets, based in the premier international finance centre of Guernsey.</p>
        <p><strong>Mark Flynn - Founder & Lead Architect</strong> With a proven track record of developing and deploying complex, full-stack applications, Mark is the visionary and technical lead behind the TokenCanvasIO platform. His expertise in both frontend user experience and robust backend architecture provides the foundation for the project's ambitious goals.</p>
        <p><strong>Advisors</strong> We are actively engaged with and advised by key leaders within the Guernsey business and finance community. Our advisory board provides invaluable strategic guidance on market positioning, regulatory compliance, and forging partnerships within the global Real-World Asset ecosystem. Official team announcements will be released in due course.</p>
      </PolicySection>

      <PolicySection title="6. Key Features: A Clear User Journey">
          <p>The TokenCanvasIO platform is more than a visualisation tool; it is a self-sustaining ecosystem designed to bring order and value to the public display of on-chain assets.</p>
          <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>6.1 The Creation Studio</h3>
          <p>The user journey begins in our intuitive, user-friendly studio. Here, any user can connect their wallet and begin building their personal canvas without needing any technical skill.</p>
          <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>6.2 MyCanvas: Your Living Portfolio</h3>
          <p>The output of the studio is a 'MyCanvas'—a beautiful, interactive, and shareable representation of a user's chosen assets. Users can create an unlimited number of canvases, creating their own "MyCanvas World" of different collections and portfolios.</p>
          <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>6.3 The Public Gallery</h3>
          <p>The main tokencanvas.io site features the Public Gallery, a grand, real-time canvas showcasing the brands, projects, and collections of our users. It is the public square of the TokenCanvasIO ecosystem.</p>
          <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>6.4 The Spotlight System: A Hybrid & Decentralised Economy</h3>
          <p>To gain prominence in the Public Gallery, users interact with the "Spotlight" System. Our approach to monetisation is architected for maximum security, flexibility, and regulatory compliance.</p>
          <p>For users who prefer traditional payment methods, we will integrate Stripe, allowing for seamless transactions via credit and debit cards. For crypto-native users, the system is powered by a decentralised smart contract. The contract will be deployed on a Layer-2 EVM compatible chain to ensure low transaction costs and high throughput, which is essential for a smooth user experience. We are currently evaluating leading solutions like Arbitrum and Polygon, with a final decision pending a comprehensive security and performance analysis before the development of Phase 3.</p>
          <p>Critically, all on-chain transactions will occur outside the TokenCanvasIO platform. Users will interact directly with the smart contract from their own wallets. Our backend "notary" service will then listen for a successful transaction confirmation from the blockchain, and only then will it securely update our platform's state to apply the "bump" to the user's bubble in the Public Gallery. This model ensures we never take custody of user funds and maintain our non-custodial principles.</p>
          <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>6.5 The Immersive 3D Gallery: The Digital Showroom</h3>
          <p>The evolution of the digital asset is a shift from a static 2D image to a dynamic 3D experience. To lead this transition, TokenCanvasIO will move beyond 2D visualization to create a best-in-class "Digital Showroom" for high-end Real-World Assets and 3D NFTs. This transforms the NFT viewer from a simple overlay into the core interactive engine of our platform.</p>
          <p>This feature will be built on a high-performance WebGL foundation, leveraging the industry-standard React Three Fiber and Drei libraries. Our backend data pipeline will intelligently parse metadata from both EVM chains and the XRPL to extract and serve web-optimized .glb 3D model files.</p>
          <p>Within the showroom, a user will not just see a picture of their asset; they will experience it. A tokenized luxury watch can be rotated and inspected from every angle, with photorealism achieved through Image-Based Lighting. A pre-construction property, tokenized as an RWA, can be explored via an immersive virtual tour. Crucially, this 3D experience will be connected to on-chain data through interactive UI overlays, allowing a user to click on a 3D model to view its provenance, market value, or unique traits. This entire experience will be optimized for all devices through Draco compression and on-demand rendering, ensuring a seamless and performant interface. This is the ultimate fulfillment of our mission: to transform the abstract concept of digital ownership into a tangible, emotionally resonant, and deeply human experience.</p>
      </PolicySection>
      
      <PolicySection title="7. The Definitive Roadmap">
        <p>This roadmap outlines our ambitious goals. The successful execution and timing of these phases, particularly from Phase 2 onwards, is contingent on the strategic expansion of our development resources.</p>
        <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>Phase 1: The Foundation (Present - End of 2025)</h3>
        <p><strong>Objective:</strong> Launch the core dApp and establish our technical and strategic foundation.</p>
        <p><strong>Technical Track:</strong></p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li><strong>Backend Migration (✅ COMPLETE):</strong> The migration to a high-performance Node.js, Nginx, PM2, and Redis stack on a self-managed Edge server is complete. The tokencanvas.io domain is live and secure.</li>
            <li><strong>Build the "MyCanvas" dApp Core (Next 3-4 Months):</strong> Our next major sprint is to build the complete user-owned experience, implementing wallet connections, the Creation Studio UI, and IPFS integration.</li>
            <li><strong>Launch the dApp (Early 2026):</strong> Deploy our Minimum Viable Product (MVP) on tokencanvas.io, allowing users to create and save their own personalised canvases.</li>
        </ul>
         <p style={{marginTop: '1rem'}}><strong>Strategy Track (In Parallel):</strong></p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li><strong>Define the Beachhead Market:</strong> Make a strategic decision to focus on one primary user group for our initial launch (e.g., digital art collectors, RWA projects) and tailor the experience perfectly for them.</li>
            <li><strong>Solve the "Cold Start" Problem:</strong> Form strategic partnerships with key NFT projects, DAOs, or influencers to seed the platform with the first 100-500 high-quality canvases at launch.</li>
            <li><strong>Regulatory Dialogue:</strong> Continue our proactive dialogue with the Guernsey regulators (GFSC and ODPA) to ensure full clarity as we build.</li>
        </ul>

        <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>Phase 2: The Immersive 3D Experience Layer (2026)</h3>
        <p><strong>Objective:</strong> Transform the platform into a premier "Digital Showroom".</p>
        <p><strong>Technical Track:</strong> Build the Cross-Chain 3D Data Pipeline and replace the 2D NFT viewer with an immersive 3D engine built with React Three Fiber. Develop polished showcase demos for Luxury Watches, High-End Digital Art, and Pre-construction Real Estate.</p>

        <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>Phase 3: The Economy (Second Half of 2026)</h3>
        <p><strong>Objective:</strong> Build the decentralised monetisation engine.</p>
        <p><strong>Technical Track:</strong> Develop, test, and secure multiple professional security audits for the "Spotlight" System smart contract.</p>

        <h3 style={{fontWeight: 'bold', marginTop: '1.5rem'}}>Phase 4: The Expansion (2027 and Beyond)</h3>
        <p><strong>Objective:</strong> Become a true multi-chain and RWA platform.</p>
        <p><strong>Technical Track:</strong> Build the multi-chain "notary" service to verify asset ownership on other chains (e.g., Ethereum, Stellar). Research and integrate with leading RWA platforms and their APIs.</p>
      </PolicySection>

      <PolicySection title="8. Conclusion">
        <p>The power of distributed ledger technology is now connecting with the end-user experience, creating a shared data layer that becomes more powerful with each new canvas built. TokenCanvasIO provides the vital piece of plumbing necessary to create a serene environment within the growing chaos of the tokenised world.</p>
        <p>TokenCanvasIO is not just an application; it is the shared UI layer for the next generation of the internet. By enhancing the nature of digital ownership with the power of human imagination, we invite the community to build with us, to bring order to the chaos, and to define the future of on-chain identity.</p>
      </PolicySection>

      {/* 2. Add the navigator component here, with the correct key */}
      <DocNavigator currentPageKey="whitepaper" />

    </PageWrapper>
  );
};

export default WhitePaper;