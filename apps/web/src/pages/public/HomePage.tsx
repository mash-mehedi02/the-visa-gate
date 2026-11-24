import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Users,
  Globe2,
  Building2,
  GraduationCap,
  Plane,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Clock,
  Lock,
  ListChecks,
  FileSearch,
  Send,
  Activity
} from 'lucide-react';
import { ContactStrip, OFFICE } from '../../components/common/ContactStrip';
import { EstimateNotice } from '../../components/common/EstimateNotice';

export const HomePage: React.FC = () => {
  const visaServices = [
    {
      title: 'Work Permit Visas',
      desc: 'Employment and calling visa assistance for skilled, semi-skilled and technical workers, including employer coordination and document preparation.',
      icon: Briefcase,
      link: '/services/work-permit',
      badge: 'Work',
    },
    {
      title: 'Higher Education Visas',
      desc: 'University shortlisting, admission support, EMGS and other student visa filing, plus the financial and academic paperwork each route needs.',
      icon: GraduationCap,
      link: '/services/student-visa',
      badge: 'Academic',
    },
    {
      title: 'Tourist & Business Visas',
      desc: 'Itinerary and financial documentation, cover letters and embassy appointment scheduling for leisure, business and event travel.',
      icon: Plane,
      link: '/services/tourist-visa',
      badge: 'Travel',
    },
    {
      title: 'Europe & Schengen Area',
      desc: 'Work authorisation and residence-permit file preparation for European employers, including notarised documents and embassy biometrics.',
      icon: Globe2,
      link: '/services/europe-visa',
      badge: 'Europe',
    },
    {
      title: 'Malaysia Processing',
      desc: 'Calling visa handling, FOMEMA and GAMCA medical coordination, and High Commission stamping for Malaysian destinations.',
      icon: Building2,
      link: '/services/malaysia-visa',
      badge: 'Malaysia',
    },
    {
      title: 'Cyprus & Belarus Permits',
      desc: 'Ministry-level employment permit tracking and immigration file processing for Eastern Mediterranean and European destinations.',
      icon: FileCheck,
      link: '/services/cyprus-visa',
      badge: 'Permits',
    },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'Consultation & Eligibility Check',
      desc: 'We review your passport, education, work history and target destination, then explain which routes are realistic and what each one requires.',
      clientAction: 'You provide your documents and answer a short questionnaire.',
    },
    {
      num: '02',
      title: 'File Opening & Document Collection',
      desc: 'Your case is opened, a case officer is assigned and you receive a client ID and portal login to track the file.',
      clientAction: 'You submit the listed originals or certified copies at the office.',
    },
    {
      num: '03',
      title: 'Verification & Attestation',
      desc: 'Documents are checked for correctness and, where required, attested or notarised before anything is filed externally.',
      clientAction: 'You respond to correction requests and attend medical or biometric appointments when scheduled.',
    },
    {
      num: '04',
      title: 'Application Submission',
      desc: 'The completed file is submitted through the relevant ministry, university or consular channel, and every milestone is recorded.',
      clientAction: 'You stay available for follow-up questions from the authority.',
    },
    {
      num: '05',
      title: 'Tracking & Outcome',
      desc: 'You follow each step, its scheduled date and your document status in the portal, and we handle passport handover and pre-departure steps.',
      clientAction: 'You check the portal and follow the instructions published for your current step.',
    },
  ];

  const commitments = [
    {
      title: 'Honest advice',
      desc: 'We tell you what is realistic for your profile and what is not, before you pay for anything.',
    },
    {
      title: 'Clear tracking',
      desc: 'Every step, date and document status for your own case is visible in your private portal.',
    },
    {
      title: 'Protected records',
      desc: 'Your passport and NID details are encrypted at rest and shown masked. Documents are never published publicly.',
    },
    {
      title: 'No false guarantees',
      desc: 'We never promise a visa approval. Decisions rest with the destination authority or embassy.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 sm:pb-20">
      {/* Hero Section */}
      <section className="relative bg-brand-navy text-white overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-navy-light via-brand-navy to-[#0A182B] opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="md:col-span-6 lg:col-span-7 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs sm:text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>Visa Consultancy &amp; Application Assistance</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-serif">
                Your Journey. <br />
                <span className="text-brand-gold italic">Our Guidance.</span>
              </h1>

              <p className="text-base lg:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto md:mx-0">
                We help you prepare, file and track work, study and visit visa applications — and show you exactly what
                is happening at every stage.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4">
                <Link
                  to="/contact"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-7 py-3 sm:py-3.5 rounded-lg bg-brand-gold text-brand-navy font-bold text-xs sm:text-base hover:bg-brand-gold-light transition-all shadow-lg shadow-brand-gold/20 min-h-[48px] whitespace-nowrap"
                >
                  <span>Book a Free Consultation</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>

                <Link
                  to="/services"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-7 py-3 sm:py-3.5 rounded-lg border border-white/25 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-base transition-colors min-h-[48px] whitespace-nowrap"
                >
                  <span>Explore Visa Services</span>
                </Link>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                Already applied with us?{' '}
                <Link to="/login?portal=client" className="text-brand-gold font-semibold underline underline-offset-2 hover:text-brand-gold-light">
                  Sign in to the client portal
                </Link>{' '}
                to see your current step and document status.
              </p>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-6 text-center md:text-left">
                <div>
                  <p className="text-base md:text-lg lg:text-3xl font-extrabold text-brand-gold font-serif">Step-by-step</p>
                  <p className="text-xs md:text-xs lg:text-xs text-slate-400 font-medium uppercase mt-1 leading-tight">
                    Published client procedures
                  </p>
                </div>
                <div>
                  <p className="text-base md:text-lg lg:text-3xl font-extrabold text-brand-gold font-serif">Own file only</p>
                  <p className="text-xs md:text-xs lg:text-xs text-slate-400 font-medium uppercase mt-1 leading-tight">
                    Portal shows your records
                  </p>
                </div>
                <div>
                  <p className="text-base md:text-lg lg:text-3xl font-extrabold text-brand-gold font-serif">Encrypted</p>
                  <p className="text-xs md:text-xs lg:text-xs text-slate-400 font-medium uppercase mt-1 leading-tight">
                    Passport &amp; NID stored safely
                  </p>
                </div>
              </div>
            </div>

            {/* Consultation Booking Widget in Hero */}
            <div className="md:col-span-6 lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 md:p-6 lg:p-8 text-slate-800 shadow-2xl border border-slate-100 relative">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center text-brand-gold shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-brand-navy leading-none font-serif">Book a Consultation</h2>
                      <p className="text-xs text-slate-500 mt-1">With a visa counsellor</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-brand-gold/15 text-brand-navy rounded-full shrink-0">
                    Free
                  </span>
                </div>

                <div className="py-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Planning to move, work or study abroad? Bring your passport, academic records and any job offer
                    letter. We will review your profile and explain the realistic options.
                  </p>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="flex items-start gap-2 text-brand-navy font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                      <span>Profile assessment and destination matching</span>
                    </div>
                    <div className="flex items-start gap-2 text-brand-navy font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                      <span>Clear document checklist for your route</span>
                    </div>
                    <div className="flex items-start gap-2 text-brand-navy font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                      <span>Dedicated case officer and portal tracking</span>
                    </div>
                  </div>

                  <Link
                    to="/contact"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-navy text-white font-bold text-sm hover:bg-brand-navy-light transition-all shadow-md min-h-[48px]"
                  >
                    <span>Schedule an Appointment</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </Link>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-center">
                    <a
                      href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
                      className="text-xs text-slate-600 inline-flex items-center gap-1.5 hover:text-brand-navy transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold-dark" />
                      <span>
                        Hotline: <strong className="text-brand-navy">{OFFICE.hotline}</strong>
                      </span>
                    </a>
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Saturday – Thursday, 11:00 AM – 6:00 PM</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider block">
            Our Visa Expertise
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy font-serif">
            Which visa can help you?
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Pick the category closest to your goal. Each page lists the documents, the procedure and the typical
            sequence of steps for that route.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visaServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/80 hover:border-brand-gold/60 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-lg bg-brand-bg group-hover:bg-brand-gold/15 flex items-center justify-center text-brand-navy group-hover:text-brand-gold-dark transition-colors shrink-0">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {svc.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy group-hover:text-brand-gold-dark transition-colors font-serif">
                    {svc.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={svc.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-gold-dark transition-colors"
                  >
                    <span>See Requirements</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works — with client responsibilities */}
      <section className="bg-white py-14 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-14">
            <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider block">
              Clear &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy font-serif">
              How the process works — and what you need to do
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Five stages, from first conversation to outcome. Each one lists what we handle and what we need from you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {processSteps.map((step) => (
              <div key={step.num} className="bg-brand-bg rounded-xl border border-slate-200/80 p-5 sm:p-6 flex flex-col">
                <span className="text-3xl font-black text-brand-gold/50 font-serif block leading-none mb-2">
                  {step.num}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-brand-navy font-serif leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mt-2 grow">{step.desc}</p>
                <p className="mt-4 pt-3 border-t border-slate-200 text-xs text-brand-navy bg-white rounded-lg px-3 py-2.5 leading-relaxed">
                  <strong className="font-bold">Your part:</strong> {step.clientAction}
                </p>
              </div>
            ))}

            <div className="bg-brand-navy text-white rounded-xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <Activity className="w-8 h-8 text-brand-gold mb-3" />
                <h3 className="text-base sm:text-lg font-bold font-serif">Track everything from your portal</h3>
                <p className="text-sm text-slate-300 leading-relaxed mt-2">
                  Once your file is opened you receive a client ID and portal login. You can see your current step,
                  scheduled dates, deadline and the verification status of every document you have submitted.
                </p>
              </div>
              <Link
                to="/login?portal=client"
                className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-colors min-h-[48px]"
              >
                <Lock className="w-4 h-4" />
                <span>Client Portal Sign In</span>
              </Link>
            </div>
          </div>

          <EstimateNotice className="mt-10" />
        </div>
      </section>

      {/* Your Documents Checklist */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider block">
              Prepare Before You Visit
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
              Bring these and we can usually start the same day
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Requirements differ by destination and visa type, but most cases need the following. Bring originals —
              we verify them at the counter.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-navy hover:text-brand-gold-dark transition-colors"
            >
              <span>See the full document checklist per service</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <ul className="space-y-3.5">
              {[
                { icon: FileSearch, label: 'Valid passport', hint: 'Usually with at least 6 months validity remaining' },
                { icon: FileCheck, label: 'National ID (NID) card copy', hint: 'Plus the original for physical verification' },
                { icon: Users, label: 'Police clearance certificate', hint: 'Issued by the relevant authority in Bangladesh' },
                { icon: FileCheck, label: 'Medical fitness report', hint: 'From an approved centre, where the route requires it' },
                { icon: GraduationCap, label: 'Academic and skill certificates', hint: 'Transcripts, degrees and trade certificates' },
                { icon: Briefcase, label: 'Employer offer letter', hint: 'If you already have a sponsor for work permits' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-brand-navy">{item.label}</span>
                      <span className="block text-xs text-slate-500 leading-relaxed">{item.hint}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose The Visa Gate */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-2xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
              Professional Standard
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif">
              What you can expect from us
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We are a private consultancy. We prepare and manage applications on your behalf — we do not issue visas and
              we do not work for any government body.
            </p>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {commitments.map((h) => (
                <div key={h.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">{h.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-all shadow-md min-h-[48px]"
              >
                <span>Speak With a Counsellor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/25 text-white font-bold text-sm hover:bg-white/10 transition-colors min-h-[48px]"
              >
                <ListChecks className="w-4 h-4 text-brand-gold" />
                <span>Read the Full Workflow</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider block">
                Contact Us
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
                Visit, call or send a message
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Walk in during office hours for a document check, or book a slot so a counsellor is free for you.
              </p>

              <div className="pt-4 space-y-3">
                <a
                  href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-gold/60 hover:bg-brand-bg transition-colors"
                >
                  <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Call the hotline</span>
                    <span className="block text-sm font-bold text-brand-navy">{OFFICE.hotline}</span>
                  </span>
                </a>

                <a
                  href={`mailto:${OFFICE.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-gold/60 hover:bg-brand-bg transition-colors break-all"
                >
                  <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email us</span>
                    <span className="block text-sm font-bold text-brand-navy">{OFFICE.email}</span>
                  </span>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                  <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Office</span>
                    <span className="block text-sm font-bold text-brand-navy leading-snug">
                      {OFFICE.addressLine1}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {OFFICE.addressLine2} — {OFFICE.landmark}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <ContactStrip className="sm:grid-cols-2 bg-brand-bg rounded-xl border border-slate-200/80 p-5 sm:p-6" />

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-navy text-white font-bold text-sm hover:bg-brand-navy-light transition-colors min-h-[48px]"
                >
                  <Send className="w-4 h-4 text-brand-gold" />
                  <span>Request a Consultation</span>
                </Link>
                <Link
                  to="/faq"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-brand-navy font-bold text-sm hover:bg-brand-bg transition-colors min-h-[48px]"
                >
                  <span>Read Common Questions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
