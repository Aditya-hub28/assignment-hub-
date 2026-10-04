import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Background ambient accents */}
      <div className="fixed w-96 h-96 bg-[#8B7CFF]/15 -top-20 -left-20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed w-[450px] h-[450px] bg-[#6C63FF]/15 bottom-10 -right-20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm border border-[#6C63FF]/20 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#25233A]">
              Assignment<span className="text-[#6C63FF]">Hub</span>
            </span>
            <span className="text-[10px] font-bold text-[#8B7CFF] -mt-1 tracking-wider uppercase">
              Student Workspace
            </span>
          </div>
        </Link>
      </header>

      {/* Centered 404 Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 relative z-10">
        <div className="w-full max-w-lg clay-surface rounded-3xl p-8 sm:p-12 text-center border border-white">
          {/* Animated 404 Badge */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#F3F0FF] text-[#6C63FF] shadow-inner mb-6">
            <span className="text-4xl font-extrabold tracking-tight">404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25233A] tracking-tight mb-3">
            Lost on Campus?
          </h1>
          <p className="text-sm text-[#25233A]/70 leading-relaxed mb-8 max-w-md mx-auto">
            The page or assignment link you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={user ? "/dashboard" : "/"}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#6C63FF] text-white text-xs sm:text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#6C63FF]/25"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>{user ? 'Go to Dashboard' : 'Return to Home'}</span>
            </Link>

            <Link
              to="/services"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-[#25233A] text-xs sm:text-sm font-bold clay-card hover:text-[#6C63FF] transition-all flex items-center justify-center gap-2 border border-[#E2DCFF]"
            >
              <span className="material-symbols-outlined text-[18px]">school</span>
              <span>Explore Services</span>
            </Link>
          </div>

          {user && (
            <div className="mt-8 pt-6 border-t border-[#E2DCFF]/60 text-xs text-[#25233A]/60 flex items-center justify-center gap-4">
              <Link to="/my-requests" className="hover:text-[#6C63FF] transition-colors font-medium">My Requests</Link>
              <span>&bull;</span>
              <Link to="/inquiries" className="hover:text-[#6C63FF] transition-colors font-medium">Support Inquiries</Link>
              <span>&bull;</span>
              <Link to="/profile" className="hover:text-[#6C63FF] transition-colors font-medium">Profile</Link>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 text-center text-xs text-[#25233A]/50">
        &copy; {new Date().getFullYear()} Assignment Hub. All rights reserved.
      </footer>
    </div>
  );
}
