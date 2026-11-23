import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Phone, FileText, Users, Send, Clock } from 'lucide-react';
import { EstimateNotice } from '../../components/common/EstimateNotice';
import { OFFICE } from '../../components/common/ContactStrip';

export const HowItWorksPage: React.FC = () => {
  const stages = [
    {
      num: '01',
      title: 'Initial Consultation & Eligibility Check',
      ourRole:
        'A counsellor reviews your passport validity, education, work history, language ability and target destination, then explains which visa categories are realistically open to you.',
      yourRole:
        'Attend the consultation (in person or by phone) and bring your passport, NID, academic documents and any employer offer letter.',
      time: 'Same day at our office, or scheduled online.',
    },
    {
      num: '02',
      title: 'Case Registration & Client Portal Access',
      ourRole:
        'Your file is opened in our management system, a case officer is assigned, and you receive a client ID plus portal credentials.',
      yourRole:
        'Confirm the contact number on file so appointment reminders reach you, and sign in to the portal once.',
      time: 'Usually completed within one working day of agreement to proceed.',
    },
    {
      num: '03',
      title: 'Document Collection, Verification & Attestation',
      ourRole:
        'We check every document for correctness and expiry, arrange medical screening where the route requires it, and handle translation, notarisation and attestation.',
      yourRole:
        'Submit the originals or certified copies listed for your case, and respond promptly if we request a correction.',
      time: 'Depends on how many documents need attestation.',
    },
    {
      num: '04',
      title: 'Application Submission & Authority Review',
      ourRole:
        'The complete file is submitted through the relevant labour ministry, immigration department, university portal or consular channel. Every milestone is recorded against your case.',
      yourRole:
        'Remain reachable for follow-up questions, and keep your passport available for endorsement or visa stamping.',
      time: 'Authority processing — we track it and update your portal.',
    },
    {
      num: '05',
      title: 'Decision, Passport Handover & Pre-Departure Steps',
      ourRole:
        'When a decision arrives we update your portal, explain what it means, and arrange passport handover, clearance registration and travel guidance where they apply.',
      yourRole:
        'Collect your passport and any clearance card, and follow the pre-departure instructions published for your case.',
      time: 'Scheduled with you as each milestone is confirmed.',
    },
  ];

  const portalFeatures = [
    {
      icon: Clock,
      title: 'Your current step',
      desc: 'See which stage your case is in and what happens next.',
    },
    {
      icon: FileText,
      title: 'Document status',
      desc: 'Check whether each submitted paper is received, under review, verified or needs correction.',
    },
    {
      icon: Users,
      title: 'Your own records only',
      desc: 'The portal shows only the case linked to your own login.',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Methodology &amp; Standards
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            How our consultancy works
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Five stages from first conversation to outcome. For each one we list what we handle and what we need from
            you — so there are no surprises about who does what.
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <ol className="space-y-6">
          {stages.map((stage) => (
            <li
              key={stage.num}
              className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-8 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-lg sm:text-xl font-serif shrink-0 shadow-md">
                  {stage.num}
                </div>

                <div className="grow space-y-4 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-brand-navy font-serif">{stage.title}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-brand-bg rounded-lg border border-slate-200/80 p-3.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-dark" />
                        <span>What we handle</span>
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">{stage.ourRole}</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg border border-slate-200/80 p-3.5">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-navy mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
                        <span>What you need to do</span>
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">{stage.yourRole}</p>
                    </div>
                  </div>

                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-brand-gold-dark shrink-0" />
                    <span>{stage.time}</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <EstimateNotice className="mt-10" />

        {/* Portal section */}
        <div className="mt-12 bg-brand-navy text-white rounded-2xl p-6 sm:p-9 border border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold font-serif mb-2">Follow your case from the client portal</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Your passport number is your login identifier. The portal shows the stage you are in, the date of your next
            procedure and the verification status of every document you have submitted.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {portalFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <Icon className="w-5 h-5 text-brand-gold mb-2" />
                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/login?portal=client"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-colors min-h-[48px]"
            >
              <span>Client Portal Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition-colors min-h-[48px]"
            >
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Call {OFFICE.hotline}</span>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center space-y-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-all shadow-md min-h-[48px]"
          >
            <Send className="w-4 h-4" />
            <span>Start With a Consultation</span>
          </Link>
          <p className="text-xs text-slate-500">No obligation — we will tell you honestly whether we can help.</p>
        </div>
      </section>
    </div>
  );
};
