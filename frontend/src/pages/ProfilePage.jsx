import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';

export function ProfilePage() {
  const { user, profile, logout, updateProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Derived user fields
  const fullName = profile?.fullName || profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Student';
  const firstName = fullName.split(' ')[0] || 'Student';
  const initial = (fullName.charAt(0) || 'A').toUpperCase();
  const email = profile?.email || user?.email || 'student@college.edu';
  const mobile = profile?.mobile ? `+91 ${profile.mobile}` : 'Not provided';
  const collegeName = profile?.college?.name || 'Academic Campus';
  const collegeCode = profile?.college?.code || '';
  const role = profile?.role || 'student';
  const joinDate = profile?.createdAt || user?.created_at;

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(fullName);
  const [isSaving, setIsSaving] = useState(false);

  // Stats state
  const [stats, setStats] = useState({ totalRequests: 0, activeInquiries: 0 });

  useEffect(() => {
    setEditName(fullName);
  }, [fullName]);

  // Fetch quick stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reqRes, inqRes] = await Promise.all([
          api.services.getRequests().catch(() => ({ data: { requests: [] } })),
          api.inquiries.getInquiries().catch(() => ({ data: { inquiries: [] } }))
        ]);
        const requests = reqRes?.data?.requests || reqRes?.requests || [];
        const inquiries = inqRes?.data?.inquiries || inqRes?.inquiries || [];
        setStats({
          totalRequests: Array.isArray(requests) ? requests.length : 0,
          activeInquiries: Array.isArray(inquiries) ? inquiries.filter(i => i.status === 'active').length : 0
        });
      } catch {
        // Silent fail
      }
    };
    fetchStats();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim() === fullName) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ full_name: editName.trim() });
      setIsEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return 'Recently joined';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Recently joined';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col font-sans text-[#25233A] relative">
      
      {/* Navbar */}
      <Navbar activePage="profile" />

      {/* Main Content */}
      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 px-3.5 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-grow">
        <div className="flex flex-col w-full gap-6 animate-in fade-in duration-300">

          {/* ============================================ */}
          {/* Profile Header Card                         */}
          {/* ============================================ */}
          <section className="w-full bg-white rounded-3xl clay-card relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#6C63FF]/8 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#6C63FF] to-[#8B7CFF] text-white flex items-center justify-center text-3xl sm:text-4xl font-extrabold shadow-[0_8px_28px_rgba(108,99,255,0.3)] transition-transform hover:scale-105">
                    {initial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[12px]">check</span>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="flex flex-col items-center sm:items-start gap-1.5 flex-1 min-w-0">
                  {isEditing ? (
                    <form onSubmit={handleSave} className="flex items-center gap-2 w-full max-w-sm">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-base font-bold text-[#25233A] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                        autoFocus
                        disabled={isSaving}
                      />
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-3.5 py-2 rounded-xl bg-[#6C63FF] hover:bg-[#5b52f5] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSaving ? '...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setEditName(fullName); }}
                        className="px-3 py-2 rounded-xl bg-[#FAF8FF] hover:bg-[#F0EBFF] text-[#6E6A8A] text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25233A] tracking-tight">
                        {fullName}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 rounded-lg hover:bg-[#F0EBFF] text-[#6E6A8A] hover:text-[#6C63FF] transition-all cursor-pointer"
                        title="Edit name"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                  )}

                  <p className="text-sm text-[#6E6A8A] font-medium">{email}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      {role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* Quick Stats Row                              */}
          {/* ============================================ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white clay-card text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#EDE8FA] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">inventory_2</span>
              </div>
              <p className="text-xl font-extrabold text-[#25233A]">{stats.totalRequests}</p>
              <p className="text-[11px] text-[#6E6A8A] font-semibold mt-0.5">Total Requests</p>
            </div>
            <div className="p-4 rounded-2xl bg-white clay-card text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#E6F9EF] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px] text-[#55C595]">chat_bubble</span>
              </div>
              <p className="text-xl font-extrabold text-[#25233A]">{stats.activeInquiries}</p>
              <p className="text-[11px] text-[#6E6A8A] font-semibold mt-0.5">Active Inquiries</p>
            </div>
            <div className="p-4 rounded-2xl bg-white clay-card text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#FFF4E5] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px] text-[#FFB84D]">verified_user</span>
              </div>
              <p className="text-xl font-extrabold text-[#25233A]">FERPA</p>
              <p className="text-[11px] text-[#6E6A8A] font-semibold mt-0.5">Compliance</p>
            </div>
            <div className="p-4 rounded-2xl bg-white clay-card text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#F0EBFF] flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[20px] text-[#4D41DF]">calendar_month</span>
              </div>
              <p className="text-sm font-extrabold text-[#25233A] leading-tight">{formatJoinDate(joinDate).split(', ')[0] || 'Recent'}</p>
              <p className="text-[11px] text-[#6E6A8A] font-semibold mt-0.5">Member Since</p>
            </div>
          </div>

          {/* ============================================ */}
          {/* Account Information Card                     */}
          {/* ============================================ */}
          <section className="w-full bg-white rounded-3xl clay-card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#EDE8FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">person</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#25233A]">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-sm font-bold text-[#25233A]">{fullName}</p>
              </div>

              {/* Email */}
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-bold text-[#25233A] truncate">{email}</p>
              </div>

              {/* Mobile */}
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Mobile Number</p>
                <p className="text-sm font-bold text-[#25233A]">{mobile}</p>
              </div>

              {/* College */}
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Campus / College</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#6C63FF]">school</span>
                  <p className="text-sm font-bold text-[#25233A] truncate">{collegeName}</p>
                  {collegeCode && (
                    <span className="px-2 py-0.5 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-[10px] font-bold">{collegeCode}</span>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Account Role</p>
                <p className="text-sm font-bold text-[#25233A] capitalize">{role}</p>
              </div>

              {/* Member Since */}
              <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-sm font-bold text-[#25233A]">{formatJoinDate(joinDate)}</p>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* Quick Actions Card                           */}
          {/* ============================================ */}
          <section className="w-full bg-white rounded-3xl clay-card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#EDE8FA] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">grid_view</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#25233A]">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/services/new"
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B7CFF] text-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">add_circle</span>
                </div>
                <div>
                  <p className="text-sm font-bold">New Request</p>
                  <p className="text-xs text-white/70">Submit a new assignment</p>
                </div>
              </Link>

              <Link
                to="/my-requests"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 hover:bg-[#F0EBFF] hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EDE8FA] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-[#6C63FF]">inventory_2</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#25233A]">My Requests</p>
                  <p className="text-xs text-[#6E6A8A]">Track all your submissions</p>
                </div>
              </Link>

              <Link
                to="/inquiries"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 hover:bg-[#F0EBFF] hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E6F9EF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-[#55C595]">chat</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#25233A]">Inquiries</p>
                  <p className="text-xs text-[#6E6A8A]">Chat with Admin</p>
                </div>
              </Link>

              <Link
                to="/services"
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 hover:bg-[#F0EBFF] hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF4E5] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-[#FFB84D]">category</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#25233A]">Services</p>
                  <p className="text-xs text-[#6E6A8A]">Browse all services</p>
                </div>
              </Link>
            </div>
          </section>

          {/* ============================================ */}
          {/* Security & Privacy Card                      */}
          {/* ============================================ */}
          <section className="w-full bg-white rounded-3xl clay-card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">shield</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#25233A]">Security & Privacy</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <span className="material-symbols-outlined text-[20px] text-emerald-500">lock</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#25233A]">Password Protected</p>
                  <p className="text-xs text-[#6E6A8A]">Your account is secured with encrypted credentials</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <span className="material-symbols-outlined text-[20px] text-[#6C63FF]">verified_user</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#25233A]">FERPA Compliant</p>
                  <p className="text-xs text-[#6E6A8A]">All academic data is handled per compliance standards</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60">
                <span className="material-symbols-outlined text-[20px] text-[#FFB84D]">encrypted</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#25233A]">End-to-End Encrypted</p>
                  <p className="text-xs text-[#6E6A8A]">Your conversations and files are encrypted in transit</p>
                </div>
                <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* Danger Zone / Logout                         */}
          {/* ============================================ */}
          <section className="w-full bg-white rounded-3xl clay-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-[#BA1A1A]">logout</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#25233A]">Sign Out</h3>
                  <p className="text-xs text-[#6E6A8A]">Sign out of your AssignmentHub account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-[#FFF2F2] hover:bg-[#FFE5E5] text-[#BA1A1A] text-sm font-bold transition-all cursor-pointer active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        activeTab="profile"
        onOpenProfile={() => {/* Already on profile page */}}
      />
    </div>
  );
}

export default ProfilePage;
