import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight, Phone } from 'lucide-react';
import { OFFICE } from '../../components/common/ContactStrip';

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I track my visa application?',
      a: 'When your file is opened you receive a client ID and portal credentials. Sign in to the Client Portal with your passport number, and you will see your current step, the date of your next procedure, and the verification status of every document you have submitted.',
    },
    {
      q: 'Why can I only view my case in the portal?',
      a: 'The portal is deliberately read-only. Document uploads, verification decisions and status changes are made by authorised case officers so that your file is never altered by mistake. You still see everything about your own case that matters, including corrections we need from you.',
    },
    {
      q: 'Do you guarantee visa approval?',
      a: 'No. No private consultancy can guarantee a visa decision. Approval rests entirely with the destination country\'s immigration authority or embassy, and depends on their rules, quotas and assessment of your individual case. What we can promise is thorough eligibility advice, correct documentation, active follow-up and honest updates.',
    },
    {
      q: 'How long does a visa application take?',
      a: 'Timelines differ by destination, visa type, employer sponsorship and the authority\'s own workload. Any duration we quote is a planning estimate for our own handling steps, not a guarantee from the authority, and it can change while your file is with them. Your portal always shows the current scheduled date for your case.',
    },
    {
      q: 'What should I do if a document shows "Correction Required"?',
      a: 'Your case officer will contact you with the specific correction needed — for example a clearer scan, a missing attestation or an expired certificate. Bring the corrected original to our office during working hours and we will re-verify it the same day.',
    },
    {
      q: 'Do I get a receipt for payments?',
      a: 'Yes. Every payment is recorded in our ledger with a numbered receipt (for example TVG-REC-2026-0001). Cash, bank transfer, bKash and Nagad are all accepted, and a recorded payment can only be reversed with a documented reason rather than deleted.',
    },
    {
      q: 'Which documents should I bring to my first appointment?',
      a: 'For most consultations: your valid passport, a copy of your NID card, police clearance certificate, academic transcripts and certificates, any medical report, and an employer offer letter if you already have a sponsor. Requirements vary by destination and visa type, so check the service page or call us beforehand.',
    },
    {
      q: 'How is my personal information protected?',
      a: 'Passport and NID numbers are encrypted before they are stored and are displayed masked (for example A123****78). Your client portal shows only records linked to your own login. Uploaded documents are kept in a private vault and are never published at a public URL.',
    },
    {
      q: 'Can I start an application entirely online?',
      a: 'You can submit an inquiry and book a consultation slot online. Your file opening and document collection happen through our office, because most routes require original documents to be verified in person.',
    },
    {
      q: 'How do I reach you if something changes in my case?',
      a: 'Call the hotline on ' + OFFICE.hotline + ' (Saturday to Thursday, 11:00 AM to 6:00 PM), email ' + OFFICE.email + ', or speak to your assigned case officer. Appointment reminders and document requests are also published in your portal.',
    },
  ];

  return (
    <div className="space-y-14 pb-20">
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Got Questions?
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            How our process works, what we can and cannot promise, and how to find your case.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const buttonId = `faq-question-${idx}`;
          const panelId = `faq-answer-${idx}`;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-brand-navy hover:text-brand-gold-dark transition-colors min-h-[56px]"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  <span className="shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-brand-gold" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </span>
                </button>
              </h3>
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-4 sm:px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4"
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Still need help */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-brand-bg border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-brand-gold-dark mx-auto" />
          <h2 className="text-xl font-bold text-brand-navy font-serif">Still have a question?</h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            Speak to a counsellor directly, or book a consultation slot so we can look at your documents properly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white text-brand-navy font-bold text-sm hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              <Phone className="w-4 h-4 text-brand-gold-dark" />
              <span>{OFFICE.hotline}</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-navy text-white font-bold text-sm hover:bg-brand-navy-light transition-colors min-h-[48px]"
            >
              <span>Book a Consultation</span>
              <ArrowRight className="w-4 h-4 text-brand-gold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
