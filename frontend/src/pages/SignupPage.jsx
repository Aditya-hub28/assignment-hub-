import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, authStorage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function SignupPage() {
  const [step, setStep] = useState(1); // 1: Initiate, 2: OTP Verification
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP state
  const [verificationId, setVerificationId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToast();
  const { setSession, login: authLogin } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown for OTP
  useEffect(() => {
    let timer;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Step 1: Initiate Registration
  const handleInitiate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!mobile.match(/^[6-9]\d{9}$/)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setErrorMsg('Password must be at least 6 characters with uppercase, lowercase, and a number.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '');
    const emailDomain = cleanEmail.split('@')[1];
    const typoDomains = {
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com'
    };
    if (emailDomain && typoDomains[emailDomain]) {
      setErrorMsg(`Did you mean @${typoDomains[emailDomain]}? Please check your email.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.initiateRegister({
        full_name: fullName.trim(),
        email: cleanEmail,
        mobile: mobile.trim(),
        password
      });

      const verId = res?.data?.verification_id || res?.data?.verificationId || res?.verification_id || res?.verificationId;
      const hint = res?.data?.otpHint || res?.data?.devOtp || res?.data?.rawOtp;
      if (hint) {
        setOtpHint(hint);
      }
      if (verId) {
        setVerificationId(verId);
        setStep(2);
        setResendCooldown(60);
        showToast('OTP sent to your email address! Please check your inbox.', 'success');
      } else {
        throw new Error('Verification ID not received from server.');
      }
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : (err?.message && err.message !== '[object Object]' ? err.message : 'Failed to initiate signup.');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setErrorMsg('Please enter a 6-digit numeric OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.verifyOtp({
        verification_id: verificationId,
        otp
      });

      if (res?.data?.session) {
        setSession(res.data);
        showToast('Registration successful! Welcome to Assignment Hub.', 'success');
        navigate('/dashboard');
      } else {
        // Fallback: If session not included in response, login automatically with form credentials
        try {
          await authLogin(email.trim(), password);
          showToast('Registration successful! Welcome to Assignment Hub.', 'success');
          navigate('/dashboard');
        } catch {
          showToast('Registration completed successfully! Please sign in.', 'success');
          navigate('/login', { state: { email: email.trim() } });
        }
      }
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : (err?.message && err.message !== '[object Object]' ? err.message : 'Invalid OTP code.');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.auth.resendOtp({ verification_id: verificationId });
      const hint = res?.data?.otpHint || res?.data?.devOtp || res?.data?.rawOtp;
      if (hint) {
        setOtpHint(hint);
      }
      setResendCooldown(60);
      showToast('A new OTP has been dispatched to your email.', 'info');
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : (err?.message && err.message !== '[object Object]' ? err.message : 'Failed to resend OTP.');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between relative overflow-x-hidden font-sans">
      {/* Ambient Glows */}
      <div className="fixed w-96 h-96 bg-[#8B7CFF]/20 -top-20 -left-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed w-[450px] h-[450px] bg-[#FFB84D]/15 top-1/3 -right-24 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm shrink-0 border border-[#6C63FF]/20">
              <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#25233A] leading-none">
                Assignment<span className="text-[#6C63FF]">Hub</span>
              </span>
              <span className="text-[10px] font-bold text-[#8B7CFF] uppercase tracking-wider mt-0.5">
                College Solutions
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-sm font-medium text-[#25233A]/70">Already registered?</span>
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#6C63FF] bg-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-white"
            >
              <span>Log In</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content with 2-Column Claymorphic Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-grow flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          
          {/* Left Column: Clay Illustration & Benefits */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center text-center p-8 clay-surface rounded-3xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8FF] border border-[#E2DCFF] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#55C595]"></span>
              <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                100% Confidential & Secure
              </span>
            </div>

            <div className="w-full max-w-sm overflow-hidden rounded-2xl mb-6 shadow-md border border-white">
              <img
                src="/images/student-desk.png"
                alt="Student Registration 3D Clay Illustration"
                className="w-full h-auto object-cover rounded-2xl transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            <h3 className="text-2xl font-extrabold text-[#25233A] mb-2">Join Your Campus Hub</h3>
            <p className="text-sm font-medium text-[#25233A]/70 max-w-xs leading-relaxed mb-4">
              Create your account in seconds with your phone number and email to access assignment solutions and academic support.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#25233A] border border-[#E2DCFF]">
                🚀 Instant Delivery
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#25233A] border border-[#E2DCFF]">
                ✍️ Handwritten Options
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#25233A] border border-[#E2DCFF]">
                💻 Coding & Viva Ready
              </span>
            </div>
          </div>

          {/* Right Column: Registration / OTP Card */}
          <div className="lg:col-span-7">
            <div className="clay-surface rounded-3xl p-5 sm:p-7 md:p-10">
              
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8FF] border border-[#E2DCFF]">
                  <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">STUDENT REGISTRATION</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#55C595]/15 text-[#25233A]">
                  <span className="w-2 h-2 rounded-full bg-[#55C595]"></span>
                  <span className="text-xs font-bold text-[#55C595]">
                    {step === 1 ? 'Quick 2-Step Signup' : 'Step 2: OTP Verification'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                <h2 className="text-3xl font-extrabold text-[#25233A] tracking-tight">
                  {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
                </h2>
                <p className="text-sm text-[#25233A]/70">
                  {step === 1
                    ? 'Step 1 of 2: Fill your basic info. 6-digit Email OTP follows.'
                    : `Enter the 6-digit verification code sent to ${email}. (Please check your Spam or Promotions folder if not in Primary Inbox)`}
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-[#FFDAD6] text-[#93000A] flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span className="text-sm font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Registration Form */}
              {step === 1 && (
                <form onSubmit={handleInitiate} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Full Name</label>
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                      <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">badge</span>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Email Address</label>
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                        <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">mail</span>
                        <input
                          type="email"
                          placeholder="student@college.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Mobile Number (India)</label>
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                        <span className="text-xs font-extrabold text-[#6C63FF]">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Password</label>
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                      <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 chars (Aa1...)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#25233A]/50 hover:text-[#25233A] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    <span className="text-[11px] text-[#25233A]/60 mt-1.5 block">
                      Must be at least 6 characters with 1 uppercase, 1 lowercase & 1 number.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-4 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg shadow-[#6C63FF]/30"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Proceed to OTP Verification</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#25233A]/60 mt-2">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-[#6C63FF] hover:text-[#5b52f5]">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-[#6C63FF] hover:text-[#5b52f5]">
                      Privacy Policy
                    </Link>.
                  </p>
                </form>
              )}

              {/* STEP 2: OTP Verification Form */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">6-Digit Email OTP</label>
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                      <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">pin</span>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-transparent text-lg font-mono font-bold tracking-[0.3em] text-[#25233A] outline-none placeholder:tracking-normal placeholder-[#25233A]/40"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {otpHint && (
                    <div className="p-3.5 rounded-2xl bg-[#F0EDFF] border border-[#6C63FF]/30 flex items-center justify-between shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-wider">Instant Verification Code</span>
                        <span className="font-mono text-base font-extrabold tracking-widest text-[#25233A]">{otpHint}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtp(otpHint)}
                        className="px-3.5 py-1.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold hover:bg-[#5b52f5] transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-medium text-[#25233A]/70">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="font-bold text-[#6C63FF] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg shadow-[#6C63FF]/30"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Verify & Create Account</span>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setErrorMsg('');
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-bold text-[#25233A]/70 hover:text-[#25233A] bg-white border border-[#E2DCFF] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Change Registration Details</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 text-center text-xs text-[#25233A]/50">
        &copy; {new Date().getFullYear()} Assignment Hub. All rights reserved. Built for students across India.
      </footer>
    </div>
  );
}
