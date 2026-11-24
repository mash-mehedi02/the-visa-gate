import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Lock,
  Smartphone,
  CheckCircle2,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { RoleName } from '@thevisagate/shared';
import { Modal } from '../../components/common/Modal';

export const AdminLoginPage: React.FC = () => {
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

  // First Login Change Password
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [currentPass, setCurrentPass] = useState<string>('');
  const [firstNewPass, setFirstNewPass] = useState<string>('');

  const { login, verifyMfa, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && !user.mustChangePassword) {
      if (
        user.role === RoleName.ADMIN ||
        user.role === RoleName.SUPER_ADMIN ||
        user.role === RoleName.STAFF
      ) {
        navigate('/admin/dashboard');
      } else {
        // Clients should not be here — redirect away
        navigate('/login');
      }
    } else if (isAuthenticated && user && user.mustChangePassword) {
      setShowChangePassword(true);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const errors: Record<string, string> = {};
    if (identifier.trim().length < 3) {
      errors.identifier = 'Enter your official email address.';
    }
    if (password.length < 1) {
      errors.password = 'Enter your password.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await login(identifier.trim(), password);
      if (response.requiresMfa) {
        setMfaRequired(true);
        setMfaToken(response.mfaToken || '');
        setMfaDestination(response.maskedDestination || 'your registered contact');
      } else if (response.user) {
        if (response.user.mustChangePassword) {
          setShowChangePassword(true);
        } else if (
          response.user.role === RoleName.ADMIN ||
          response.user.role === RoleName.SUPER_ADMIN ||
          response.user.role === RoleName.STAFF
        ) {
          navigate('/admin/dashboard');
        } else {
          // Client tried to log in here — reject
          setError('Access denied. This portal is restricted to authorised staff only.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
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
      } else if (
        loggedUser.role === RoleName.ADMIN ||
        loggedUser.role === RoleName.SUPER_ADMIN ||
        loggedUser.role === RoleName.STAFF
      ) {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. This portal is restricted to authorised staff only.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Server password rule: 8+ characters, one uppercase letter, one number
  // and one symbol.
  const isStrongPassword = (value: string): boolean =>
    value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value);

  const handleFirstPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(firstNewPass)) {
      setFieldErrors({
        firstNewPass: 'Use at least 8 characters, including one uppercase letter, one number and one symbol.',
      });
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
      setSuccessMsg('Password updated. Redirecting to dashboard…');
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch (err: any) {
      setError(err.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-4 group">
            <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/the-visa-gate-logo.png" alt="The Visa Gate" className="h-12 w-auto max-w-[210px] object-contain" />
            </div>
          </Link>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/20 mb-3">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
          </div>
          <h1 className="text-white font-bold text-xl font-serif">Employee Portal</h1>
          <p className="text-slate-400 text-xs mt-1">Restricted access — authorised personnel only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-7 space-y-5">
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

            {mfaRequired ? (
              /* MFA Verification */
              <form onSubmit={handleVerifyMfa} noValidate className="space-y-5">
                <div className="text-center space-y-2 pb-1">
                  <div className="w-12 h-12 rounded-full bg-brand-navy/10 flex items-center justify-center mx-auto text-brand-navy">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h2 className="text-sm font-bold text-brand-navy">Two-Factor Verification</h2>
                  <p className="text-xs text-slate-500">
                    A 6-digit code was sent to{' '}
                    <strong className="text-brand-navy break-all">{mfaDestination}</strong>.
                  </p>
                </div>

                <div>
                  <label htmlFor="admin-mfa-code" className="field-label text-center">
                    6-digit verification code
                  </label>
                  <input
                    id="admin-mfa-code"
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    aria-invalid={!!fieldErrors.mfaCode}
                    aria-describedby={fieldErrors.mfaCode ? 'admin-mfa-error' : undefined}
                    className={`w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-lg border text-slate-800 ${
                      fieldErrors.mfaCode ? 'border-red-400' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-gold`}
                  />
                  {fieldErrors.mfaCode && (
                    <p id="admin-mfa-error" className="field-error text-center" role="alert">
                      {fieldErrors.mfaCode}
                    </p>
                  )}
                  <p className="field-hint text-center">
                    The code expires 10 minutes after it is sent. Didn&apos;t get one? Cancel and sign in
                    again to request a new code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[48px]"
                >
                  <span>{loading ? 'Verifying…' : 'Verify & enter dashboard'}</span>
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
                  Cancel &amp; return
                </button>
              </form>
            ) : (
              /* Normal Login */
              <form onSubmit={handleLogin} noValidate className="space-y-4">
                <div>
                  <label htmlFor="admin-identifier" className="field-label">
                    Official email address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-identifier"
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="yourname@thevisagate.com"
                      autoComplete="username"
                      aria-invalid={!!fieldErrors.identifier}
                      aria-describedby={fieldErrors.identifier ? 'admin-id-error' : undefined}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                        fieldErrors.identifier ? 'border-red-400' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {fieldErrors.identifier && (
                    <p id="admin-id-error" className="field-error" role="alert">
                      {fieldErrors.identifier}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="admin-password" className="field-label">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'admin-pass-error' : undefined}
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
                  {fieldErrors.password && (
                    <p id="admin-pass-error" className="field-error" role="alert">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[48px]"
                >
                  <span>{loading ? 'Authenticating…' : 'Sign in to dashboard'}</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </button>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-brand-gold-dark shrink-0 mt-0.5" />
                  <span>
                    Staff access requires two-factor authentication. If you have lost your device, contact the system
                    administrator to re-issue your access.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-brand-gold/70" />
          <span>Encrypted session • Two-factor protected • Role-restricted records</span>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          <Link to="/login" className="hover:text-slate-200 transition-colors">
            ← Back to the public site
          </Link>
        </div>
      </div>

      {/* Forced password change (first sign-in / temporary password). Closing
          the dialog signs the user out: nobody continues on a temporary password. */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => {
          setShowChangePassword(false);
          logout();
        }}
        title="Set a new password"
        description="For your security, a temporary password must be changed at first sign-in. Closing this dialog signs you out."
        dismissible={false}
      >
        <form onSubmit={handleFirstPasswordChange} noValidate className="space-y-4">
          <div>
            <label htmlFor="admin-first-current-pass" className="field-label">
              Current (temporary) password *
            </label>
            <input
              id="admin-first-current-pass"
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              autoComplete="current-password"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="admin-first-new-pass" className="field-label">
              New password *
            </label>
            <input
              id="admin-first-new-pass"
              type="password"
              required
              value={firstNewPass}
              onChange={(e) => setFirstNewPass(e.target.value)}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.firstNewPass}
              aria-describedby={`admin-first-new-pass-hint${fieldErrors.firstNewPass ? ' admin-first-new-pass-error' : ''}`}
              className={`field-input ${fieldErrors.firstNewPass ? 'border-red-400' : ''}`}
            />
            <p id="admin-first-new-pass-hint" className="field-hint">
              At least 8 characters, including one uppercase letter, one number and one symbol.
            </p>
            {fieldErrors.firstNewPass && (
              <p id="admin-first-new-pass-error" className="field-error" role="alert">
                {fieldErrors.firstNewPass}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all min-h-[48px] disabled:opacity-50"
          >
            {loading ? 'Updating password…' : 'Save new password'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
