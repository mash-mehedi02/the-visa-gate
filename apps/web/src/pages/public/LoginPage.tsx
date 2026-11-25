import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  User,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Lock,
  Smartphone,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Info,
  Phone
} from 'lucide-react';
import { RoleName } from '@thevisagate/shared';
import { OFFICE } from '../../components/common/ContactStrip';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPortal = searchParams.get('portal') === 'staff' ? 'staff' : 'client';

  const [activePortal, setActivePortal] = useState<'client' | 'staff'>(initialPortal);
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // MFA State
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [mfaToken, setMfaToken] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [mfaDestination, setMfaDestination] = useState<string>('');

  // Password Recovery State
  const [showRecovery, setShowRecovery] = useState<boolean>(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState<string>('');
  const [recoveryPhoneDigits, setRecoveryPhoneDigits] = useState<string>('');
  const [recoveryToken, setRecoveryToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');

  // First Login Change Password Modal
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [currentPass, setCurrentPass] = useState<string>('');
  const [firstNewPass, setFirstNewPass] = useState<string>('');

  const { login, verifyMfa, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && (!user.mustChangePassword || user.role === RoleName.CLIENT)) {
      if (user.role === RoleName.CLIENT) {
        navigate('/client/portal');
      } else {
        navigate('/admin/dashboard');
      }
    } else if (isAuthenticated && user && user.mustChangePassword && user.role !== RoleName.CLIENT) {
      setShowChangePassword(true);
    }
  }, [isAuthenticated, user, navigate]);

  const validateLogin = (): boolean => {
    const errors: Record<string, string> = {};
    if (identifier.trim().length < 3) {
      errors.identifier =
        activePortal === 'client'
          ? 'Enter your passport number exactly as printed (at least 3 characters).'
          : 'Enter your official email address.';
    }
    if (password.length < 1) {
      errors.password = 'Enter your password.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!validateLogin()) return;

    setLoading(true);
    try {
      const response = await login(identifier.trim(), password);
      if (response.requiresMfa) {
        setMfaRequired(true);
        setMfaToken(response.mfaToken || '');
        setMfaDestination(response.maskedDestination || 'your registered contact');
      } else if (response.user) {
        if (response.user.mustChangePassword && response.user.role !== RoleName.CLIENT) {
          setShowChangePassword(true);
        } else if (response.user.role === RoleName.CLIENT) {
          navigate('/client/portal');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(mfaCode.trim())) {
      setFieldErrors({ mfaCode: 'Enter the 6-digit code exactly as received.' });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const loggedUser = await verifyMfa(mfaToken, mfaCode.trim());
      if (loggedUser.mustChangePassword) {
        setShowChangePassword(true);
      } else if (loggedUser.role === RoleName.CLIENT) {
        navigate('/client/portal');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'That verification code was not accepted. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (firstNewPass.length < 8) {
      setFieldErrors({ firstNewPass: 'Your new password must be at least 8 characters long.' });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: currentPass,
        newPassword: firstNewPass,
      });
      setShowChangePassword(false);
      setSuccessMsg('Password updated successfully. Taking you to your portal…');
      setTimeout(() => {
        if (user?.role === RoleName.CLIENT) {
          navigate('/client/portal');
        } else {
          navigate('/admin/dashboard');
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'We could not update your password. Please check the requirements and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (recoveryIdentifier.trim().length < 3) {
      errors.recoveryIdentifier = 'Enter the passport number or email address registered with us.';
    }
    if (activePortal === 'client' && !/^\d{4}$/.test(recoveryPhoneDigits.trim())) {
      errors.recoveryPhoneDigits = 'Enter the last 4 digits of the phone number on your file.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const res: any = await api.post('/auth/forgot-password', {
        identifier: recoveryIdentifier.trim(),
        phoneLastDigits: recoveryPhoneDigits.trim() || undefined,
      });
      setRecoveryStep('reset');
      setSuccessMsg(
        res.message ||
          'If those details match an account, a password reset link has been sent to the contact registered on the account.'
      );
    } catch (err: any) {
      setError(err.message || 'We could not verify those details. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (!recoveryToken.trim()) {
      errors.recoveryToken = 'Paste the reset token we sent you.';
    }
    if (newPassword.length < 8) {
      errors.newPassword = 'Your new password must be at least 8 characters long.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: recoveryToken.trim(),
        newPassword,
      });
      setShowRecovery(false);
      setRecoveryStep('request');
      setNewPassword('');
      setRecoveryToken('');
      setSuccessMsg('Password reset complete. Sign in with your new password.');
    } catch (err: any) {
      setError(err.message || 'We could not reset your password. Please request a new reset token.');
    } finally {
      setLoading(false);
    }
  };

  const switchPortal = (portal: 'client' | 'staff') => {
    setActivePortal(portal);
    setError(null);
    setSuccessMsg(null);
    setIdentifier('');
    setPassword('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-navy p-6 sm:p-8 text-center text-white relative">
            <Link to="/" className="inline-flex items-center justify-center mb-3 group">
              <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img src="/the-visa-gate-logo.png" alt="The Visa Gate" className="h-11 w-auto max-w-[200px] object-contain" />
              </div>
            </Link>

            <h1 className="text-xl font-bold font-serif">Welcome to The Visa Gate</h1>
            <p className="text-xs text-brand-gold mt-1">
              {activePortal === 'client'
                ? 'Client Portal — track your own application.'
                : 'Employee Portal — staff &amp; management access.'}
            </p>

            {/* Portal Switch Tabs */}
            {!mfaRequired && !showRecovery && (
              <div role="tablist" aria-label="Choose portal" className="mt-6 flex bg-white/10 p-1 rounded-lg">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePortal === 'client'}
                  onClick={() => switchPortal('client')}
                  className={`flex-1 py-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                    activePortal === 'client'
                      ? 'bg-brand-gold text-brand-navy shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Client Portal</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePortal === 'staff'}
                  onClick={() => switchPortal('staff')}
                  className={`flex-1 py-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                    activePortal === 'staff'
                      ? 'bg-brand-gold text-brand-navy shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Employee Portal</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* MODE 1: MFA Verification for Staff/Admin */}
            {mfaRequired ? (
              <form onSubmit={handleVerifyMfa} className="space-y-4">
                <div className="text-center space-y-2 pb-2">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto text-brand-navy">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-brand-navy">Two-Factor Authentication</h2>
                  <p className="text-xs text-slate-500">
                    A 6-digit verification code was sent to{' '}
                    <strong className="text-brand-navy break-all">{mfaDestination}</strong>.
                  </p>
                </div>

                <div>
                  <label htmlFor="mfa-code" className="field-label text-center">
                    6-digit verification code
                  </label>
                  <input
                    id="mfa-code"
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    aria-invalid={!!fieldErrors.mfaCode}
                    aria-describedby={fieldErrors.mfaCode ? 'mfa-code-error' : undefined}
                    className={`w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-lg border text-slate-800 ${
                      fieldErrors.mfaCode ? 'border-red-400' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold`}
                  />
                  {fieldErrors.mfaCode && (
                    <p id="mfa-code-error" className="field-error text-center" role="alert">
                      {fieldErrors.mfaCode}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[48px]"
                >
                  <span>{loading ? 'Verifying…' : 'Verify & enter portal'}</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaRequired(false);
                    setMfaCode('');
                    setError(null);
                    setFieldErrors({});
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 min-h-[44px]"
                >
                  Cancel &amp; return to sign in
                </button>
              </form>
            ) : showRecovery ? (
              /* MODE 2: Password Recovery Flow */
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-brand-navy">Account password recovery</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {recoveryStep === 'request'
                      ? 'Verify your identity to reset your password.'
                      : 'Create a new strong password.'}
                  </p>
                </div>

                {recoveryStep === 'request' ? (
                  <form onSubmit={handleRecoveryRequest} noValidate className="space-y-4">                    <div>
                      <label htmlFor="rec-id" className="field-label">
                        {activePortal === 'client' ? 'Passport number *' : 'Official email address *'}
                      </label>
                      <input
                        id="rec-id"
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder={activePortal === 'client' ? 'e.g. A12345678' : 'staff@thevisagate.com'}
                        aria-invalid={!!fieldErrors.recoveryIdentifier}
                        aria-describedby={
                          fieldErrors.recoveryIdentifier ? 'rec-id-error' : 'rec-id-hint'
                        }
                        className={`field-input ${fieldErrors.recoveryIdentifier ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.recoveryIdentifier ? (
                        <p id="rec-id-error" className="field-error" role="alert">
                          {fieldErrors.recoveryIdentifier}
                        </p>
                      ) : (
                        <p id="rec-id-hint" className="field-hint">
                          {activePortal === 'client'
                            ? 'The passport number we issued your portal login under.'
                            : 'The work email address registered on your staff account.'}
                        </p>
                      )}
                    </div>

                    {activePortal === 'client' && (
                      <div>
                        <label htmlFor="rec-phone" className="field-label">
                          Last 4 digits of the phone number on your file *
                        </label>
                        <input
                          id="rec-phone"
                          type="text"
                          required
                          maxLength={4}
                          inputMode="numeric"
                          value={recoveryPhoneDigits}
                          onChange={(e) => setRecoveryPhoneDigits(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 5934"
                          aria-invalid={!!fieldErrors.recoveryPhoneDigits}
                          aria-describedby={
                            fieldErrors.recoveryPhoneDigits ? 'rec-phone-error' : 'rec-phone-hint'
                          }
                          className={`field-input ${
                            fieldErrors.recoveryPhoneDigits ? 'border-red-400' : ''
                          }`}
                        />
                        {fieldErrors.recoveryPhoneDigits ? (
                          <p id="rec-phone-error" className="field-error" role="alert">
                            {fieldErrors.recoveryPhoneDigits}
                          </p>
                        ) : (
                          <p id="rec-phone-hint" className="field-hint">
                            This confirms the request came from the contact number registered with your file.
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all min-h-[48px]"
                    >
                      {loading ? 'Verifying…' : 'Request password reset'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRecoveryReset} noValidate className="space-y-4">
                    <div>
                      <label htmlFor="rec-token" className="field-label">
                        Reset token *
                      </label>
                      <input
                        id="rec-token"
                        type="text"
                        required
                        value={recoveryToken}
                        onChange={(e) => {
                          setRecoveryToken(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, recoveryToken: '' }));
                        }}
                        placeholder="Paste the token sent to your registered contact"
                        autoComplete="one-time-code"
                        aria-invalid={!!fieldErrors.recoveryToken}
                        aria-describedby={`rec-token-hint${fieldErrors.recoveryToken ? ' rec-token-error' : ''}`}
                        className={`field-input font-mono text-xs ${
                          fieldErrors.recoveryToken ? 'border-red-400' : ''
                        }`}
                      />
                      <p id="rec-token-hint" className="field-hint">
                        The token was delivered to the phone number on your file. It expires one hour after it was
                        issued. If you cannot find it, call the office and we will help.
                      </p>
                      {fieldErrors.recoveryToken && (
                        <p id="rec-token-error" className="field-error" role="alert">
                          {fieldErrors.recoveryToken}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="rec-newpass" className="field-label">
                        New password *
                      </label>
                      <input
                        id="rec-newpass"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={!!fieldErrors.newPassword}
                        aria-describedby={`rec-newpass-hint${fieldErrors.newPassword ? ' rec-newpass-error' : ''}`}
                        className={`field-input ${fieldErrors.newPassword ? 'border-red-400' : ''}`}
                      />
                      <p id="rec-newpass-hint" className="field-hint">
                        At least 8 characters, including one uppercase letter, one number and one symbol.
                      </p>
                      {fieldErrors.newPassword && (
                        <p id="rec-newpass-error" className="field-error" role="alert">
                          {fieldErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all min-h-[48px]"
                    >
                      {loading ? 'Updating password…' : 'Save new password & sign in'}
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryStep('request');
                    setFieldErrors({});
                    setError(null);
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 min-h-[44px]"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              /* MODE 3: Normal Login Form */
              <form onSubmit={handleLogin} noValidate className="space-y-4">
                <div>
                  <label htmlFor="login-identifier" className="field-label">
                    {activePortal === 'client' ? 'Passport number *' : 'Official email address *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {activePortal === 'client' ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <input
                      id="login-identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activePortal === 'client' ? 'e.g. A12345678' : 'email@thevisagate.com'}
                      autoComplete="username"
                      aria-invalid={!!fieldErrors.identifier}
                      aria-describedby={`login-identifier-hint${
                        fieldErrors.identifier ? ' login-identifier-error' : ''
                      }`}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                        fieldErrors.identifier ? 'border-red-400' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {fieldErrors.identifier ? (
                    <p id="login-identifier-error" className="field-error" role="alert">
                      {fieldErrors.identifier}
                    </p>
                  ) : (
                    <p id="login-identifier-hint" className="field-hint">
                      {activePortal === 'client'
                        ? 'Your passport number is your portal login identifier.'
                        : 'Staff and administrator accounts are issued by The Visa Gate.'}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <label htmlFor="login-password" className="field-label mb-0">
                      {activePortal === 'client' ? 'National ID (NID) Number or Password *' : 'Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecovery(true);
                        setRecoveryIdentifier(identifier);
                        setError(null);
                        setSuccessMsg(null);
                        setFieldErrors({});
                      }}
                      className="text-[11px] font-semibold text-brand-navy hover:underline min-h-[36px]"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {activePortal === 'client' ? <CreditCard className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={activePortal === 'client' ? 'Enter your NID or password' : 'Enter your password'}
                      autoComplete="current-password"
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                      className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                        fieldErrors.password ? 'border-red-400' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p id="login-password-error" className="field-error" role="alert">
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <p className="field-hint">
                      {activePortal === 'client'
                        ? 'Enter the National ID (NID) registered with your application, or your password.'
                        : 'Enter your account password.'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[48px]"
                >
                  <span>
                    {loading ? 'Verifying…' : activePortal === 'client' ? 'Track My Application' : 'Sign in'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </button>

                {activePortal === 'client' && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                    <Info className="w-3.5 h-3.5 text-brand-gold-dark shrink-0 mt-0.5" />
                    <span>
                      Track your visa application anytime using your registered Passport Number and National ID (NID) number. If you need any assistance, please contact our support team.
                    </span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-brand-gold-dark" />
          <span>Encrypted session • Two-factor protected staff access • Role-restricted records</span>
        </div>

        {/* Support contact */}
        <div className="mt-4 text-center text-xs text-slate-500 space-y-1">
          <p>
            Cannot sign in?{' '}
            <a href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`} className="text-brand-navy font-semibold inline-flex items-center gap-1 hover:underline">
              <Phone className="w-3 h-3" />
              {OFFICE.hotline}
            </a>
          </p>

        </div>
      </div>
    </div>
  );
};
