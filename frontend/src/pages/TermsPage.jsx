import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function TermsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between font-sans relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed w-96 h-96 bg-[#8B7CFF]/15 -top-20 -left-20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed w-[450px] h-[450px] bg-[#FFB84D]/10 bottom-10 -right-20 rounded-full blur-3xl pointer-events-none" />

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
                Terms of Service
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
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Platform Agreement & Academic Honor Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#25233A] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-[#25233A]/70">
            Last Updated: October 4, 2026 &bull; Please read these terms carefully before accessing AssignmentHub services.
          </p>
        </div>

        {/* Terms Body */}
        <div className="clay-card rounded-3xl p-6 sm:p-10 space-y-8 text-[#25233A]/85 text-sm sm:text-base leading-relaxed bg-white">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By creating an account, browsing the website, or submitting a service request on AssignmentHub (&ldquo;Platform&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, alongside our Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">2</span>
              <span>Academic Integrity & Educational Purpose</span>
            </h2>
            <p>
              AssignmentHub is dedicated to supporting students in mastering complex engineering, technical, and academic coursework. The materials, solutions, laboratory guides, coding prototypes, and models provided via the Platform are designed exclusively as:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-[#25233A]/75">
              <li>Educational reference models and learning aids to accelerate subject comprehension.</li>
              <li>Structural drafts and calculation templates to assist you in preparing your own collegiate deliverables.</li>
              <li>Technical prototypes demonstrating correct implementation standards for engineering projects.</li>
            </ul>
            <p className="text-xs sm:text-sm bg-[#FAF8FF] p-4 rounded-2xl border border-[#E2DCFF] text-[#25233A]/80">
              <strong className="text-[#6C63FF]">Important Notice:</strong> You are responsible for ensuring that your use of delivered materials adheres strictly to your college or university's academic honor codes and submission guidelines.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">3</span>
              <span>Student Account Security</span>
            </h2>
            <p>
              When creating an account, you must provide truthful information, including your full name, student email, and verified mobile number. You are responsible for maintaining the confidentiality of your credentials and for all activities conducted under your account.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">4</span>
              <span>Service Requests & Order Fulfillment</span>
            </h2>
            <p>
              When placing an order for Assignments, Practical Files, Mini Projects, CAD Drawings, or Custom Services:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-[#25233A]/75">
              <li>
                <strong className="text-[#25233A]">Specification Accuracy:</strong> You must supply clear, unambiguous instructions, syllabus files, and accurate deadlines at the time of submission.
              </li>
              <li>
                <strong className="text-[#25233A]">Delivery Timeframe:</strong> We guarantee delivery by your requested deadline, contingent upon receiving complete requirements and timely student responses to clarification inquiries.
              </li>
              <li>
                <strong className="text-[#25233A]">File Constraints:</strong> Uploaded attachments must not exceed 50 MB in total size and must belong to supported formats (.pdf, .doc, .docx, .ppt, .pptx, .png, .jpg, .jpeg, .zip, .rar).
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">5</span>
              <span>Revision Policy</span>
            </h2>
            <p>
              We stand behind the quality of our academic solutions. We offer complimentary reasonable revisions if the delivered work deviates from the instructions you originally submitted. Revision requests must be communicated within 7 days of delivery via the dedicated Inquiries channel.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">6</span>
              <span>Community & Conduct Standards</span>
            </h2>
            <p>
              We promote a courteous, supportive environment. Any form of abusive language, harassment, or unlawful content in inquiries, request descriptions, or file uploads will result in immediate suspension of account privileges.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#25233A] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#F3F0FF] text-[#6C63FF] flex items-center justify-center text-sm font-extrabold">7</span>
              <span>Contact & Dispute Resolution</span>
            </h2>
            <p>
              For inquiries regarding terms, service scope, or dispute resolution, contact our coordination team:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A]/80">
              <p><strong>AssignmentHub Operations</strong></p>
              <p>Email: <a href="mailto:support@assignmenthub.in" className="text-[#6C63FF] font-semibold hover:underline">support@assignmenthub.in</a></p>
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
            <Link to="/terms" className="text-[#6C63FF] font-bold">Terms of Service</Link>
            <Link to="/privacy-policy" className="hover:text-[#6C63FF] transition-colors">Privacy Policy</Link>
            <Link to="/services" className="hover:text-[#6C63FF] transition-colors">Services</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
