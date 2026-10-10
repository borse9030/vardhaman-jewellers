'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier } from 'firebase/auth';

interface OtpLoginFormProps {
  redirectAfterLogin?: string;
  sourceContext?: 'admin' | 'storefront';
}

export default function OtpLoginForm({ redirectAfterLogin, sourceContext = 'storefront' }: OtpLoginFormProps) {
  const router = useRouter();
  const { sendOtp, verifyOtp, isAdminLoggedIn, customer } = useAuth();

  // Step 1: 'phone' | Step 2: 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAdminLoggedIn) {
      router.push(redirectAfterLogin || '/admin');
    } else if (customer && sourceContext !== 'admin') {
      router.push(redirectAfterLogin || '/profile');
    }
  }, [isAdminLoggedIn, customer, router, redirectAfterLogin, sourceContext]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (step === 'otp' && resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  // Initialize visible Google reCAPTCHA on mount for human verification
  useEffect(() => {
    if (typeof window === 'undefined' || !auth || step !== 'phone') return;
    const currentAuth = auth;

    let isMounted = true;
    const initRecaptcha = async () => {
      try {
        const container = document.getElementById('recaptcha-container');
        if (!container) return;

        // If a verifier and widgetId already exist, reset rather than destroying
        if ((window as any).recaptchaVerifier && (window as any).recaptchaWidgetId !== undefined && (window as any).grecaptcha) {
          try {
            (window as any).grecaptcha.reset((window as any).recaptchaWidgetId);
            setCaptchaSolved(false);
            return;
          } catch {
            // If reset fails, create a fresh one
          }
        }

        container.innerHTML = '';
        const verifier = new RecaptchaVerifier(currentAuth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {
            console.log('reCAPTCHA successfully verified by user');
            setCaptchaSolved(true);
            setError('');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
            setCaptchaSolved(false);
            setError('Security check expired. Please tick the "I\'m not a robot" box again.');
          },
        });

        const widgetId = await verifier.render();
        if (isMounted) {
          (window as any).recaptchaWidgetId = widgetId;
          (window as any).recaptchaVerifier = verifier;
          console.log('reCAPTCHA widget ready with ID:', widgetId);
        }
      } catch (err) {
        console.warn('reCAPTCHA mount warning:', err);
      }
    };

    const timer = setTimeout(initRecaptcha, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [step]);

  // Handle phone number input (only digits, max 10)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      setPhone(raw);
      setError('');
    }
  };

  // Quick preset phone numbers for effortless testing
  const setQuickPhone = (preset: string) => {
    setPhone(preset);
    setError('');
  };

  // Step 1 Submit: Request OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!captchaSolved) {
      setError('Please check the "I\'m not a robot" security check box below before continuing.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await sendOtp(phone);
    setLoading(false);

    if (res.success) {
      setFormattedPhone(res.formattedPhone || `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      // Focus first digit box
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } else {
      setError(res.message || 'Unable to send OTP. Please check your network.');
      setCaptchaSolved(false);
      // Reset the reCAPTCHA widget so the user can tick it again
      if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).recaptchaWidgetId !== undefined) {
        try {
          (window as any).grecaptcha.reset((window as any).recaptchaWidgetId);
        } catch (rErr) {
          console.warn('Error resetting reCAPTCHA:', rErr);
        }
      }
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await sendOtp(phone);
    setLoading(false);

    if (res.success) {
      setResendTimer(30);
      setCanResend(false);
      setSuccessMsg('A fresh verification code has been dispatched via SMS.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(res.message || 'Failed to resend code.');
    }
  };

  // Step 2: Handle OTP input per box
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // If user pastes full code (e.g. 6 digits)
    if (clean.length > 1) {
      const parts = clean.slice(0, 6).split('');
      const updated = [...otpDigits];
      parts.forEach((p, idx) => {
        if (idx < 6) updated[idx] = p;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(parts.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit entry
    const updated = [...otpDigits];
    updated[index] = clean[0];
    setOtpDigits(updated);

    // Auto advance to next box
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill demo OTP code
  const fillDemoOtp = (code: string) => {
    const parts = code.split('').slice(0, 6);
    setOtpDigits(parts);
    setError('');
  };

  // Step 2 Submit: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await verifyOtp(phone, fullOtp);
    setLoading(false);

    if (res.success) {
      // Determine redirection based on verified role
      if (res.role === 'super_admin') {
        router.push(redirectAfterLogin || '/admin');
      } else {
        router.push(redirectAfterLogin || '/profile');
      }
    } else {
      setError(res.message || 'Invalid or expired OTP. Please verify and retry.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/" className="inline-block group" aria-label="Return to Store">
          <Image
            src="/logo-gold.png"
            alt="Vardhaman Jewellers"
            width={240}
            height={75}
            priority
            className="h-14 sm:h-16 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
          />
        </Link>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B4F] font-semibold mt-2.5">
          Heritage Gold & Diamond Jewellery
        </p>
      </div>

      {/* Main Luxury Auth Card */}
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xs">
        {/* Top Gold Foil Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#581825] to-[#C5A880]"></div>

        {/* Card Title */}
        <div className="mb-6 text-center">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1818]">
            {step === 'phone' ? 'Sign In to Account' : 'Verify Mobile OTP'}
          </h1>
          <p className="text-xs text-[#78716C] mt-1.5">
            {step === 'phone'
              ? 'Enter your 10-digit mobile number to receive a secure one-time verification code.'
              : `Enter the 6-digit code sent via SMS to ${formattedPhone}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
            {error.includes('SMS region policy') && (
              <div className="mt-1 pt-2 border-t border-red-200 text-[11px] text-red-800 space-y-1.5">
                <p className="font-bold">Required 1-time setup in Firebase Console to send real SMS:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Open <a href="https://console.firebase.google.com/u/0/project/vardhaman-jewellers-fe381/authentication/settings" target="_blank" rel="noreferrer" className="underline font-bold text-red-900">Firebase Authentication Settings ↗</a></li>
                  <li>Scroll to the <strong>SMS region policy</strong> section</li>
                  <li>Click <strong>Allow</strong> &gt; search and check <strong>India (+91)</strong></li>
                  <li>Click <strong>Save</strong></li>
                </ol>
              </div>
            )}
            {error.includes('localhost') && (
              <div className="mt-1 pt-2 border-t border-red-200 text-[11px] text-red-800 space-y-1.5">
                <p className="font-bold">Why this happens &amp; How to receive real SMS:</p>
                <p>Google strictly blocks sending cellular SMS from insecure local development origins (<code>http://localhost:3000</code>) to prevent bot billing fraud.</p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>
                    <strong>To test directly on localhost:</strong> Add your number to <a href="https://console.firebase.google.com/u/0/project/vardhaman-jewellers-fe381/authentication/providers" target="_blank" rel="noreferrer" className="underline font-bold text-red-900">Firebase Console &gt; Phone &gt; "Phone numbers for testing" ↗</a>.
                  </li>
                  <li>
                    <strong>To send live SMS over HTTPS:</strong> Open <a href="https://vardhaman-preview.loca.lt/login" target="_blank" rel="noreferrer" className="underline font-bold text-red-900">https://vardhaman-preview.loca.lt/login ↗</a> (add <code>vardhaman-preview.loca.lt</code> in Firebase Authorized Domains).
                  </li>
                </ul>
              </div>
            )}
            {error.includes('Too many requests') && (
              <div className="mt-1 pt-2 border-t border-red-200 text-[11px] text-red-800 space-y-1.5">
                <p className="font-bold">Google Anti-Spam Rate Limit Active on this Number:</p>
                <p>Google Cloud temporarily rate-limits SMS to the same phone number after repeated attempts to protect against cellular spam.</p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>
                    <strong>Option 1 (Instant Real SMS):</strong> Enter a different mobile number (e.g. a colleague or family phone) to receive a real SMS immediately.
                  </li>
                  <li>
                    <strong>Option 2 (Instant Test Bypass):</strong> In <a href="https://console.firebase.google.com/u/0/project/vardhaman-jewellers-fe381/authentication/providers" target="_blank" rel="noreferrer" className="underline font-bold text-red-900">Firebase Console &gt; Phone &gt; "Phone numbers for testing" ↗</a>, add <code>+91 7972565911</code> with code <code>123456</code> to bypass limits completely.
                  </li>
                  <li>
                    <strong>Option 3 (Cooldown):</strong> Wait 15–30 minutes for Google to automatically lift the cooldown on this number.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= STEP 1: PHONE NUMBER ENTRY ================= */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#44403C] font-semibold mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl border border-[#E8E2D8] bg-[#FAF7F2] overflow-hidden focus-within:border-[#C5A880] focus-within:ring-2 focus-within:ring-[#C5A880]/20 transition-all">
                {/* Country Code Prefix */}
                <span className="flex items-center gap-1 px-3.5 bg-[#F0ECE4] text-[#1A1818] font-bold text-xs border-r border-[#E8E2D8] select-none shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="98221 23456"
                  maxLength={10}
                  className="w-full bg-transparent p-3 text-sm font-semibold tracking-wider text-[#1A1818] placeholder-[#A8A29E] focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#A8A29E] mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#C5A880]" />
                An instant 6-digit verification code will be sent via SMS.
              </p>
            </div>

            {/* Google reCAPTCHA Security Verification */}
            <div className={`flex flex-col items-center justify-center my-3 p-3.5 rounded-2xl transition-all ${
              !captchaSolved && phone.length === 10
                ? 'bg-[#FAF4ED] border-2 border-[#C5A880] ring-4 ring-[#C5A880]/15'
                : 'bg-[#FAF7F2] border border-[#E8E2D8]'
            }`}>
              <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold text-[#44403C]">
                <ShieldCheck className={`w-4 h-4 ${captchaSolved ? 'text-emerald-600' : 'text-[#9A7B4F]'}`} />
                <span>
                  {captchaSolved
                    ? 'Security verification complete'
                    : 'Security Check: Check "I\'m not a robot" below'}
                </span>
              </div>
              <div id="recaptcha-container" className="min-h-[78px] flex items-center justify-center"></div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading || phone.length !== 10 || !captchaSolved}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 ${
                loading || phone.length !== 10 || !captchaSolved
                  ? 'bg-[#E7E2DA] text-[#8C827A] cursor-not-allowed shadow-none'
                  : 'bg-[#581825] hover:bg-[#380B12] text-white shadow-md cursor-pointer hover:shadow-lg'
              }`}
            >
              <span>
                {loading
                  ? 'Dispatching SMS Code...'
                  : phone.length !== 10
                  ? 'Enter 10-Digit Mobile Number'
                  : !captchaSolved
                  ? 'Check "I\'m not a robot" Above'
                  : 'Get OTP Verification Code'}
              </span>
              <ArrowRight className={`w-4 h-4 ${phone.length === 10 && captchaSolved ? 'text-[#C5A880]' : 'text-[#A8A29E]'}`} />
            </button>
          </form>
        )}

        {/* ================= STEP 2: 6-DIGIT OTP VERIFICATION ================= */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
            {/* Mobile number chip with edit button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs">
              <div>
                <span className="text-[#57534E]">
                  Sent via SMS to: <strong className="text-[#1A1818]">{formattedPhone}</strong>
                </span>
                <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                  ✓ 6-Digit SMS code sent to your phone
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                className="text-[#581825] hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
              >
                <Edit2 className="w-3 h-3 text-[#C5A880]" />
                <span>Change</span>
              </button>
            </div>

            {/* 6 Individual Digit Input Boxes */}
            <div>
              <label className="block text-[#44403C] font-semibold mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center font-bold text-lg sm:text-xl rounded-xl border border-[#E8E2D8] bg-[#FAF7F2] text-[#1A1818] focus:border-[#581825] focus:ring-2 focus:ring-[#581825]/20 focus:bg-white focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Secret administrator testing bypass only */}
            {phone.replace(/\D/g, '').endsWith('9822123456') && (
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => fillDemoOtp('123456')}
                  className="text-[11px] text-[#A8A29E] hover:text-[#581825] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#C5A880]" />
                  <span>Auto-fill admin bypass code (123456)</span>
                </button>
              </div>
            )}

            {/* Resend Timer & Action */}
            <div className="text-center text-xs">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#581825] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-[#C5A880]" />
                  <span>Resend Verification Code via SMS</span>
                </button>
              ) : (
                <span className="text-[#A8A29E]">
                  Resend code in <strong>00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong>
                </span>
              )}
            </div>

            {/* Verify CTA */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-3.5 rounded-xl bg-[#581825] hover:bg-[#380B12] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              <CheckCircle2 className="w-4 h-4 text-[#C5A880]" />
            </button>
          </form>
        )}

        {/* Security Assurance */}
        <div className="mt-6 pt-5 border-t border-[#F0ECE4] text-center">
          <p className="text-[11px] text-[#78716C] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-Bit Encrypted Mobile Verification • Zero Passwords Needed</span>
          </p>
        </div>
      </div>

      {/* Return to Store Navigation */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#581825] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Vardhaman Jewellers Store</span>
        </Link>
      </div>
    </div>
  );
}
