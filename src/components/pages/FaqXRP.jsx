import React from 'react';
import DocNavigator from '@/components/DocNavigator';

const PolicySection = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-bold doc-section-title mb-3 border-b pb-2">{title}</h2>
    <div className="doc-text space-y-4">
      {children}
    </div>
  </section>
);

const PageWrapper = ({ children }) => (
  <div className="doc-page-wrapper max-w-4xl mx-auto rounded-lg shadow-xl p-6 sm:p-10">
    {children}
  </div>
);

const FaqXRP = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-10">
        <h1 className="doc-title text-4xl sm:text-5xl font-extrabold mb-2">Frequently Asked Questions</h1>
      </div>

      <PolicySection title="What is XRP MemeCoins?">
        <p>
          XRP MemeCoins is a specialized data visualizer for the XRP Ledger ecosystem. We provide real-time market data for XRPL tokens in a unique and interactive "bubble" format to help you discover, track, and analyze trends.
        </p>
      </PolicySection>

      <PolicySection title="Do I need an account to use this site?">
        <p>
          <strong>No, an account is completely optional.</strong> Your canvas configuration is always saved automatically to your browser's local storage, so your selections will be remembered on your next visit from the same device.
        </p>
        <p>
          Creating a free account allows you to create a permanent cloud backup of your canvas, letting you restore your layout on any device.
        </p>
      </PolicySection>

      <PolicySection title="What are the benefits of a premium membership?">
        <p>
          By upgrading to a premium membership, you unlock the full potential of your canvas and help support the platform's continued development. Benefits include:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Elevated NFT Cap:</strong> Display up to 25 NFTs on your canvas.</li>
          <li><strong>Expanded Link Library:</strong> Save up to 25 of your favorite web links.</li>
          <li><strong>Go Live Feature:</strong> Get a permanent, publicly shareable link to your dynamic, real-time canvas.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Who handles my payment? Why does checkout show another brand?">
        <p>
          XRPMemeCoins.com is powered by the team at <strong>TokenCanvasIO</strong>. To ensure the highest level of security, we use their centralized system to process all subscriptions.
        </p>
        <p>
          When you subscribe, you will be redirected to the secure TokenCanvasIO checkout page to complete your payment. This is the official and secure payment gateway for our service.
        </p>
      </PolicySection>

      <PolicySection title="How do I install the App?">
        <p>
          This site is a Progressive Web App (PWA), which means you can install it directly to your device's home screen without needing an app store. This gives you a fast, native-app-like experience.
        </p>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li>
            <strong>On iOS (iPhone/iPad):</strong> Tap the "Share" button in Safari's toolbar, then scroll down and select "Add to Home Screen."
          </li>
          <li>
            <strong>On Android (Chrome):</strong> Tap the three-dot menu icon, then select "Install app" or "Add to Home screen."
          </li>
          <li>
            <strong>On Desktop (Chrome/Edge):</strong> Look for an "Install" icon that appears on the right side of the address bar.
          </li>
        </ul>
      </PolicySection>

      {/* ✅ NEW SECTION */}
      <PolicySection title="What are AMM Pools?">
        <p>
          AMM (Automated Market Maker) Pools are decentralized liquidity pools on the XRP Ledger that allow users to trade tokens without traditional order books. They provide liquidity for token pairs and enable instant swaps.
        </p>
        <p>
          Our platform displays AMM pools with real-time data including:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li><strong>Total Liquidity:</strong> The combined value locked in the pool</li>
          <li><strong>APY (Annual Percentage Yield):</strong> Estimated returns for liquidity providers</li>
          <li><strong>24h Volume:</strong> Trading activity over the last day</li>
        </ul>
      </PolicySection>

      {/* ✅ NEW SECTION */}
      <PolicySection title="Why aren't all AMM pools shown?">
        <p>
          We source AMM pool data from <strong>XPMarket.com</strong>, which aggregates and ranks pools by liquidity and trading volume. Only pools with sufficient activity and liquidity are included in their rankings.
        </p>
        <p>
          If you can't find a specific AMM pool on our platform, it may be because:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li>The pool has very low liquidity (under a certain threshold)</li>
          <li>The pool is newly created and hasn't been indexed yet</li>
          <li>The pool has minimal trading volume and isn't tracked by XPMarket</li>
        </ul>
        <p>
          To create your own AMM pool or view all pools directly, visit <a href="https://xpmarket.com/amm/top" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">XPMarket.com</a>.
        </p>
      </PolicySection>

      <PolicySection title="Why did the bubbles stop moving?">
        <p>
          To conserve resources, the physics engine will "go to sleep" after a period of inactivity. You can wake them up by clicking the <strong>Restart Simulation</strong> button (🔄) in the floating control bar.
        </p>
      </PolicySection>

      <PolicySection title="Why is my NFT image missing?">
        <p>
          When you add a new NFT, its data is fetched in the background. Sometimes, your browser may load the bubble before this is complete. A simple page refresh or using the <strong>Restart Simulation</strong> button (🔄) will typically solve the problem.
        </p>
      </PolicySection>

      <PolicySection title="Is this financial advice?">
        <p>
          <strong>No. Absolutely not.</strong> All data on this site is for informational and entertainment purposes only. Always conduct your own research and consult with a qualified professional before making any investment decisions.
        </p>
      </PolicySection>

      <PolicySection title="Where does the data come from?">
        <p>
          Our platform aggregates data from trusted third-party APIs:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li><strong>CoinGecko:</strong> Token prices, market caps, and trading volumes</li>
          <li><strong>XPMarket:</strong> AMM pool data, liquidity, and APY calculations</li>
          <li><strong>XRPL (On-chain):</strong> Direct blockchain data for NFTs and token information</li>
        </ul>
      </PolicySection>

      <DocNavigator currentPageKey="faq" />
    </PageWrapper>
  );
};

export default FaqXRP;