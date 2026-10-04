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

  // Academic Details Storage Key
  const storageKey = `ah_academic_details_${profile?.id || user?.id || user?.email || 'student'}`;

  // Academic Details State
  const [academicDetails, setAcademicDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      studentName: '',
      branch: '',
      year: '',
      semester: '',
      division: '',
      rollNo: ''
    };
  });

  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [academicForm, setAcademicForm] = useState(academicDetails);
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);

  // Edit basic name state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(fullName);
  const [isSaving, setIsSaving] = useState(false);

  // Stats state
  const [stats, setStats] = useState({ totalRequests: 0, activeInquiries: 0 });

  // Calculate profile completion percentage
  // By default after login: 50% complete (basic registration/auth info exists).
  // Once academic details (branch, year, semester) are added: 100% complete!
  const hasAcademicDetails = Boolean(
    academicDetails.branch &&
    academicDetails.year &&
    academicDetails.semester
  );
  const profileCompletionPercent = hasAcademicDetails ? 100 : 50;

  useEffect(() => {
    setEditName(fullName);
  }, [fullName]);

  useEffect(() => {
    // When user changes or on mount, load user-specific academic details
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAcademicDetails(parsed);
        setAcademicForm(parsed);
      } else {
        const initialForm = {
          studentName: fullName,
          branch: '',
          year: '',
          semester: '',
          division: '',
          rollNo: ''
        };
        setAcademicDetails(initialForm);
        setAcademicForm(initialForm);
      }
    } catch {
      // ignore
    }
  }, [storageKey, fullName]);

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

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim() === fullName) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ full_name: editName.trim() });
      setIsEditing(false);
      // Also update studentName in academic details if present
      const updatedAcademics = { ...academicDetails, studentName: editName.trim() };
      setAcademicDetails(updatedAcademics);
      localStorage.setItem(storageKey, JSON.stringify(updatedAcademics));
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAcademicDetails = async (e) => {
    e.preventDefault();
    if (!academicForm.branch || !academicForm.year || !academicForm.semester) {
      showToast('Please fill in Branch, Academic Year, and Semester.', 'error');
      return;
    }

    setIsSavingAcademic(true);
    try {
      const payload = {
        studentName: academicForm.studentName?.trim() || fullName,
        branch: academicForm.branch.trim(),
        year: academicForm.year.trim(),
        semester: academicForm.semester.trim(),
        division: academicForm.division?.trim() || '',
        rollNo: academicForm.rollNo?.trim() || ''
      };

      // Save to local storage for persistence across reloads
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setAcademicDetails(payload);
      setIsEditingAcademic(false);

      // If user also changed their full name in the form, sync it
      if (payload.studentName && payload.studentName !== fullName) {
        try {
          await updateProfile({ full_name: payload.studentName });
        } catch {
          // ignore backend sync error if any
        }
      }

      showToast('Academic details saved! Profile is now 100% complete.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save academic details.', 'error');
    } finally {
      setIsSavingAcademic(false);
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
      <main className="w-full pt-24 sm:pt-28 pb-28 sm:pb-32 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-grow">
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
                    <form onSubmit={handleSaveName} className="flex items-center gap-2 w-full max-w-sm">
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

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE8FA] text-[#6C63FF] text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      {role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>

                    {/* Profile Completion Badge: Only 50% after login until academic details are filled */}
                    {profileCompletionPercent < 100 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] text-xs font-extrabold border border-[#FDE68A] shadow-xs">
                        <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                        50% Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 shadow-xs">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        100% Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* Profile Completion Progress Banner           */}
          {/* ============================================ */}
          <section className="w-full bg-white rounded-3xl clay-card p-5 sm:p-6 border border-[#E2DCFF]/60 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-extrabold text-[#25233A]">Profile Completion</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      profileCompletionPercent === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#FFEDD5] text-[#C2410C]'
                    }`}
                  >
                    {profileCompletionPercent}%
                  </span>
                </div>
                <p className="text-xs text-[#6E6A8A] font-medium leading-relaxed">
                  {profileCompletionPercent === 100
                    ? 'Your academic profile is 100% complete and verified. Your course specifics are synced for proper rubric formatting!'
                    : 'Your profile is 50% complete. Please add your academic details (Branch, Year, Semester & Roll Number) below to reach 100% completion.'}
                </p>

                {/* Progress Track */}
                <div className="w-full h-3 bg-[#EDE8FA] rounded-full mt-3 overflow-hidden p-0.5 clay-pill-inset">
                  <div
                    className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                      profileCompletionPercent === 100
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-r from-[#FFB84D] to-[#6C63FF]'
                    }`}
                    style={{ width: `${profileCompletionPercent}%` }}
                  />
                </div>
              </div>

              {profileCompletionPercent < 100 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAcademic(true);
                    const el = document.getElementById('academic-details-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="shrink-0 px-4 py-2.5 rounded-full bg-[#6C63FF] hover:bg-[#5b52f5] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  <span>Complete Academic Details</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                </button>
              )}
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
          {/* Academic Details Section                     */}
          {/* ============================================ */}
          <section id="academic-details-section" className="w-full bg-white rounded-3xl clay-card p-6 sm:p-8 scroll-mt-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F0EBFF]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDE8FA] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-[#6C63FF]">school</span>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#25233A] leading-tight">Academic Details</h2>
                  <p className="text-xs text-[#6E6A8A] font-medium">Department, year, semester, and college identification</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {hasAcademicDetails ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Completed (100%)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4E5] text-[#D97706] text-xs font-bold border border-[#FDE68A]">
                    <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                    <span>Needs Details (50%)</span>
                  </span>
                )}

                {!isEditingAcademic && hasAcademicDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      setAcademicForm(academicDetails);
                      setIsEditingAcademic(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#EDE8FA] hover:bg-[#E2DCFF] text-[#6C63FF] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingAcademic || !hasAcademicDetails ? (
              <form onSubmit={handleSaveAcademicDetails} className="flex flex-col gap-4">
                {!hasAcademicDetails && (
                  <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#FFE7C2] flex items-start sm:items-center gap-3 text-xs text-[#9A5B00]">
                    <span className="material-symbols-outlined text-[22px] text-[#FFB84D] shrink-0">assignment_late</span>
                    <span>
                      Your profile is currently at <strong>50%</strong>. Please fill your branch, academic year, and semester below so our coordinators format your assignments according to your college's official guidelines (updates to <strong>100%</strong>).
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={academicForm.studentName || ''}
                      onChange={(e) => setAcademicForm({ ...academicForm, studentName: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                    />
                  </div>

                  {/* College / Institution */}
                  <div>
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Campus / College
                    </label>
                    <input
                      type="text"
                      disabled
                      value={collegeName}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F0EBFF]/60 border border-[#E2DCFF] text-sm text-[#6E6A8A] font-medium cursor-not-allowed"
                    />
                  </div>

                  {/* Branch / Department */}
                  <div>
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Branch / Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={academicForm.branch || ''}
                      onChange={(e) => setAcademicForm({ ...academicForm, branch: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all cursor-pointer"
                    >
                      <option value="">Select Branch / Department</option>
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="CSE (AIML)">CSE (AIML)</option>
                      <option value="Electronics and Computer Engineering">Electronics and Computer Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Academic Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={academicForm.year || ''}
                      onChange={(e) => setAcademicForm({ ...academicForm, year: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all cursor-pointer"
                    >
                      <option value="">Select Academic Year</option>
                      <option value="First Year (FE)">First Year (FE)</option>
                      <option value="Second Year (SE)">Second Year (SE)</option>
                      <option value="Third Year (TE)">Third Year (TE)</option>
                      <option value="Final Year (BE / B.Tech)">Final Year (BE / B.Tech)</option>
                      <option value="Postgraduate (ME / M.Tech / MBA)">Postgraduate (ME / M.Tech / MBA)</option>
                    </select>
                  </div>

                  {/* Current Semester */}
                  <div>
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Current Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={academicForm.semester || ''}
                      onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all cursor-pointer"
                    >
                      <option value="">Select Semester</option>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>

                  {/* Division / Section */}
                  <div>
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Division / Section <span className="text-[#6E6A8A] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={academicForm.division || ''}
                      onChange={(e) => setAcademicForm({ ...academicForm, division: e.target.value })}
                      placeholder="e.g. Div A, Div B"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                    />
                  </div>

                  {/* Roll No / PRN */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#25233A] mb-1.5">
                      Roll Number / PRN / Student ID <span className="text-[#6E6A8A] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={academicForm.rollNo || ''}
                      onChange={(e) => setAcademicForm({ ...academicForm, rollNo: e.target.value })}
                      placeholder="e.g. 2024-COMP-042 or Roll No. 28"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E2DCFF] text-sm text-[#25233A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:border-[#6C63FF] transition-all"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="submit"
                    disabled={isSavingAcademic}
                    className="px-6 py-2.5 rounded-full bg-[#6C63FF] hover:bg-[#5b52f5] text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>{isSavingAcademic ? 'Saving...' : 'Save Academic Details'}</span>
                  </button>

                  {hasAcademicDetails && (
                    <button
                      type="button"
                      onClick={() => {
                        setAcademicForm(academicDetails);
                        setIsEditingAcademic(false);
                      }}
                      className="px-5 py-2.5 rounded-full bg-[#FAF8FF] hover:bg-[#F0EBFF] text-[#6E6A8A] text-sm font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              /* Read-Only Grid Display */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Student Full Name */}
                <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Student Name</p>
                  <p className="text-sm font-bold text-[#25233A]">{academicDetails.studentName || fullName}</p>
                </div>

                {/* Branch / Stream */}
                <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Branch / Department</p>
                  <p className="text-sm font-bold text-[#25233A]">{academicDetails.branch}</p>
                </div>

                {/* Academic Year */}
                <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Academic Year</p>
                  <p className="text-sm font-bold text-[#25233A]">{academicDetails.year}</p>
                </div>

                {/* Current Semester */}
                <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Current Semester</p>
                  <p className="text-sm font-bold text-[#25233A]">{academicDetails.semester}</p>
                </div>

                {/* Division */}
                <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Division / Section</p>
                  <p className="text-sm font-bold text-[#25233A]">{academicDetails.division || 'Not specified'}</p>
                </div>

                {/* Roll No / PRN */}
                <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/60 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider mb-1">Roll No / PRN</p>
                  <p className="text-sm font-bold text-[#25233A]">{academicDetails.rollNo || 'Not specified'}</p>
                </div>
              </div>
            )}
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
