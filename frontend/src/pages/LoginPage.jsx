import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = typeof err === 'string'
        ? err
        : (err?.message && err.message !== '[object Object]' ? err.message : 'Login failed. Please check your credentials.');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans selection:bg-[#6C63FF] selection:text-white">
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
            <span className="hidden sm:inline-block text-sm font-medium text-[#25233A]/70">Don't have an account?</span>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#6C63FF] bg-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-white"
            >
              <span>Sign Up</span>
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
              Welcome back to <span className="text-[#6C63FF]">Assignment Hub</span>
            </h1>

            <p className="text-sm font-medium text-[#25233A]/75 mb-6 leading-relaxed">
              Your academic work, all in one place. Log in to track your college assignment solutions, practical files, and active orders.
            </p>

            <div className="w-full relative rounded-2xl overflow-hidden shadow-md border border-white">
              {/* Badge Over Image: Top Left */}
              <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-[#25233A] shadow-sm flex items-center gap-1.5 border border-white">
                <span>📚</span>
                <span>Practical & Coding Help</span>
              </div>

              {/* 3D Clay Cartoon Student at Study Desk */}
              <img
                src="/images/student-desk.png"
                alt="Student study desk 3D clay illustration"
                className="w-full h-auto object-cover rounded-2xl transform hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Badge Over Image: Bottom Right */}
              <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-[#25233A] shadow-sm flex items-center gap-1.5 border border-white">
                <span className="w-4 h-4 rounded-full bg-[#EDFBF4] text-[#55C595] flex items-center justify-center text-[10px] font-black">✓</span>
                <span>Semester Grade Focus • 100% On-Time Deliveries</span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="clay-surface rounded-3xl p-7 sm:p-9">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm shrink-0 border border-[#6C63FF]/20">
                    <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider block">Student Login</span>
                    <h2 className="text-2xl font-extrabold text-[#25233A] tracking-tight">Sign In</h2>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#55C595] shadow-[0_0_8px_#55C595]"></div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#FFF2F2] border border-[#FFCDCD] flex items-center gap-2.5 text-xs font-semibold text-[#BA1A1A]">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#25233A]/70 mb-1.5">Email Address</label>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF] transition-all">
                    <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">mail</span>
                    <input
                      type="email"
                      placeholder="name@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#25233A] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#25233A]/70">Password</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-[#6C63FF] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E2DCFF] flex items-center gap-2.5 shadow-sm focus-within:border-[#6C63FF] transition-all">
                    <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
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
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#25233A]/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#6C63FF] focus:ring-0"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-full bg-[#6C63FF] text-white text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In to Assignment Hub</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-5 border-t border-[#E2DCFF] text-center text-xs font-semibold text-[#25233A]/70">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#6C63FF] font-bold hover:underline">
                  Create an Account
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-medium text-[#25233A]/60">
        © 2026 Assignment Hub. Built for college students.
      </footer>
    </div>
  );
}
