import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { OFFICE } from '../../components/common/ContactStrip';

export const ContactPage: React.FC = () => {
  // Step 1: Destination Selection
  const [continents] = useState<string[]>([
    'Asia',
    'Europe',
    'North America',
    'Oceania',
    'Africa',
    'South America',
  ]);
  const [selectedContinent, setSelectedContinent] = useState<string>('Asia');
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  // Step 2: Date & Time Slots
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [slotData, setSlotData] = useState<{ isHoliday: boolean; slots: any[]; message?: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Step 3: Client Information
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [additionalMessage, setAdditionalMessage] = useState<string>('');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);

  // Validation + submission state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Load countries when continent changes
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res: any = await api.get(`/countries?continent=${selectedContinent}`);
        if (res.data) {
          setCountriesError(null);
          setCountries(res.data);
          if (res.data.length > 0) {
            setSelectedCountry(res.data[0]);
            setPrograms(res.data[0].programs || []);
            if (res.data[0].programs && res.data[0].programs.length > 0) {
              setSelectedProgram(res.data[0].programs[0]);
            } else {
              setSelectedProgram(null);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setCountriesError(
          'We could not load the destination list. Please check your connection and try again, or call the hotline.'
        );
      }
    };
    fetchCountries();
  }, [selectedContinent]);

  // Load available time slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedTime('');
        const res: any = await api.get(`/bookings/slots?date=${selectedDate}`);
        if (res.data) {
          setSlotError(null);
          setSlotData(res.data);
        }
      } catch (err) {
        console.error(err);
        setSlotError(
          'We could not load time slots for this date. Please try another date or call the hotline.'
        );
      } finally {
        setLoadingSlots(false);
      }
    };
    if (selectedDate) fetchSlots();
  }, [selectedDate]);

  const handleCountryChange = (cId: string) => {
    const found = countries.find((c) => c.id === cId);
    if (found) {
      setSelectedCountry(found);
      setPrograms(found.programs || []);
      if (found.programs && found.programs.length > 0) {
        setSelectedProgram(found.programs[0]);
      } else {
        setSelectedProgram(null);
      }
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name as it appears on your passport.';
    }

    if (!selectedDate) {
      errors.date = 'Please choose a preferred date.';
    } else if (selectedDate < tomorrowStr) {
      errors.date = 'Please choose a date from tomorrow onwards.';
    }

    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Enter a Bangladeshi mobile number, e.g. 01XXXXXXXXX or +880 1XXXXXXXXX.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errors.email = 'Enter a valid email address so we can send the appointment confirmation.';
    }

    if (!selectedTime) {
      errors.time = 'Please choose an available time slot.';
    }

    if (!privacyConsent) {
      errors.privacyConsent = 'Please confirm you agree to be contacted about this appointment.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      setSubmitError('Please complete the highlighted fields so we can confirm your appointment.');
      return;
    }

    // Never silently fall back to a default country: the user chose a destination.
    if (!selectedCountry) {
      setSubmitError('Please choose a destination country before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        continent: selectedContinent,
        countryId: selectedCountry?.id || '',
        countryName: selectedCountry?.name || '',
        programId: selectedProgram?.id || null,
        programName: selectedProgram ? selectedProgram.programName : 'General Consultation',
        preferredDate: selectedDate,
        preferredTime: selectedTime,
        additionalMessage: additionalMessage.trim(),
        privacyConsent,
      };

      const res: any = await api.post('/bookings', payload);
      setConfirmedBooking(res.data);
    } catch (err: any) {
      setSubmitError(
        err.message || 'We could not confirm the appointment. Please try again or call our hotline.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setConfirmedBooking(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setAdditionalMessage('');
    setSelectedTime('');
    setPrivacyConsent(false);
    setFieldErrors({});
    setSubmitError(null);
  };

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">
      {/* Hero Header */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Direct Corporate Consultation
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            Schedule a Consultation
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reserve a slot with a visa counsellor at our Dhaka office, or request a general eligibility discussion.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Office Details & Working Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy font-serif">Corporate Headquarters</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Visa consultation and physical document verification.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-gold-dark shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-brand-navy text-sm font-semibold">Office Address</strong>
                    <span className="text-xs text-slate-600 block mt-0.5 leading-relaxed">
                      {OFFICE.addressLine1}
                      <br />
                      {OFFICE.addressLine2}
                    </span>
                    <span className="text-xs text-brand-gold-dark font-medium block mt-1">
                      Landmark: {OFFICE.landmark}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-gold-dark shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-brand-navy text-sm font-semibold">Hotlines &amp; WhatsApp</strong>
                    <a
                      href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
                      className="text-xs text-slate-600 block mt-0.5 font-mono hover:text-brand-navy"
                    >
                      {OFFICE.hotline}
                    </a>
                    <a
                      href={`tel:${OFFICE.hotlineAlt.replace(/\s/g, '')}`}
                      className="text-xs text-slate-600 block font-mono hover:text-brand-navy"
                    >
                      {OFFICE.hotlineAlt}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-gold-dark shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-brand-navy text-sm font-semibold">Email</strong>
                    <a
                      href={`mailto:${OFFICE.email}`}
                      className="text-xs text-slate-600 block mt-0.5 hover:text-brand-navy break-all"
                    >
                      {OFFICE.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-bg flex items-center justify-center text-brand-gold-dark shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-brand-navy text-sm font-semibold">Consultation Hours</strong>
                    <span className="text-xs text-slate-600 block mt-0.5">
                      Saturday – Thursday: <strong>11:00 AM – 06:00 PM</strong>
                    </span>
                    <span className="text-xs text-red-600 font-medium block mt-0.5">{OFFICE.fridayNote}</span>
                  </div>
                </div>
              </div>

              {/* Booking Protection Notice */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 text-brand-navy font-bold">
                  <ShieldCheck className="w-4 h-4 text-brand-success" />
                  <span>Slot held pending confirmation</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your slot is held as soon as the form is submitted. A representative will confirm by phone or
                  WhatsApp before your visit.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-brand-bg border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 text-brand-navy font-bold">
                  <Info className="w-4 h-4 text-brand-gold-dark" />
                  <span>Before you book</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bring your passport, NID copy, academic certificates and any employer offer letter. A consultation
                  does not commit you to using our services. The first consultation is free; any service fees are
                  confirmed in writing before you proceed.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Step Consultation Booking Engine */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 lg:p-10 shadow-xs">
            {confirmedBooking ? (
              /* Booking Success Confirmation Card */
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-brand-success flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider block">
                    Appointment Requested
                  </span>
                  <h3 className="text-2xl font-bold text-brand-navy font-serif">
                    Your slot is reserved
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    We will confirm your appointment by phone or WhatsApp before your visit. Keep your reference
                    number handy.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 text-left text-xs max-w-md mx-auto space-y-3">
                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase shrink-0">Booking Reference</span>
                    <strong className="text-brand-navy text-sm font-bold break-all text-right">
                      {confirmedBooking.bookingCode}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase shrink-0">Appointment Date</span>
                    <strong className="text-slate-800 text-right">{confirmedBooking.preferredDate}</strong>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase shrink-0">Appointment Time</span>
                    <strong className="text-brand-gold-dark text-right">{confirmedBooking.preferredTime}</strong>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-200 pb-2">
                    <span className="text-slate-500 uppercase shrink-0">Destination Pathway</span>
                    <span className="text-slate-800 text-right break-words">
                      {confirmedBooking.countryName}
                      {confirmedBooking.programName ? ` (${confirmedBooking.programName})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500 uppercase shrink-0">Applicant</span>
                    <span className="text-slate-800 text-right break-words">{confirmedBooking.fullName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetBooking}
                  className="px-6 py-2.5 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light min-h-[44px]"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              /* Public Booking Form */
              <form onSubmit={handleBookingSubmit} noValidate className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-brand-navy font-serif">
                    Select Destination &amp; Reserve Slot
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Three short steps. Availability is checked live against the counsellors' diary.
                  </p>
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* 1. Continent & Country Selection */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-brand-gold" />
                    <span>1. Destination Selection</span>
                  </legend>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bk-continent" className="field-label">
                        Continent *
                      </label>
                      <select
                        id="bk-continent"
                        value={selectedContinent}
                        onChange={(e) => setSelectedContinent(e.target.value)}
                        className="field-input"
                      >
                        {continents.map((cont) => (
                          <option key={cont} value={cont}>
                            {cont}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="bk-country" className="field-label">
                        Destination country *
                      </label>
                      <select
                        id="bk-country"
                        value={selectedCountry?.id || ''}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="field-input"
                      >
                        {countries.map((ctry) => (
                          <option key={ctry.id} value={ctry.id}>
                            {ctry.name} ({ctry.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {countriesError && (
                    <p className="field-error" role="alert">
                      {countriesError}
                    </p>
                  )}

                  <div>
                    <label htmlFor="bk-program" className="field-label">
                      Visa program / immigration category *
                    </label>
                    <select
                      id="bk-program"
                      value={selectedProgram?.id || ''}
                      onChange={(e) => {
                        const found = programs.find((p) => p.id === e.target.value);
                        setSelectedProgram(found || null);
                      }}
                      className="field-input"
                    >
                      {programs.length > 0 ? (
                        programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.programName} ({p.visaCategory})
                          </option>
                        ))
                      ) : (
                        <option value="">General Eligibility Consultation</option>
                      )}
                    </select>
                    <p className="field-hint">
                      Not sure which one applies? Choose the country and leave this on the general option — we will
                      advise you.
                    </p>
                  </div>
                </fieldset>

                {/* 2. Available Date & Time Slot Selection */}
                <fieldset className="space-y-3 pt-4 border-t border-slate-100">
                  <legend className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-brand-gold" />
                    <span>2. Appointment Date &amp; Time</span>
                  </legend>

                  <div>
                    <label htmlFor="bk-date" className="field-label">
                      Preferred date *
                    </label>
                    <input
                      id="bk-date"
                      type="date"
                      required
                      min={tomorrowStr}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, date: '' }));
                      }}
                      aria-invalid={!!fieldErrors.date}
                      aria-describedby={fieldErrors.date ? 'bk-date-error' : undefined}
                      className={`field-input ${fieldErrors.date ? 'border-red-400' : ''}`}
                    />
                    {fieldErrors.date && (
                      <p id="bk-date-error" className="field-error" role="alert">
                        {fieldErrors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="field-label" id="bk-slot-label">
                      Available time slots for {selectedDate} *
                    </span>

                    {loadingSlots ? (
                      <div role="status" className="py-6 text-center text-xs text-slate-500">
                        Checking slot availability…
                      </div>
                    ) : slotData?.isHoliday ? (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                        {slotData.message}
                      </div>
                    ) : (
                      <div
                        role="group"
                        aria-labelledby="bk-slot-label"
                        aria-invalid={!!fieldErrors.time}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                      >
                        {(slotData?.slots || []).map((slot: any) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.isAvailable}
                            aria-pressed={selectedTime === slot.time}
                            onClick={() => {
                              setSelectedTime(slot.time);
                              setFieldErrors((prev) => ({ ...prev, time: '' }));
                            }}
                            className={`p-2.5 rounded-xl text-xs font-mono font-bold border transition-all text-center min-h-[56px] ${
                              selectedTime === slot.time
                                ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                                : slot.isAvailable
                                ? 'bg-slate-50 hover:bg-brand-gold/15 hover:border-brand-gold text-slate-700 border-slate-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <span className="block">{slot.time}</span>
                            <span className="text-xs block font-sans font-normal text-slate-500 mt-0.5">
                              {slot.isAvailable ? `${slot.capacity - slot.bookedCount} left` : 'Fully booked'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {slotError && (
                      <p className="field-error" role="alert">
                        {slotError}
                      </p>
                    )}
                    {fieldErrors.time && (
                      <p className="field-error" role="alert">
                        {fieldErrors.time}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* 3. Applicant Personal Information */}
                <fieldset className="space-y-3 pt-4 border-t border-slate-100">
                  <legend className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    <span>3. Your Contact Details</span>
                  </legend>

                  <div>
                    <label htmlFor="bk-name" className="field-label">
                      Full legal name *
                    </label>
                    <input
                      id="bk-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      placeholder="e.g. Tanvir Ahmed"
                      aria-invalid={!!fieldErrors.fullName}
                      aria-describedby={fieldErrors.fullName ? 'bk-name-error' : undefined}
                      className={`field-input ${fieldErrors.fullName ? 'border-red-400' : ''}`}
                    />
                    {fieldErrors.fullName && (
                      <p id="bk-name-error" className="field-error" role="alert">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bk-phone" className="field-label">
                        Phone / WhatsApp number *
                      </label>
                      <input
                        id="bk-phone"
                        type="tel"
                        inputMode="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        placeholder="+880 1XXXXXXXXX"
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={`bk-phone-hint${fieldErrors.phone ? ' bk-phone-error' : ''}`}
                        className={`field-input ${fieldErrors.phone ? 'border-red-400' : ''}`}
                      />
                      <p id="bk-phone-hint" className="field-hint">
                        We confirm the appointment on this number.
                      </p>
                      {fieldErrors.phone && (
                        <p id="bk-phone-error" className="field-error" role="alert">
                          {fieldErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="bk-email" className="field-label">
                        Email address *
                      </label>
                      <input
                        id="bk-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="applicant@example.com"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'bk-email-error' : undefined}
                        className={`field-input ${fieldErrors.email ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.email && (
                        <p id="bk-email-error" className="field-error" role="alert">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bk-message" className="field-label">
                      Background, education or questions (optional)
                    </label>
                    <textarea
                      id="bk-message"
                      rows={3}
                      value={additionalMessage}
                      onChange={(e) => setAdditionalMessage(e.target.value)}
                      placeholder="e.g. 3 years of construction experience, planning to apply for a Malaysia work permit."
                      className="field-input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bk-consent"
                      className="flex items-start gap-2.5 cursor-pointer"
                    >
                      <input
                        id="bk-consent"
                        type="checkbox"
                        checked={privacyConsent}
                        onChange={(e) => {
                          setPrivacyConsent(e.target.checked);
                          setFieldErrors((prev) => ({ ...prev, privacyConsent: '' }));
                        }}
                        aria-invalid={!!fieldErrors.privacyConsent}
                        aria-describedby={fieldErrors.privacyConsent ? 'bk-consent-error' : undefined}
                        className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold mt-0.5 w-4 h-4 shrink-0"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        I agree that The Visa Gate may contact me by phone, SMS or WhatsApp about this appointment
                        request, in line with the{' '}
                        <a href="/privacy" className="text-brand-navy font-semibold underline underline-offset-2">
                          privacy policy
                        </a>
                        .
                      </span>
                    </label>
                    {fieldErrors.privacyConsent && (
                      <p id="bk-consent-error" className="field-error" role="alert">
                        {fieldErrors.privacyConsent}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
                  >
                    <span>{submitting ? 'Confirming…' : 'Submit & Request Appointment'}</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-2.5 leading-relaxed">
                    Submitting this form does not create a visa application or commit you to any service.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
