import React from 'react';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';

export const CookiePolicy: React.FC = () => {
  return (
    <LegalPageTemplate
      title="Cookie Policy"
      lastUpdated="March 19, 2026"
      breadcrumbs={[{ label: 'Legal', link: '/legal' }, { label: 'Cookie Policy' }]}
    >
      <div className="text-slate-300 leading-relaxed space-y-6">
        <p>This Cookie Policy explains how SomnoAI Digital Sleep Lab uses cookies and similar technologies on our website.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">1. What Are Cookies?</h2>
        <p>Cookies are small text files stored on your browser or device when you visit a website. They help websites function properly, remember preferences, measure performance, and improve user experience.</p>
        <p>We may also use similar technologies such as pixels, tags, scripts, and local storage.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">2. Types of Cookies We Use</h2>
        
        <h3 className="text-xl font-bold text-white mt-8 mb-4">a. Strictly Necessary Cookies</h3>
        <p>These cookies are required for the website to function properly. They may support:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>page navigation</li>
          <li>account login</li>
          <li>security</li>
          <li>session management</li>
          <li>consent preferences</li>
        </ul>
        <p className="mt-4">These cookies generally cannot be switched off through our site because they are essential to core operation.</p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">b. Functional Cookies</h3>
        <p>These cookies help remember user choices and improve usability, such as:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>language settings</li>
          <li>interface preferences</li>
          <li>saved user selections</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">c. Analytics Cookies</h3>
        <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us measure:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>page views</li>
          <li>traffic sources</li>
          <li>user journeys</li>
          <li>error rates</li>
        </ul>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">d. Marketing and Targeting Cookies</h3>
        <p>We may use these cookies to track visitors across websites in order to display relevant advertisements or measure the effectiveness of marketing campaigns. We do not use health or sleep data for advertising targeting.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">3. Third-Party Cookies</h2>
        <p>Some cookies may be placed by third-party service providers (such as analytics platforms, video hosting services, or payment processors) that perform services on our behalf.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">4. Managing Your Cookie Preferences</h2>
        <p>You have the right to choose whether to accept or reject non-essential cookies.</p>
        
        <h3 className="text-xl font-bold text-white mt-8 mb-4">a. Cookie Banner / Preference Center</h3>
        <p>Where required by law, we provide a cookie banner or preference center that allows you to manage your consent for non-essential cookies.</p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">b. Browser Settings</h3>
        <p>Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options," "Preferences," or "Settings" menu of your browser. Please note that disabling all cookies (including strictly necessary cookies) may impact the functionality of our website.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">5. Updates to This Policy</h2>
        <p>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. Please review this page periodically for updates.</p>
      </div>
    </LegalPageTemplate>
  );
};
