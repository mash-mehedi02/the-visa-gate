import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Database, Eye, FileText } from 'lucide-react';
import { OFFICE } from '../../components/common/ContactStrip';

const privacySections = [
  {
    icon: Database,
    title: 'What we collect',
    body: [
      'When you contact us we collect the details you give us: name, phone number, email address, destination country and the visa category you are asking about.',
      'When your file is opened we also record your passport number, National ID number, date of birth, address, emergency contact, academic and employment documents, medical reports and correspondence about your case.',
      'When you make a payment we record the amount, method, date and receipt number so the ledger stays auditable.',
    ],
  },
  {
    icon: Lock,
    title: 'How we protect it',
    body: [
      'Passport and National ID numbers are encrypted before they are written to our records. They are displayed masked (for example A123****78) so they are not exposed on screen or in reports.',
      'Your password is stored only as a one-way hash. It is never written down, emailed or displayed.',
      'Uploaded documents are kept in a private vault. They are not published at a public address and can only be opened by authorised staff handling your case.',
      'Who acts in our system is recorded in an audit log with the action, time and network address.',
    ],
  },
  {
    icon: Eye,
    title: 'Who can see your information',
    body: [
      'Your client portal shows only records linked to your own login. Other clients cannot see your files.',
      'Staff accounts can open the case records they need in the console, and every action they take is recorded in the audit log.',
      'Administrators manage the system and the staff list, and can see the records they need to supervise a case.',
      'We do not sell your personal information, and we do not share it with third parties for their own marketing.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'How long we keep it',
    body: [
      'We keep your file for as long as it is needed to serve your application and to meet legal, accounting and professional record-keeping obligations.',
      'When a file is closed and the retention period has passed, records are deleted or anonymised.',
      'Payment ledger entries and audit records are kept for the period required for financial and compliance review.',
    ],
  },
  {
    icon: FileText,
    title: 'Your choices',
    body: [
      'You can ask us what we hold about you, ask for a correction, or ask us to delete information we are not required to keep.',
      'You can withdraw an inquiry at any time before a file is opened.',
      'You can ask us to stop sending non-essential messages.',
    ],
  },
];

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-14 pb-20">
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Privacy &amp; Data Protection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">Privacy Policy</h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            How The Visa Gate collects, protects and uses your personal information.
          </p>
          <p className="text-xs text-slate-400">Last updated: 24 November 2026.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong className="text-brand-navy">In short:</strong> we collect only what we need to run your visa
            application, we encrypt your most sensitive identifiers, we restrict access to authorised staff, and we never
            sell your data. We are a private consultancy — we are not a government authority, and we do not publish
            client information.
          </p>
        </div>

        {privacySections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title}>
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy font-serif flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-lg bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span>{section.title}</span>
              </h2>
              <ul className="space-y-2.5 pl-0">
                {section.body.map((paragraph, idx) => (
                  <li key={idx} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-2" />
                    <span>{paragraph}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Contact */}
        <div className="bg-brand-navy text-white rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold font-serif mb-2">Privacy questions or requests</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            If you want to know what we hold, correct a detail, or request deletion, contact us during office hours
            and we will respond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${OFFICE.email}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-colors min-h-[48px]"
            >
              {OFFICE.email}
            </a>
            <a
              href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition-colors min-h-[48px]"
            >
              {OFFICE.hotline}
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          See also our{' '}
          <Link to="/terms" className="text-brand-navy font-semibold underline underline-offset-2">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </section>
    </div>
  );
};
