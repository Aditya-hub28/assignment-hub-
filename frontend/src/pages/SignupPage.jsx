import React from 'react';
import { Link } from 'react-router-dom';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export function SignupPage() {
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
                Student Registration
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-sm font-medium text-[#25233A]/70">Already a member?</span>
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#6C63FF] bg-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-white"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-grow flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Visual Highlights */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center p-8 clay-surface rounded-3xl text-center relative">
            <div className="w-16 h-16 rounded-3xl bg-white p-2.5 mx-auto mb-4 flex items-center justify-center clay-card shadow-sm border border-[#6C63FF]/20">
              <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#25233A] mb-2">
              Start Submitting in Seconds
            </h3>
            <p className="text-sm font-medium text-[#25233A]/75 mb-6 max-w-sm">
              Join thousands of college students saving time on handwritten assignments, coded practicals, and engineering reports.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#25233A] border border-[#E2DCFF]">
                🚀 Instant Access
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#25233A] border border-[#E2DCFF]">
                ✍️ Handwritten & Typed
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#25233A] border border-[#E2DCFF]">
                💻 Viva & Lab Ready
              </span>
            </div>
          </div>

          {/* Right Column: 1-Click Registration Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="clay-surface rounded-3xl p-6 sm:p-8 md:p-10 text-center">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8FF] border border-[#E2DCFF] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#55C595]"></span>
                <span className="text-[11px] font-bold text-[#6C63FF] uppercase tracking-wider">Fast Student Registration</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25233A] tracking-tight mb-2">
                Create Your Account
              </h2>

              <p className="text-xs sm:text-sm text-[#25233A]/70 mb-8 max-w-xs mx-auto">
                One click with Google. Your profile will be created automatically with zero manual forms.
              </p>

              {/* 1-Click Google Sign Up */}
              <div className="space-y-4">
                <GoogleSignInButton text="Sign up with Google (1-Click)" />

                <div className="p-4 rounded-2xl bg-white/80 border border-[#E2DCFF] text-left space-y-2.5 mt-6">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#25233A]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Instant automatic account setup</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#25233A]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>No passwords, OTPs, or verification waits</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#25233A]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Ready for direct assignment ordering</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#25233A]/50 mt-8">
                By registering, you agree to our{' '}
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
