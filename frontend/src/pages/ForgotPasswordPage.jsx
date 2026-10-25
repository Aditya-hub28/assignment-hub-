import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get('email') || '';
  const initialOtp = searchParams.get('code') || searchParams.get('otp') || '';
  const isResetPath = location.pathname.includes('reset') || searchParams.get('step') === '2';

  const [step, setStep] = useState(isResetPath || initialOtp ? 2 : 1);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(initialOtp);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
    if (initialOtp && !otp) setOtp(initialOtp);
  }, [initialEmail, initialOtp]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      await api.auth.forgotPassword({ email: email.trim() });
      setStep(2);
      showToast('Password reset code sent to your email!', 'success');
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : (err?.message && err.message !== '[object Object]' ? err.message : 'Failed to send reset code.');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code from your email.');
      return;
    }

    if (newPassword.length < 6 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setErrorMsg('Password must be at least 6 characters with uppercase, lowercase, and a number.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword
      });
      showToast('Password reset successfully! Please sign in with your new password.', 'success');
      navigate('/login', { state: { email: email.trim() } });
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : (err?.message && err.message !== '[object Object]' ? err.message : 'Failed to reset password. Check your OTP.');
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
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#6C63FF] bg-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-white"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content with 2-Column Claymorphic Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-grow flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          
          {/* Left Column: 3D Clay Illustration */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-start justify-center p-8 clay-surface rounded-3xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8FF] border border-[#E2DCFF] mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]"></span>
              <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                ACCOUNT RECOVERY • 100% SECURE
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-[#25233A] tracking-tight mb-3">
              Forgot your password?
            </h1>
            <p className="text-sm font-medium text-[#25233A]/75 mb-6 leading-relaxed">
              Don't worry, we'll help you get back into your Assignment Hub account with a secure email verification code.
            </p>

            <div className="w-full rounded-2xl overflow-hidden mb-6 shadow-md border border-white">
              <img
                src="/images/study-workspace.png"
                alt="Password recovery 3D clay render"
                className="w-full h-auto object-cover rounded-2xl transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column: Recovery Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="clay-surface rounded-3xl p-5 sm:p-7 md:p-9 shadow-lg">
              
              <div className="flex flex-col items-center text-center space-y-2 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#8B7CFF] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(108,99,255,0.35)]">
                  <span className="material-symbols-outlined text-2xl">vpn_key</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#25233A] tracking-tight">
                  {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                </h2>
                <p className="text-xs sm:text-sm text-[#25233A]/70">
                  {step === 1
                    ? 'Enter your registered email and we will send you a reset code.'
                    : 'Enter your email, the 6-digit code received, and your new password.'}
                </p>
              </div>

              {/* Step Navigation Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#FAF8FF] rounded-2xl border border-[#E2DCFF] mb-6">
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMsg(''); }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    step === 1
                      ? 'bg-white text-[#6C63FF] shadow-sm'
                      : 'text-[#25233A]/60 hover:text-[#25233A]'
                  }`}
                >
                  1. Get Reset Code
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(2); setErrorMsg(''); }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    step === 2
                      ? 'bg-white text-[#6C63FF] shadow-sm'
                      : 'text-[#25233A]/60 hover:text-[#25233A]'
                  }`}
                >
                  2. Enter Code & Reset
                </button>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] text-xs font-semibold flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#E11D48]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Request Code Form */}
              {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Registered Email</label>
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                      <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">mail</span>
                      <input
                        type="email"
                        placeholder="student@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none placeholder-[#25233A]/40"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-4 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg shadow-[#6C63FF]/30 active:scale-95"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setStep(2); setErrorMsg(''); }}
                      className="text-xs font-bold text-[#6C63FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Already have a 6-digit code? Enter it here</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter OTP & New Password */}
              {step === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Registered Email</label>
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
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">6-Digit Reset Code (from email)</label>
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                      <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">pin</span>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-transparent text-lg font-mono font-bold tracking-[0.25em] text-[#25233A] outline-none placeholder:tracking-normal placeholder-[#25233A]/40"
                        required
                        autoFocus={!otp}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">New Password</label>
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                      <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 chars (Aa1...)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                    <span className="text-[11px] text-[#25233A]/60 mt-1 block">
                      Must include 1 uppercase, 1 lowercase & 1 number.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6 || !newPassword || !email}
                    className="w-full py-4 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg shadow-[#6C63FF]/30 active:scale-95"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Reset Password & Log In</span>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setErrorMsg(''); }}
                      className="text-xs font-bold text-[#6C63FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                      <span>Didn't receive a code? Request again</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-[#E2DCFF] text-center">
                <Link to="/login" className="text-xs font-bold text-[#6C63FF] hover:underline">
                  Remember your password? Sign in here
                </Link>
              </div>
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
