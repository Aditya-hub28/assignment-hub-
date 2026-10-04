import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivacyPolicyPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed w-96 h-96 bg-[#8B7CFF]/15 -top-20 -left-20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed w-[450px] h-[450px] bg-[#6C63FF]/10 bottom-10 -right-20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF8FF]/80 border-b border-[#E2DCFF]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm border border-[#6C63FF]/20 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#25233A]">
                Assignment<span className="text-[#6C63FF]">Hub</span>
              </span>
              <span className="text-[10px] font-bold text-[#8B7CFF] -mt-1 hidden sm:block tracking-wider uppercase">
                Privacy Policy
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-full bg-[#6C63FF] text-white text-xs sm:text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-white text-[#25233A] text-xs sm:text-sm font-bold clay-card hover:text-[#6C63FF] transition-all border border-[#E2DCFF]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Banner Card */}
        <div className="clay-surface rounded-3xl p-6 sm:p-10 mb-8 border border-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#6C63FF] text-xs font-bold shadow-sm mb-4">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Official Policy & Data Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#25233A]/70">
            Last Updated: October 4, 2026 &bull; Effective for all registered students and platform visitors.
          </p>
        </div>

        {/* Policy Body */}
        <div className="clay-card rounded-3xl p-6 sm:p-10 space-y-8 text-[#25233A]/85 text-sm sm:text-base leading-relaxed bg-white">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">1</span>
              <span>Introduction</span>
            </h2>
            <p>
              AssignmentHub (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy and personal data. This Privacy Policy details how we collect, store, handle, and protect your information when you access or use the AssignmentHub web application, request academic services, communicate with coordinators, and manage your student profile.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">2</span>
              <span>Information We Collect</span>
            </h2>
            <p>We only collect information necessary to fulfill our academic assistance and coordination services:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-[#25233A]/75">
              <li>
                <strong className="text-[#25233A]">Account & Contact Data:</strong> Full name, student email address, verified 10-digit mobile phone number, and encrypted credentials managed via Supabase Authentication.
              </li>
              <li>
                <strong className="text-[#25233A]">Academic Profile Details:</strong> Branch of study (e.g. Computer Engineering, Information Technology, CSE (AIML), Electronics & Computer Engineering, Mechanical Engineering), Academic Year, Semester, Division, and College Roll Number.
              </li>
              <li>
                <strong className="text-[#25233A]">Service Request Information:</strong> Subject names, coursework topics, project specifications, deadline dates, special instructions, and reference documents or syllabus files you upload.
              </li>
              <li>
                <strong className="text-[#25233A]">Communications & Attachments:</strong> In-platform inquiry chat transcripts, questions, files, and coordination messages between you and our support team.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">3</span>
              <span>How We Use Your Information</span>
            </h2>
            <p>Your data is processed strictly for legitimate operational purposes:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-[#25233A]/75">
              <li>Reviewing, assigning, and fulfilling your custom academic orders and requests.</li>
              <li>Verifying student identity via One-Time Passwords (OTP) and secure tokens.</li>
              <li>Sending transactional notifications regarding order progress, deliverable uploads, and chat messages.</li>
              <li>Providing responsive student customer service and addressing revision requests.</li>
              <li>Preventing unauthorized platform access, fraud, or abuse.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">4</span>
              <span>Confidentiality & Data Protection</span>
            </h2>
            <p>
              We implement industry-standard safeguards to maintain the confidentiality of your academic identity:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-[#25233A]/75">
              <li>
                <strong className="text-[#25233A]">No Selling of Data:</strong> We never sell, rent, or trade your personal information, contact numbers, or student records to any third-party advertisers or lead brokers.
              </li>
              <li>
                <strong className="text-[#25233A]">Strict Authorization:</strong> Service requests and private inquiries are protected by server-side authorization checks. Only you and authorized assignment coordinators can access your files.
              </li>
              <li>
                <strong className="text-[#25233A]">Secure File Handling:</strong> Uploaded materials are stored in isolated directories with sanitized filenames to prevent directory traversal or malicious execution.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">5</span>
              <span>Your Rights & Choices</span>
            </h2>
            <p>
              As a student registered on AssignmentHub, you have full ownership of your personal profile:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-[#25233A]/75">
              <li>You can view and update your academic details anytime from your Student Profile page.</li>
              <li>You can request complete deletion of your account and associated request files by contacting our support team.</li>
              <li>You can review your active and past inquiries directly from the Inquiries center.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">6</span>
              <span>Contact Us</span>
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please reach out to our team:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A]/80">
              <p><strong>AssignmentHub Support</strong></p>
              <p>Email: <a href="mailto:support@assignmenthub.in" className="text-[#6C63FF] font-semibold hover:underline">support@assignmenthub.in</a></p>
              <p>Direct In-App Assistance: Open an inquiry via the <Link to="/inquiries" className="text-[#6C63FF] font-semibold hover:underline">Inquiries Center</Link>.</p>
            </div>
          </section>
        </div>

        {/* Back navigation */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#25233A] text-xs sm:text-sm font-bold clay-card hover:text-[#6C63FF] transition-all border border-[#E2DCFF]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Return to Homepage</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#F3F0FF] py-8 mt-12 border-t border-[#E2DCFF]/50 text-center text-xs text-[#25233A]/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-[#25233A]">Assignment<span className="text-[#6C63FF]">Hub</span> &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-[#6C63FF] transition-colors">Terms of Service</Link>
            <Link to="/privacy-policy" className="text-[#6C63FF] font-bold">Privacy Policy</Link>
            <Link to="/services" className="hover:text-[#6C63FF] transition-colors">Services</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
