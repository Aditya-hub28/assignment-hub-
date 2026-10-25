import React from 'react';
import { Link } from 'react-router-dom';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans selection:bg-[#6C63FF] selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm shrink-0 border border-[#6C63FF]/20">
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
            <span className="hidden sm:inline-block text-sm font-medium text-[#25233A]/70">New student?</span>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#6C63FF] bg-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-white"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content with 2-Column Claymorphic Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-grow flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: 3D Clay Illustration & Highlights */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-start justify-center p-8 clay-surface rounded-3xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8FF] border border-[#E2DCFF] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#55C595]"></span>
              <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                STUDENT ACADEMIC PORTAL • 100% Confidential
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-[#25233A] tracking-tight mb-3">
              Welcome to <span className="text-[#6C63FF]">Assignment Hub</span>
            </h1>

            <p className="text-sm font-medium text-[#25233A]/75 mb-6 leading-relaxed">
              Your academic work, all in one place. Instant access to college assignment solutions, practical lab files, and active orders with zero password hassle.
            </p>

            <div className="w-full relative rounded-2xl overflow-hidden shadow-md border border-white">
              <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-[#25233A] shadow-sm flex items-center gap-1.5 border border-white">
                <span>📚</span>
                <span>Verified Solutions</span>
              </div>
              <img
                src="/hero.png"
                alt="Student Illustration"
                className="w-full h-64 object-cover object-center"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Right Column: 1-Click Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="clay-surface rounded-3xl p-6 sm:p-8 md:p-10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white p-2.5 mx-auto mb-5 flex items-center justify-center clay-card shadow-sm border border-[#6C63FF]/20">
                <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FF] border border-[#E2DCFF] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#55C595]"></span>
                <span className="text-[11px] font-bold text-[#6C63FF] uppercase tracking-wider">Instant 1-Click Access</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25233A] tracking-tight mb-2">
                Sign In to Your Account
              </h2>

              <p className="text-xs sm:text-sm text-[#25233A]/70 mb-8 max-w-xs mx-auto">
                Sign in instantly using your Google account. No passwords, no OTP codes, zero waiting.
              </p>

              {/* 1-Click Google Sign In */}
              <div className="space-y-4">
                <GoogleSignInButton text="Continue with Google" />

                <div className="p-4 rounded-2xl bg-white/80 border border-[#E2DCFF] text-left space-y-2.5 mt-6">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#25233A]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>No passwords to remember or reset</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#25233A]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>100% Private, encrypted & secure</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#25233A]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Automatic sync across your devices</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#25233A]/50 mt-8">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-[#6C63FF] hover:underline font-bold">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#6C63FF] hover:underline font-bold">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-[#25233A]/60">
        © 2026 Assignment Hub. Academic Integrity & Trusted College Solutions.
      </footer>
    </div>
  );
}
