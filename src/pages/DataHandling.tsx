import React from 'react';
import { LegalPageTemplate } from '../components/ui/LegalPageTemplate';

export const DataHandling: React.FC = () => {
  return (
    <LegalPageTemplate
      title="How We Handle Your Data"
      lastUpdated="March 18, 2026"
      breadcrumbs={[{ label: 'Legal', link: '/legal' }, { label: 'Data Handling Notice' }]}
    >
      <div className="text-slate-300 leading-relaxed space-y-6">
        <p>At SomnoAI Digital Sleep Lab, we believe privacy commitments should be understandable, specific, and operationally honest. This page summarizes how we handle user data in practical terms.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">1. What Data May Be Handled</h2>
        <p>Depending on how you use the platform, we may handle:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>account and contact details</li>
          <li>uploaded files or submitted information</li>
          <li>sleep or wellness-related data</li>
          <li>device and browser information</li>
          <li>support communications</li>
          <li>system logs and diagnostics</li>
        </ul>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">2. How Data Enters the Platform</h2>
        <p>Data may enter the platform through:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>manual input by users</li>
          <li>account registration</li>
          <li>contact or support forms</li>
          <li>imports from supported third-party integrations</li>
          <li>website usage and analytics tools</li>
        </ul>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">3. Raw Data and Processed Data</h2>
        <p>Depending on the feature, we may process:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>raw data submitted or uploaded by the user</li>
          <li>transformed, standardized, or structured data</li>
          <li>derived outputs such as summaries, patterns, trends, or insights</li>
        </ul>
        <p className="mt-4">Not all data is handled the same way. Processing may vary depending on the function being used.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">4. Whether Data Leaves the Device</h2>
        <p>Some features may require data to be transmitted to our servers or trusted service providers in order to function.</p>
        <p>Where cloud processing is involved, data may be stored or processed on infrastructure operated by us or our vendors.</p>
        <p>We aim to minimize unnecessary data transfer where reasonably possible.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">5. AI and Model Use</h2>
        <p>We may use computational models, statistical methods, rules-based systems, or AI-assisted systems to analyze data, identify patterns, or generate user-facing outputs.</p>
        <p>Unless we explicitly state otherwise, user-submitted data is not sold as a commercial data asset.</p>
        <p>If user data is ever used for model improvement, testing, or product development, such use should be governed by appropriate internal controls, applicable law, and the commitments stated in our policies.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">6. Advertising and Data Sales</h2>
        <p>We do not position our platform as a data brokerage or ad-targeting business.</p>
        <p>We do not intentionally share health-related data for advertising targeting in ways that conflict with our stated commitments.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">7. Third-Party Vendors</h2>
        <p>We may rely on third-party vendors for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>cloud hosting</li>
          <li>analytics</li>
          <li>authentication</li>
          <li>email delivery</li>
          <li>support systems</li>
          <li>security and infrastructure operations</li>
        </ul>
        <p className="mt-4">Where such vendors process personal data on our behalf, we expect them to operate under contractual, technical, or organizational safeguards appropriate to the nature of the data and the service provided.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">8. Security Practices</h2>
        <p>We take reasonable steps to protect data through measures such as:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>encrypted transmission where appropriate</li>
          <li>access controls</li>
          <li>least-privilege practices</li>
          <li>authentication safeguards</li>
          <li>logging and monitoring</li>
          <li>operational review and incident handling processes</li>
        </ul>
        <p className="mt-4">No system is perfect, but we aim to build with security in mind from the start.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">9. Retention and Deletion</h2>
        <p>We do not intend to retain data indefinitely without purpose.</p>
        <p>Data may be retained for service operation, account support, legal compliance, auditing, security, or dispute resolution, after which it may be deleted, anonymized, or otherwise de-identified where appropriate.</p>

        <h2 className="text-2xl font-black mt-12 mb-6 text-indigo-400 uppercase tracking-tight italic">10. Your Requests</h2>
        <p>Where applicable, users may request:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>access to their data</li>
          <li>correction of inaccurate information</li>
          <li>deletion of data</li>
          <li>export of certain data</li>
          <li>withdrawal of consent where relevant</li>
        </ul>
        <p className="mt-4">Requests may be submitted to: <a href="/legal/contact" className="text-indigo-400 hover:text-indigo-300 font-medium">Legal Contact</a>.</p>
      </div>
    </LegalPageTemplate>
  );
};
