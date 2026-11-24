import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { CONTINENTS_AND_COUNTRIES } from '../../data/continents';
import {
  Briefcase,
  GraduationCap,
  Plane,
  Globe2,
  Building2,
  FileCheck2,
  Send,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { EstimateNotice } from '../../components/common/EstimateNotice';

interface ServiceDefinition {
  title: string;
  subtitle: string;
  description: string;
  destinations: string[];
  requiredDocuments: string[];
  procedures: string[];
  /** What the client must do at each stage. */
  clientResponsibilities: string[];
  /** Planning estimate for our own handling steps (not an authority guarantee). */
  estimate: string;
  icon: any;
}

export const ServicesPage: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>('work-permit');
  const [selectedContinent, setSelectedContinent] = useState('Asia');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    destinationCountry: 'Malaysia',
    visaType: 'Work Permit',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const servicesData: Record<string, ServiceDefinition> = {
    'work-permit': {
      title: 'Work Permit & Employment Visas',
      subtitle: 'Employment permit and calling visa assistance',
      description:
        'We prepare and manage files for candidates seeking lawful foreign employment permits in manufacturing, construction, hospitality, agriculture and technical sectors. Our team coordinates with overseas employers, labour ministries and consular sections on your behalf.',
      destinations: ['Malaysia', 'Cyprus', 'Belarus', 'Romania', 'Bosnia and Herzegovina', 'Serbia', 'North Macedonia'],
      requiredDocuments: [
        'Valid passport (usually minimum 6 months validity remaining)',
        'Police clearance certificate issued by the Bangladesh Police',
        'National ID (NID) card copy, plus the original for verification',
        'Medical fitness certificate from an approved centre',
        'Recent biometric studio photographs',
        'Trade or skill training certificates, if applicable',
      ],
      procedures: [
        'Eligibility review and employer demand verification',
        'File opening and document collection with a case officer assigned',
        'Attestation of police clearance and medical screening coordination',
        'Work permit / calling visa submission to the relevant authority',
        'Decision tracking, visa stamping and pre-departure handover',
      ],
      clientResponsibilities: [
        'Attend the consultation and submit the listed originals for verification.',
        'Attend the medical examination on the date we schedule with you.',
        'Keep your passport available for endorsement and visa stamping.',
        'Respond promptly to correction requests published in your portal.',
      ],
      estimate: 'Typically a multi-stage process measured in months; the exact duration depends on the destination authority and quota availability.',
      icon: Briefcase,
    },
    'student-visa': {
      title: 'Higher Education & Student Visas',
      subtitle: 'Admissions support and student visa filing',
      description:
        'Advisory and filing support for students aiming at accredited universities in Europe, Asia and North America. We help with course selection, offer letters, financial documentation and the student visa submission itself.',
      destinations: ['Malaysia (EMGS)', 'Cyprus', 'Belarus (medical universities)', 'Hungary', 'Germany', 'United Kingdom'],
      requiredDocuments: [
        'Original academic transcripts and certificates',
        'Valid passport (all biographical pages)',
        'Proof of financial solvency or sponsor bank statement',
        'Official university offer or acceptance letter',
        'English proficiency certificate, where the institution requires one',
        'Police clearance and medical certificate',
      ],
      procedures: [
        'Academic profile review and programme matching',
        'University application and offer letter collection',
        'Tuition deposit and financial solvency documentation',
        'Student visa file submission and interview or biometrics appointment',
        'Decision tracking, passport collection and pre-departure briefing',
      ],
      clientResponsibilities: [
        'Provide complete and genuine academic records.',
        'Meet university and immigration financial requirements on time.',
        'Attend the embassy or biometrics appointment in person.',
        'Confirm your enrolment conditions once the offer is issued.',
      ],
      estimate:
        'Admission and visa timelines vary by institution and country. We share a planning schedule for your specific case once your profile is assessed.',
      icon: GraduationCap,
    },
    'tourist-visa': {
      title: 'Tourist & Business Visas',
      subtitle: 'Visit, leisure and commercial entry visas',
      description:
        'File preparation, itinerary documentation and embassy appointment scheduling for holiday travel, commercial meetings, exhibitions and family visits.',
      destinations: ['Schengen Area (Europe)', 'Malaysia', 'Singapore', 'Thailand', 'United Arab Emirates', 'Türkiye'],
      requiredDocuments: [
        'Valid passport with previous travel history',
        'Six-month bank statement and solvency certificate',
        'Employment NOC or company trade licence, on letterhead',
        'Confirmed round-trip flight itinerary and hotel reservation',
        'Visiting card and photographs in the embassy’s required format',
      ],
      procedures: [
        'Itinerary consultation and document checklist review',
        'Application file preparation and cover letter drafting',
        'Embassy or visa centre appointment booking',
        'Biometrics submission and tracking with the consulate',
        'Decision tracking, passport collection and handover',
      ],
      clientResponsibilities: [
        'Confirm your travel dates and itinerary before we file.',
        'Provide genuine bank statements that match your stated travel budget.',
        'Attend biometrics in person at the appointment we arrange.',
        'Reconfirm travel plans if your dates change after filing.',
      ],
      estimate:
        'Consular processing times differ by country and are set by the embassy. We submit promptly and keep you updated in your portal.',
      icon: Plane,
    },
    'europe-visa': {
      title: 'Europe & Schengen Area Visas',
      subtitle: 'Work authorisation and residence permit filing',
      description:
        'Consultancy for European seasonal and permanent work permits, along with business and academic visas. Our files are prepared to the documentation standards required by the destination authority and consulate.',
      destinations: ['Romania', 'Poland', 'Hungary', 'Croatia', 'Germany', 'Italy'],
      requiredDocuments: [
        'Valid passport, all pages clearly scanned',
        'Apostilled or notarised police clearance certificate',
        'Academic and vocational certificates with certified translations',
        'Medical screening reports where the route requires them',
        'Work contract copy and employer registration details',
      ],
      procedures: [
        'Employer-driven work authorisation application in the host country',
        'Official work permit document issuance',
        'Embassy or visa centre appointment booking',
        'In-person biometrics and visa interview submission',
        'Visa collection and arrival coordination',
      ],
      clientResponsibilities: [
        'Share your employer and contract details so we can file correctly.',
        'Arrange certified translations and apostilles where required.',
        'Travel for the biometrics appointment — in person is mandatory.',
        'Keep copies of all submitted documents for your own records.',
      ],
      estimate:
        'Work authorisation depends on the employer’s registration and the host country’s labour market conditions. Durations are confirmed in writing before we start.',
      icon: Globe2,
    },
    'malaysia-visa': {
      title: 'Malaysia Visa Processing (Work & Study)',
      subtitle: 'Calling visa (VDR) and EMGS programme handling',
      description:
        'Specialist handling for Malaysian calling visas in the plantation, construction and manufacturing sectors, and for EMGS university admissions.',
      destinations: ['Kuala Lumpur', 'Penang', 'Johor', 'Selangor'],
      requiredDocuments: [
        'Valid passport with sufficient remaining validity',
        'FOMEMA / GAMCA medical screening clearance',
        'Digital police clearance certificate',
        'Passport photographs on white background in the required size',
        'Academic documents for EMGS student applications',
      ],
      procedures: [
        'File registration and biometric document check',
        'FOMEMA medical screening at an approved diagnostic centre',
        'Calling visa submission to Malaysian Immigration',
        'VDR issuance and High Commission visa stamping',
        'Clearance registration and departure preparation',
      ],
      clientResponsibilities: [
        'Attend FOMEMA medical screening at the centre we assign.',
        'Submit passport photos that meet the exact size specification.',
        'Keep your passport with us for the stamping stage.',
        'Complete any pre-departure briefing we schedule.',
      ],
      estimate:
        'Malaysian calling visa processing runs through several agencies, so it is measured in months. Your portal shows the current stage and scheduled date.',
      icon: Building2,
    },
    'cyprus-visa': {
      title: 'Cyprus Employment & Student Visas',
      subtitle: 'Ministry of Labour employment permits',
      description:
        'Application management for Republic of Cyprus employment contracts in hospitality, agriculture and elder care, as well as college admissions in Nicosia and Limassol.',
      destinations: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'],
      requiredDocuments: [
        'Original passport',
        'Police clearance and medical screening with the required attestation',
        'Employment contract certified by the Ministry of Labour',
        'Bank solvency evidence or sponsor affidavit',
      ],
      procedures: [
        'Employment contract authentication through the Cyprus authorities',
        'Entry permit issuance by the Civil Registry and Migration Department',
        'Embassy submission and visa stamping',
        'Flight booking and arrival registration guidance',
      ],
      clientResponsibilities: [
        'Provide the signed and certified employment contract.',
        'Complete the medical screening within the validity window we give you.',
        'Attend the embassy appointment in person.',
        'Confirm arrival dates so the registration step can be scheduled.',
      ],
      estimate:
        'The permit depends on contract authentication and consular processing in Cyprus. We confirm the expected sequence before engagement.',
      icon: FileCheck2,
    },
    'belarus-visa': {
      title: 'Belarus Work & University Visas',
      subtitle: 'Ministry of Internal Affairs work permits',
      description:
        'Assistance for Belarus technical employment permits and for study admissions at medical and engineering universities.',
      destinations: ['Minsk', 'Grodno', 'Gomel', 'Vitebsk'],
      requiredDocuments: [
        'Passport with sufficient remaining validity',
        'Educational credentials translated and notarised',
        'Police clearance certificate',
        'Medical fitness certificate',
      ],
      procedures: [
        'Official invitation and permit acquisition from the Belarusian authorities',
        'Embassy visa filing at the responsible consulate',
        'Visa sticker collection and travel clearance',
      ],
      clientResponsibilities: [
        'Arrange notarised translation of your civil documents.',
        'Complete the medical examination at the centre we assign.',
        'Attend the consular appointment with all originals.',
      ],
      estimate:
        'Belarusian work permits involve a Ministry of Internal Affairs invitation before any consular step. We confirm the current requirement when we open your file.',
      icon: FileCheck2,
    },
    'other-visas': {
      title: 'Other Specialized Visa Services',
      subtitle: 'Family, transit and document attestation assistance',
      description:
        'Case-by-case assistance for family reunion routes, MOFA document attestation, transit visas and emergency travel documentation.',
      destinations: ['Case specific — assessed individually'],
      requiredDocuments: [
        'Passport and government issued identity documents',
        'Relevant civil documents (for example nikah nama, birth certificates)',
        'Case specific affidavits or supporting letters',
      ],
      procedures: [
        'Individual case assessment with a counsellor',
        'Ministry attestation and notarisation arrangements',
        'Consular submission and tracking',
      ],
      clientResponsibilities: [
        'Explain your situation clearly so we can assess feasibility.',
        'Provide every civil document that relates to the case.',
        'Be available for consular questioning or extra documentation if requested.',
      ],
      estimate:
        'Handling times depend entirely on the specific route and the documents involved. We provide a written scope and estimate after assessment.',
      icon: Globe2,
    },
  };

  // Keep the tab in sync with the /services/:id route.
  useEffect(() => {
    if (id && servicesData[id]) {
      setActiveTab(id);
      setFormData((prev) => ({ ...prev, visaType: servicesData[id].title }));
    }
  }, [id]);

  const currentService = servicesData[activeTab] || servicesData['work-permit'];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name as printed on your passport.';
    }
    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Enter a Bangladeshi mobile number, e.g. 01XXXXXXXXX or +880 1XXXXXXXXX.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address so we can send your assessment.';
    }
    if (formData.message.trim().length < 10) {
      errors.message = 'Please add a little more detail (at least 10 characters) about your background and goal.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateForm()) {
      setSubmitStatus({
        success: false,
        message: 'Please correct the highlighted fields and submit again.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await api.post('/inquiries', formData);
      setSubmitStatus({
        success: true,
        message:
          res.message ||
          'Your inquiry has been received. A case officer will contact you during office hours.',
      });
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        destinationCountry: 'Malaysia',
        visaType: currentService.title,
        message: '',
      });
      setFieldErrors({});
    } catch (err: any) {
      setSubmitStatus({
        success: false,
        message: err.message || 'We could not submit your inquiry. Please try again or call our hotline.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // An unknown /services/:id must not silently fall back to the first service.
  if (id && !servicesData[id]) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Visa Programs &amp; Requirements
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            Visa Services &amp; Requirements
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            For each visa category: which documents we need, how the procedure runs, and what you are expected to do
            at each stage.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Service Tabs Sidebar */}
          <nav
            aria-label="Visa service categories"
            className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-2 shadow-xs space-y-1 lg:sticky lg:top-24"
          >
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              Select Visa Program
            </div>
            {Object.entries(servicesData).map(([key, svc]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
                  setFormData((prev) => ({ ...prev, visaType: svc.title }));
                }}
                aria-current={activeTab === key ? 'true' : undefined}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between gap-2 min-h-[48px] ${
                  activeTab === key
                    ? 'bg-brand-navy text-brand-gold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{svc.title}</span>
                <span className="text-xs opacity-60 shrink-0" aria-hidden="true">
                  →
                </span>
              </button>
            ))}

            <div className="pt-3 pb-2 px-3">
              <Link
                to="/countries"
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-brand-navy hover:bg-slate-50 transition-colors min-h-[44px]"
              >
                <span>Browse all destinations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </nav>

          {/* Service Details Main Area */}
          <div className="lg:col-span-8 space-y-8">
            <article className="bg-white rounded-xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <header className="border-b border-slate-100 pb-5">
                <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider block">
                  {currentService.subtitle}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif mt-1">
                  {currentService.title}
                </h2>
              </header>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {currentService.description}
              </p>

              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-3">
                  Destinations we currently handle
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentService.destinations.map((dest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      {dest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Required Documents */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-brand-gold-dark" />
                    <span>Documents to bring</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {currentService.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    Bring the original where possible. Requirements can vary by case, so we confirm the exact list with
                    you at the consultation.
                  </p>
                </div>

                {/* Procedure */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-brand-gold-dark" />
                    <span>How the procedure runs</span>
                  </h3>
                  <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside">
                    {currentService.procedures.map((proc, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="font-medium text-slate-800">{proc}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Client responsibilities */}
              <div className="pt-5 border-t border-slate-100">
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 mb-3">
                  <UserCheck className="w-4 h-4 text-brand-gold-dark" />
                  <span>What you need to do</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentService.clientResponsibilities.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 bg-brand-bg border border-slate-200/80 rounded-lg px-3 py-2.5 leading-relaxed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="flex items-start gap-2 mt-4 text-xs text-slate-500 leading-relaxed">
                  <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                  <span>{currentService.estimate}</span>
                </p>
              </div>

              <EstimateNotice compact />
            </article>

            {/* Inquiry Form Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-8 space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-brand-navy font-serif">
                  Ask about {currentService.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Tell us your background and we will reply during office hours. For an immediate answer, call the
                  hotline.
                </p>
              </div>

              {submitStatus && (
                <div
                  role={submitStatus.success ? 'status' : 'alert'}
                  className={`p-4 rounded-lg flex items-start gap-3 text-sm ${
                    submitStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inq-name" className="field-label">
                      Full name (as on your passport) *
                    </label>
                    <input
                      id="inq-name"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Mohammad Ali"
                      aria-invalid={!!fieldErrors.fullName}
                      aria-describedby={fieldErrors.fullName ? 'inq-name-error' : undefined}
                      className={`field-input ${fieldErrors.fullName ? 'border-red-400' : ''}`}
                    />
                    {fieldErrors.fullName && (
                      <p id="inq-name-error" className="field-error">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="inq-phone" className="field-label">
                      Phone / WhatsApp number *
                    </label>
                    <input
                      id="inq-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 1XXXXXXXXX"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={`inq-phone-hint${fieldErrors.phone ? ' inq-phone-error' : ''}`}
                      className={`field-input ${fieldErrors.phone ? 'border-red-400' : ''}`}
                    />
                    <p id="inq-phone-hint" className="field-hint">
                      The number you can answer during office hours (Sat–Thu, 11 AM–6 PM).
                    </p>
                    {fieldErrors.phone && (
                      <p id="inq-phone-error" className="field-error">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inq-email" className="field-label">
                      Email address *
                    </label>
                    <input
                      id="inq-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'inq-email-error' : undefined}
                      className={`field-input ${fieldErrors.email ? 'border-red-400' : ''}`}
                    />
                    {fieldErrors.email && (
                      <p id="inq-email-error" className="field-error">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="inq-visa-type" className="field-label">
                      Visa category of interest *
                    </label>
                    <select
                      id="inq-visa-type"
                      name="visaType"
                      required
                      value={formData.visaType}
                      onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                      className="field-input"
                    >
                      {Object.values(servicesData).map((svc) => (
                        <option key={svc.title} value={svc.title}>
                          {svc.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inq-continent" className="field-label">
                      Continent
                    </label>
                    <select
                      id="inq-continent"
                      name="continent"
                      value={selectedContinent}
                      onChange={(e) => {
                        const contName = e.target.value;
                        setSelectedContinent(contName);
                        const cont = CONTINENTS_AND_COUNTRIES.find((c) => c.name === contName);
                        if (cont && cont.countries.length > 0) {
                          setFormData({ ...formData, destinationCountry: cont.countries[0].name });
                        }
                      }}
                      className="field-input"
                    >
                      {CONTINENTS_AND_COUNTRIES.map((cont) => (
                        <option key={cont.name} value={cont.name}>
                          {cont.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="inq-country" className="field-label">
                      Target country
                    </label>
                    <select
                      id="inq-country"
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                      className="field-input"
                    >
                      {CONTINENTS_AND_COUNTRIES.find((c) => c.name === selectedContinent)?.countries.map((ctry) => (
                        <option key={ctry.name} value={ctry.name}>
                          {ctry.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="inq-message" className="field-label">
                    Your background and question *
                  </label>
                  <textarea
                    id="inq-message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="e.g. I have a diploma in CNC machining and 3 years of experience. I am looking for a work permit in Malaysia."
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={`inq-message-hint${fieldErrors.message ? ' inq-message-error' : ''}`}
                    className={`field-input ${fieldErrors.message ? 'border-red-400' : ''}`}
                  />
                  <p id="inq-message-hint" className="field-hint">
                    Education, work experience and the country you are aiming for help us answer properly.
                  </p>
                  {fieldErrors.message && (
                    <p id="inq-message-error" className="field-error">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-navy text-white text-sm font-bold hover:bg-brand-navy-light transition-all disabled:opacity-50 min-h-[48px]"
                  >
                    <Send className="w-4 h-4 text-brand-gold" />
                    <span>{submitting ? 'Submitting…' : 'Submit Inquiry'}</span>
                  </button>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We use your details only to respond to this inquiry. See our{' '}
                    <Link to="/privacy" className="text-brand-navy underline underline-offset-2 font-semibold">
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
