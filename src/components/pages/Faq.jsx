import React from 'react';
import DocNavigator from '@/components/DocNavigator'; // 1. Import the navigator

// Reusable helper components for consistent styling.
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

const Faq = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-10">
        <h1 className="doc-title text-4xl sm:text-5xl font-extrabold mb-2">Frequently Asked Questions</h1>
      </div>

      <PolicySection title="What is TokenCanvas?">
        <p>
          TokenCanvas is a next-generation, multi-asset data visualizer. We provide real-time market data in a unique and interactive "bubble" format to help you discover, track, and analyze trends across different crypto ecosystems.
        </p>
      </PolicySection>

      <PolicySection title="Do I need an account?">
        <p>
          <strong>No, an account is completely optional.</strong> Your canvas configuration is always saved automatically to your browser's local storage, so your selections will be remembered on your next visit from the same device.
        </p>
        <p>
          Creating a free account by signing in allows you to create a permanent cloud backup of your canvas. This lets you restore your personalized layout on any device, or after clearing your browser history.
        </p>
      </PolicySection>
      
      <PolicySection title="How do I share my canvas?">
        <p>
          TokenCanvas allows you to share your personalized canvas with others in two distinct ways from the <strong>My Canvas & Settings</strong> (🎨) panel. Both methods create a secure, read-only version of your canvas that can be viewed by anyone with the link.
        </p>
        
        <p><strong>1. Share a Snapshot 📸</strong></p>
        <p>
          This option creates a permanent, unchangeable "photograph" of your canvas exactly as it is at that moment. Future changes you make to your own canvas will <em>not</em> affect a previously shared snapshot.
        </p>
        <p>
          <em><strong>How it works:</strong> When you click 'Generate Snapshot Link', the app saves a secure, read-only copy of your canvas layout to our database with a new, unique ID. The link you share points directly to this frozen copy, while your own canvas remains private and editable.</em>
        </p>

        <p><strong>2. Create a Live Link 📡 (Premium Feature)</strong></p>
        <p>
          This creates a single, permanent public link to your canvas that updates automatically whenever you save changes. It’s like sharing a link to a live document.
        </p>
        <p>
           <em><strong>How it works:</strong> When you enable this feature, the app maintains a public-safe version of your canvas in our database that is linked to your user ID. This public version is automatically synced with your private canvas when you save, ensuring viewers always see the latest version.</em>
        </p>
      </PolicySection>

      {/* --- THIS IS THE NEW SECTION --- */}
      <PolicySection title="How do I install the TokenCanvas App?">
        <p>
          TokenCanvas is a Progressive Web App (PWA), which means you can install it directly to your device's home screen without needing an app store. This gives you a fast, native-app-like experience.
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

      <PolicySection title="How do I add assets to my canvas?">
        <p>
          You can fully customize your canvas from the <strong>My Canvas & Settings</strong> (the palette icon 🎨) panel. Inside, the "My Canvas" tab allows you to:
        </p>
        <ul className="list-disc list-inside ml-4">
            <li>Search for thousands of cryptocurrencies by name or symbol.</li>
            <li>Add custom NFTs by pasting in their unique Token ID.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Why did the bubbles stop moving?">
        <p>
          To conserve resources, the physics engine that controls the bubbles automatically "goes to sleep" after a period of inactivity.
        </p>
        <p>
          You can wake them up by clicking the <strong>Restart Bubbles</strong> button (the circular arrow 🔄) in the floating control bar.
        </p>
      </PolicySection>
      
      <PolicySection title="A bubble disappeared. What happened?">
        <p>
          The interactive canvas is powered by a real physics engine. Occasionally, high-speed collisions can give a bubble enough velocity to escape the canvas boundaries. A simple click on the <strong>Restart Bubbles</strong> button (🔄) will instantly bring all your assets back into view.
        </p>
      </PolicySection>

      <PolicySection title="Why is my NFT image or data missing?">
        <p>
          When you add an NFT, its data is fetched in the background. Sometimes, your browser may load the bubble before this background process is complete. This is usually a temporary caching issue. A page refresh or a click on the <strong>Restart Bubbles</strong> button (🔄) will typically solve the problem.
        </p>
      </PolicySection>

      <PolicySection title="Is this financial advice?">
        <p>
          <strong>No. Absolutely not.</strong> All data on this site is for informational and entertainment purposes only. Always conduct your own research and consult with a qualified professional before making any investment decisions.
        </p>
      </PolicySection>
      
      <PolicySection title="Where does the data come from?">
        <p>
          Our platform aggregates data from trusted third-party APIs, primarily <strong>CoinGecko</strong> and other on-chain sources, to provide a comprehensive view of market activity.
        </p>
      </PolicySection>

      {/* 2. Add the navigator component here, with the correct key */}
      <DocNavigator currentPageKey="faq" />

    </PageWrapper>
  );
};

export default Faq;