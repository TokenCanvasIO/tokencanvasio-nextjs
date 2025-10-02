// src/components/pages/PrivacyPolicy.jsx
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

const PrivacyPolicy = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold doc-title mb-2">Privacy Policy</h1>
        <p className="doc-subtitle">Last Updated: September 22, 2025</p>
      </div>

      <p className="mb-8 text-lg doc-text">
        Your privacy is important to us. This Privacy Policy explains how Token CanvasIO ("we," "us," or "our") collects, uses, and protects information in relation to our website (the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.
      </p>

      <PolicySection title="1. Information We Collect">
        <p>We collect information to provide and improve our Service. The types of information we collect depend on how you use our Service.</p>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Information You Provide to Us</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Account Information:</strong> When you create an account by signing in with Google, we collect personal information such as your name and email address to identify you and secure your data.
            </li>
            <li>
              <strong>User-Generated Content:</strong> When you are signed in, we store your canvas configuration data (e.g., selected assets, theme choices, custom logos) and link it to your account.
            </li>
            <li>
              <strong>Publicly Shared Content:</strong> When you use our "Share a Snapshot" or "Create a Live Link" features, you create a public version of your canvas. The data in this public version is stored in a publicly accessible location in our database.
            </li>
            <li>
              <strong>Subscription Information:</strong> When you subscribe to a premium tier, our payment processor (Stripe) collects the information necessary to process your payment. We do not store your full payment card information.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mt-6 mb-2">Information We Collect Automatically</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Browser Storage (localStorage):</strong> To provide the core experience without an account, we use your browser's local storage to save your canvas configuration. This data is stored only on your device.
            </li>
            <li>
              <strong>Log Data:</strong> Our servers may automatically record information such as your device's IP address and browser type for security and analytical purposes.
            </li>
          </ul>
        </div>
      </PolicySection>

      <PolicySection title="2. How We Use Your Information">
        <p>We use the information we collect for various purposes, including:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>To provide, operate, and maintain our Service.</li>
          <li>To allow you to save your canvas configuration to your local browser and your cloud account.</li>
          <li>To create and manage your account and securely link your saved data.</li>
          <li>To generate and display public, view-only versions of your canvas when you use our sharing features.</li>
          <li>To manage subscriptions and process payments.</li>
          <li>To monitor and analyze usage to improve the Service's functionality.</li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Information You Share Publicly">
        <p>
          Our Service allows you to share your personalized canvas with others via a public link. When you create a share link (either a "Snapshot" or a "Live Link"), the configuration of that canvas, including any custom titles or logos you have set, becomes <strong>publicly available</strong> to anyone who has the link.
        </p>
        <p>
          <strong>We strongly advise against including any personal or sensitive information</strong> in any part of your canvas that you intend to share publicly. You are in control of this feature. You can disable your "Live Link" at any time from the settings panel, which will delete the public version of your canvas from our servers.
        </p>
      </PolicySection>

      <PolicySection title="4. Third-Party Services">
        <p>
          We use third-party companies to facilitate our Service. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Google Firebase (Authentication & Database):</strong> We use Google Firebase to manage user accounts and to store your saved canvas data.
          </li>
          <li>
            <strong>Cloudinary (Image Management):</strong> We use Cloudinary to store and manage custom logos that you upload.
          </li>
           <li>
            <strong>Stripe (Payment Processing):</strong> We use Stripe for payment processing.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Data Security">
        <p>
          The security of your data is important to us. We implement reasonable security measures to protect your information. However, please remember that no method of transmission over the Internet or electronic storage is 100% secure.
        </p>
      </PolicySection>
      
      <PolicySection title="6. Your Data Rights">
        <p>
          You have the right to request the deletion of your account and all associated saved canvas data stored on our servers. To make such a request, please contact us at the email address listed below.
        </p>
      </PolicySection>

      <PolicySection title="7. Changes to This Privacy Policy">
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
        </p>
      </PolicySection>
      
      <PolicySection title="8. Contact Us">
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@tokencanvas.io.
        </p>
      </PolicySection>

      {/* 2. Add the navigator component here, with the correct key */}
      <DocNavigator currentPageKey="privacy" />

    </PageWrapper>
  );
};

export default PrivacyPolicy;