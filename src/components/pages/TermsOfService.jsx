// src/components/pages/TermsOfService.jsx
import React from 'react';
import DocNavigator from '@/components/DocNavigator'; // 1. Import the navigator

// Reusable helper components for consistent styling.
const PolicySection = ({ title, children, className }) => (
  <section className={`mb-8 ${className || ''}`}>
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

const TermsOfService = () => {
  return (
    <PageWrapper>
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold doc-title mb-2">Terms and Conditions</h1>
        <p className="doc-subtitle">Last Updated: September 30, 2025</p>
      </div>

      <p className="mb-8 text-lg doc-text">
        Please read these Terms and Conditions ("Terms") carefully before using the tokencanvas.io website (the "Service") operated by Token CanvasIO ("us," "we," or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. By accessing or using the Service, you agree to be bound by these Terms.
      </p>

      <PolicySection title="1. Not Financial Advice">
        <p>
          The content and data provided on this Service are for informational and entertainment purposes only. Nothing on this website constitutes financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the Service's content as such. We do not recommend that any cryptocurrency, token, or NFT should be bought, sold, or held by you. You must conduct your own due diligence and consult a qualified financial advisor before making any investment decisions.
        </p>
      </PolicySection>

      <PolicySection title="2. Data Accuracy">
        <p>
          The data displayed on this Service, including but not limited to prices, market capitalization, and on-chain information, is sourced from third-party APIs. We do not guarantee the accuracy, timeliness, or completeness of this data. The Service is provided on an "as is" and "as available" basis, and we are not liable for any errors, omissions, or inaccuracies in the data provided.
        </p>
      </PolicySection>
      
      <PolicySection title="3. Subscriptions and Paid Services">
        <p>
          Certain features of the Service, such as an <strong>Elevated NFT Cap (up to 25 NFTs)</strong>, an <strong>Expanded Link Library (up to 25 web links)</strong>, and the <strong>Go Live Feature (public canvas sharing)</strong>, are available only to users with an active subscription ("Paid Services" or "Membership"). By purchasing Paid Services, you agree to pay the specified fees, which will be billed in advance on a recurring and periodic basis ("Billing Cycle").
        </p>
        <p>
          Your subscription will automatically renew at the end of each Billing Cycle unless you cancel it. All fees are non-refundable except as required by law or as stated in our Refund Policy. We reserve the right to change our subscription plans or adjust pricing at our sole discretion.
        </p>
      </PolicySection>

      <PolicySection title="4. Your Content and Public Sharing">
        <p>
          Our Service allows you to upload content, such as custom logos, and to save personalized canvas configurations ("User Content"). You retain full ownership of your User Content.
        </p>
        <p>
          When you use our "Share a Snapshot" or "Go Live" features, you are intentionally creating a <strong>publicly accessible version</strong> of your User Content. You grant us a limited, non-exclusive, worldwide, royalty-free license to host and display this public version to anyone who has the link.
        </p>
         <p>
          You are <strong>solely responsible</strong> for the content you choose to make public. Do not include any personal or sensitive information in your canvas titles or custom asset names that you do not wish to be publicly visible. Please see our Privacy Policy for more information.
        </p>
      </PolicySection>

      <PolicySection title="5. User Conduct">
        <p>
          You agree not to use the Service to create, upload, or share any User Content that is unlawful, harmful, defamatory, obscene, pornographic, or otherwise objectionable. You are responsible for ensuring that your User Content does not infringe on the intellectual property rights of others.
        </p>
        <p>
            We reserve the right, but not the obligation, to remove any User Content and suspend or terminate accounts that we determine, in our sole discretion, violate these Terms.
        </p>
      </PolicySection>

      <PolicySection title="6. Age Requirement">
        <p>
          You must be at least 18 years old to use this Service and purchase any Paid Services. By using the Service, you represent and warrant that you are of legal age to form a binding contract with us.
        </p>
      </PolicySection>

      <PolicySection title="7. Termination">
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
        </p>
        <p>
          You may terminate your account at any time by discontinuing use of the Service and/or requesting account deletion through the functionality provided in your account panel.
        </p>
      </PolicySection>

      <PolicySection title="8. Intellectual Property">
        <p>
          The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Token CanvasIO. This includes the "bubble" visualization concept, the user interface, branding, and all underlying code.
        </p>
      </PolicySection>

      <PolicySection title="9. Limitation of Liability">
        <p>
          In no event shall Token CanvasIO, nor its owner, be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of, or inability to access or use, the Service. You agree that you use the Service at your own risk.
        </p>
      </PolicySection>

      <PolicySection title="10. Third-Party Links">
        <p>
          Our Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
        </p>
      </PolicySection>
      
      <PolicySection title="11. Governing Law" className="two-column-law">
        <p><strong>Governing Law:</strong> These Terms shall be governed and construed in accordance with the laws of the Bailiwick of Guernsey, without regard to its conflict of law provisions.</p>
        <p><strong>Jurisdiction:</strong> You agree to submit to the exclusive jurisdiction of the courts of Guernsey.</p>
      </PolicySection>

      <PolicySection title="12. Privacy Policy">
        <p>
          Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by this reference. Please review our Privacy Policy to understand our practices regarding your personal information.
        </p>
      </PolicySection>

      <PolicySection title="13. Changes to These Terms">
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide reasonable notice of any significant changes by posting the new Terms on this page and updating the "Last Updated" date.
        </p>
      </PolicySection>
      
      <PolicySection title="14. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at support@tokencanvas.io.
        </p>
      </PolicySection>

      {/* 2. Add the navigator component here, with the correct key */}
      <DocNavigator currentPageKey="terms" />

    </PageWrapper>
  );
};

export default TermsOfService;