import React from 'react';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';

export const Privacy: React.FC = () => {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      lastUpdated="March 18, 2026"
      breadcrumbs={[{ label: 'Legal', link: '/legal' }, { label: 'Privacy Policy' }]}
    >
      <div className="text-slate-300 leading-relaxed space-y-6">
        <p>Welcome to SomnoAI Digital Sleep Lab (“SomnoAI Digital Sleep Lab,” “we,” “us,” or “our”). We respect your privacy and are committed to handling personal data responsibly, transparently, and in accordance with applicable legal and regulatory expectations.</p>
        <p>This Privacy Policy explains how we collect, use, store, disclose, and protect personal data when you visit our website, create an account, contact us, or use our services.</p>
        <p>By accessing or using our website or services, you acknowledge that you have read this Privacy Policy.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">1. Information We Collect</h2>
        <p>We may collect the following categories of information:</p>
        
        <h3 className="text-xl font-bold text-white mt-8 mb-4">a. Information you provide directly</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Full name</li>
          <li>Email address</li>
          <li>Account login details</li>
          <li>Contact form messages</li>
          <li>Support requests</li>
          <li>Company or organization name</li>
          <li>Any information you voluntarily submit to us</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">b. Device and technical information</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device type</li>
          <li>Operating system</li>
          <li>Language preference</li>
          <li>Pages visited</li>
          <li>Referring URLs</li>
          <li>Session timestamps</li>
          <li>General diagnostic and analytics data</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">c. Health and wellness-related data</h3>
        <p>Where applicable and where you choose to provide or upload it, we may process sleep, wellness, behavioral, or health-related information, including data imported from supported devices, apps, or health platforms.</p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">d. Cookies and similar technologies</h3>
        <p>We may collect information through cookies, pixels, local storage, and similar technologies for essential functionality, performance analysis, and user experience improvement.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">2. Sources of Data</h2>
        <p>We may collect personal data from:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You directly</li>
          <li>Your use of our website and services</li>
          <li>Devices, apps, or services you connect to our platform</li>
          <li>Analytics providers</li>
          <li>Hosting, infrastructure, or support vendors</li>
          <li>Communication channels such as email or customer support forms</li>
        </ul>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">3. How We Use Personal Data</h2>
        <p>We may use personal data for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and operate our website and services</li>
          <li>To create and manage user accounts</li>
          <li>To respond to inquiries and support requests</li>
          <li>To improve functionality, reliability, and user experience</li>
          <li>To analyze usage trends and platform performance</li>
          <li>To generate sleep and wellness insights</li>
          <li>To maintain security, monitor abuse, and prevent fraud</li>
          <li>To comply with legal, regulatory, or contractual obligations</li>
          <li>To communicate service updates, policy changes, or operational notices</li>
        </ul>
        <p className="mt-4">We do not use personal data for purposes that are materially inconsistent with this Privacy Policy without appropriate notice.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">4. Legal or Processing Basis</h2>
        <p>Where required by applicable law, we process personal data based on one or more of the following:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your consent</li>
          <li>Performance of a contract or provision of requested services</li>
          <li>Compliance with legal obligations</li>
          <li>Our legitimate interests, including maintaining and improving our services, securing our platform, and communicating with users, provided such interests do not override applicable user rights</li>
        </ul>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">5. Health and Sensitive Data</h2>
        <p>Because our platform may involve sleep- or wellness-related information, we treat such information with heightened care.</p>
        <p>Unless explicitly stated otherwise, our platform is intended for general wellness, educational, and informational purposes and is not a medical diagnostic or treatment service.</p>
        <p>Where required by law, we will obtain appropriate consent before processing sensitive categories of data.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">6. Sharing of Data</h2>
        <p>We may share personal data only where reasonably necessary, including with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Cloud hosting and infrastructure providers</li>
          <li>Analytics providers</li>
          <li>Authentication and security vendors</li>
          <li>Customer support or communications providers</li>
          <li>Professional advisers, auditors, or legal counsel</li>
          <li>Authorities or regulators where required by law</li>
        </ul>
        <p className="mt-4">We do not sell personal data in the ordinary meaning of “selling data.” We do not disclose health-related data for advertising targeting in a manner inconsistent with our stated commitments.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">7. International Data Transfers</h2>
        <p>Your data may be processed in countries outside your country of residence, including where our service providers operate. Where cross-border transfers occur, we take reasonable steps to ensure appropriate safeguards are in place consistent with applicable legal requirements.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">8. Data Retention</h2>
        <p>We retain personal data only for as long as reasonably necessary for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>the purposes described in this Privacy Policy,</li>
          <li>account administration,</li>
          <li>legal, tax, audit, and compliance obligations,</li>
          <li>dispute resolution,</li>
          <li>enforcement of agreements, and</li>
          <li>security or fraud-prevention purposes.</li>
        </ul>
        <p className="mt-4">Retention periods may vary depending on the type of data and the purpose of processing.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">9. Your Rights</h2>
        <p>Depending on your location and applicable law, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>access personal data we hold about you</li>
          <li>request correction of inaccurate data</li>
          <li>request deletion of personal data</li>
          <li>request restriction of processing</li>
          <li>object to certain processing</li>
          <li>request data portability</li>
          <li>withdraw consent where processing is based on consent</li>
          <li>lodge a complaint with a relevant supervisory authority or regulator</li>
        </ul>
        <p className="mt-4">To exercise your rights, please contact us using the contact details below.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">10. Cookies and Tracking</h2>
        <p>Our use of cookies and similar technologies is described in our Cookie Policy. Where required, we will provide a consent mechanism that allows you to accept, reject, or manage non-essential cookies.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">11. Children and Minors</h2>
        <p>Our services are not intended for children below the age permitted by applicable law without appropriate parental or guardian involvement where required.</p>
        <p>If we learn that we have collected personal data from a child in a manner inconsistent with applicable law, we will take reasonable steps to delete or otherwise handle that data appropriately.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">12. Security</h2>
        <p>We use reasonable administrative, technical, and organizational safeguards designed to protect personal data against unauthorized access, loss, misuse, alteration, or disclosure. However, no system can be guaranteed to be completely secure.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">13. Third-Party Links and Services</h2>
        <p>Our website may contain links to third-party websites, services, or integrations. We are not responsible for the privacy practices of third parties. You should review their privacy notices separately.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">14. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. When we do, we will revise the “Last updated” date and, where appropriate, provide additional notice.</p>
      </div>
    </LegalPageTemplate>
  );
};
