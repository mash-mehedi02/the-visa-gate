import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Scale, FileText, Clock, ShieldCheck } from 'lucide-react';
import { OFFICE } from '../../components/common/ContactStrip';

const termsSections = [
  {
    icon: Scale,
    title: 'Our role',
    body: [
      'The Visa Gate is a private visa consultancy. We assess eligibility, prepare documentation, submit applications on your behalf and track them until a decision is issued.',
      'We do not issue visas, work for or represent any government, embassy or immigration authority, and we cannot influence or guarantee their decisions.',
    ],
  },
  {
    icon: Clock,
    title: 'Timelines and estimates',
    body: [
      'Any duration we publish — including the estimated days shown against a workflow template or a visa program — is a planning estimate for the steps we handle.',
      'Decisions and processing times rest with the destination immigration authority, embassy or university. They can change without notice and are outside our control.',
      'Nothing on this website should be read as a guaranteed processing time or a guaranteed outcome.',
    ],
  },
  {
    icon: FileText,
    title: 'Information you provide',
    body: [
      'You confirm that the documents and information you supply are genuine, complete and accurate, and that you are legally permitted to hold and submit them.',
      'We rely on that information to prepare and file your application. If it is inaccurate or out of date, the authority may refuse the application, and any fees already paid for that stage may not be recoverable from the authority.',
      'You are responsible for the accuracy of information in any document you sign, and for renewing your passport before it expires.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Fees and payment',
    body: [
      'Consultation and service fees, and any government or embassy fees we collect on your behalf, are confirmed in writing before you proceed.',
      'Government and embassy charges are passed through at cost and are set by those authorities. We cannot control or refund them.',
      'Payments are recorded against your case with a numbered receipt. A recorded payment may only be reversed with a documented reason.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Your responsibilities',
    body: [
      'Attend scheduled medical, biometric and embassy appointments on time. A missed appointment can delay or restart the process and extend the timeline.',
      'Respond promptly to requests for corrections. A delayed document delays the whole file.',
      'Do not travel on a visa that has not been issued, and do not create a separate application outside this consultancy without telling us.',
      'Keep your portal credentials confidential. Anyone with your passport number and password can view your case status.',
    ],
  },
];

export const TermsPage: React.FC = () => {
  return (
    <div className="space-y-14 pb-20">
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Engagement &amp; Service Terms
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            The basis on which The Visa Gate provides consultancy and application-handling services.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {termsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title}>
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy font-serif flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-lg bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span>{section.title}</span>
              </h2>
              <ul className="space-y-2.5">
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

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 sm:p-6">
          <h2 className="text-sm font-bold text-amber-900 mb-1.5">No guarantee of outcome</h2>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            We do not guarantee visa approval, and no member of our staff should ever suggest that we can. If you are
            told otherwise, please contact us and we will confirm the position in writing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h2 className="text-sm font-bold text-brand-navy mb-2">Questions about these terms</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Ask before you proceed — we would rather set the expectation clearly at the start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-navy text-white font-bold text-sm hover:bg-brand-navy-light transition-colors min-h-[48px]"
            >
              {OFFICE.hotline}
            </a>
            <Link
              to="/privacy"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-brand-navy font-bold text-sm hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              Read the Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
