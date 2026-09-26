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
  const [resendCooldown, setResendCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToast();
  const { refreshProfile } = useAuth();
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

    setLoading(true);
    try {
      const res = await api.auth.initiateRegister({
        full_name: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        password
      });

      const verId = res?.data?.verification_id;
      if (verId) {
        setVerificationId(verId);
        setStep(2);
        setResendCooldown(60);
        showToast('OTP sent to your email address! Please check your inbox.', 'success');
      } else {
        throw new Error('Verification ID not received.');
      }
    } catch (err) {
      const msg = err.message || 'Failed to initiate signup.';
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
        const { session, user: authUser, profile: userProfile } = res.data;
        authStorage.setSession({ session, user: authUser, profile: userProfile });
        showToast('Account verified & registered successfully! Welcome to Assignment Hub.', 'success');
        await refreshProfile();
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Registration verification failed.');
      }
    } catch (err) {
      const msg = err.message || 'Invalid or expired OTP. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setLoading(true);
    try {
      await api.auth.resendOtp({ verification_id: verificationId });
      setResendCooldown(60);
      showToast('A new OTP has been dispatched to your email.', 'info');
    } catch (err) {
      const msg = err.message || 'Failed to resend OTP.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="clay-surface rounded-3xl p-7 sm:p-10 max-w-md w-full relative">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1X7S3rvjHLD2T2ZSwRsAwkZbxRDZ3YNIAMeXlPmZ5YGr9s0jmRhVDu9igu3_DdKtupdlp3mEkDiN7knq6FeOvbUtMAJIxKxPM0Q5vKgd3Crfg46CCu6JcYx8-YzIi8xpHxqy7Z-cdIxtXmLNNbaKoSgetaOV7FNhBRQvSqqts2tOh2Oo8VRN_QNKn7MrlxXMtvopLUFksqqXbuO-7ckIfqhBG5mccZLghWmgFvfefJGR8ffAM9YKkdxAT-P"
                alt="Assignment Hub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-extrabold text-[#25233A]">Assignment<span className="text-[#6C63FF]">Hub</span></span>
          </Link>
          <h2 className="text-2xl font-extrabold text-[#25233A] tracking-tight">
            {step === 1 ? 'Create Free Student Account' : 'Verify Email OTP'}
          </h2>
          <p className="text-xs sm:text-sm text-[#25233A]/70 mt-1">
            {step === 1
              ? 'Get assignments, practicals & projects delivered on time'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FFF2F2] border border-[#FFCDCD] flex items-center gap-2.5 text-xs font-semibold text-[#BA1A1A]">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleInitiate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#25233A]/70 mb-1">Full Name</label>
              <div className="p-3 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">badge</span>
                <input
                  type="text"
                  placeholder="Aditya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#25233A]/70 mb-1">Email Address</label>
              <div className="p-3 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">mail</span>
                <input
                  type="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#25233A]/70 mb-1">Mobile Number (India)</label>
              <div className="p-3 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                <span className="text-xs font-extrabold text-[#6C63FF]">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#25233A]/70 mb-1">Password</label>
              <div className="p-3 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF]">
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 chars (Aa1...)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#25233A]/50 hover:text-[#25233A] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <span className="text-[10px] text-[#25233A]/50 mt-1 block">
                Must include 1 uppercase, 1 lowercase & 1 number.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Continue with Email Verification</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center justify-center shadow-sm focus-within:border-[#6C63FF]">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="bg-transparent text-center text-2xl font-extrabold tracking-[0.4em] text-[#25233A] outline-none w-full"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#25233A]/70 hover:text-[#25233A] flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Edit Details</span>
              </button>

              {resendCooldown > 0 ? (
                <span className="text-[#25233A]/50">Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#6C63FF] font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#E2DCFF] text-center text-xs font-semibold text-[#25233A]/70">
          Already registered?{' '}
          <Link to="/login" className="text-[#6C63FF] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

