import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function MobileBottomNav({ activeTab, onOpenProfile, badgeCounts }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, profile, logout } = useAuth();
  
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);

  const fullName = profile?.fullName || profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Student';
  const initial = (fullName.charAt(0) || 'A').toUpperCase();
  const email = profile?.email || user?.email || 'student@college.edu';
  const collegeName = profile?.college || profile?.collegeName || user?.college || 'Academic Campus';

  const tabs = [
    {
      id: 'home',
      name: 'Home',
      path: '/dashboard',
      icon: 'home'
    },
    {
      id: 'services',
      name: 'Services',
      path: '/services',
      icon: 'category'
    },
    {
      id: 'requests',
      name: 'My Requests',
      path: '/my-requests',
      icon: 'inventory_2',
      badge: badgeCounts?.requests
    },
    {
      id: 'inquiries',
      name: 'Inquiries',
      path: '/inquiries',
      icon: 'chat_bubble',
      badge: badgeCounts?.inquiries || '2'
    }
  ];

  const getIsActive = (tab) => {
    if (activeTab) return activeTab === tab.id;
    if (tab.path === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(tab.path);
  };

  const handleProfileClick = () => {
    if (typeof onOpenProfile === 'function') {
      onOpenProfile();
    } else {
      setInternalDrawerOpen(true);
    }
  };

  const handleLogout = async () => {
    setInternalDrawerOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* 5-Item Fixed Bottom Claymorphism Dock */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl border-t border-[#E2DCFF]/80 py-1.5 sm:py-2 px-1.5 sm:px-4 flex lg:hidden items-center justify-around shadow-[0_-4px_24px_rgba(108,99,255,0.08)] select-none"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0.375rem))' }}
      >
        {tabs.map((tab) => {
          const isActive = getIsActive(tab);
          return (
            <Link
              key={tab.id}
              to={tab.path}
              aria-label={tab.name}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-3.5 rounded-full transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'bg-[#DCD6FF] text-[#4D41DF] font-bold shadow-sm scale-[1.02]'
                  : 'text-[#6E6A8A] hover:text-[#25233A] hover:bg-[#F3EFFF]/60 font-semibold'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[21px] sm:text-[22px] transition-transform ${
                    isActive ? 'scale-105 font-bold' : ''
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {tab.icon}
                </span>
                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-[#6C63FF] text-white text-[9px] flex items-center justify-center font-bold shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* 5th Item: Profile Trigger */}
        <button
          type="button"
          onClick={handleProfileClick}
          aria-label="Student Profile"
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-3.5 rounded-full transition-all duration-200 min-w-[56px] cursor-pointer ${
            activeTab === 'profile' || internalDrawerOpen
              ? 'bg-[#DCD6FF] text-[#4D41DF] font-bold shadow-sm scale-[1.02]'
              : 'text-[#6E6A8A] hover:text-[#25233A] hover:bg-[#F3EFFF]/60 font-semibold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`material-symbols-outlined text-[21px] sm:text-[22px] transition-transform ${
                activeTab === 'profile' || internalDrawerOpen ? 'scale-105 font-bold' : ''
              }`}
              style={activeTab === 'profile' || internalDrawerOpen ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              account_circle
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap leading-none">
            Profile
          </span>
        </button>
      </nav>

      {/* Built-in Mobile Profile Drawer / Sheet (Fallback or Standalone) */}
      {internalDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#25233A]/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setInternalDrawerOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 clay-card shadow-2xl border border-white max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for Mobile */}
            <div className="w-12 h-1.5 bg-[#E2DCFF] rounded-full mx-auto mb-4 sm:hidden"></div>

            {/* Profile Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EBFF] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center text-lg font-bold shadow-md">
                  {initial}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#25233A] leading-snug">
                    {fullName}
                  </h3>
                  <p className="text-xs text-[#6E6A8A] font-medium truncate max-w-[200px]" title={email}>
                    {email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInternalDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8FF] hover:bg-[#F0EBFF] text-[#25233A] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Campus Info Pill */}
            <div className="p-3 rounded-2xl bg-[#FAF8FF] border border-[#E2DCFF]/70 mb-5 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">school</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-[#6E6A8A] uppercase tracking-wider">Campus / College</span>
                <span className="text-xs font-bold text-[#25233A] truncate">{collegeName}</span>
              </div>
            </div>

            {/* Fast Navigation Shortcuts */}
            <div className="space-y-1 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A8A] px-1 mb-1 block">
                Quick Navigation
              </span>
              <Link
                to="/dashboard"
                onClick={() => setInternalDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F3F0FF] text-[#25233A] transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">dashboard</span>
                <span>Student Dashboard</span>
              </Link>
              <Link
                to="/services"
                onClick={() => setInternalDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F3F0FF] text-[#25233A] transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">category</span>
                <span>Academic Services</span>
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setInternalDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F3F0FF] text-[#25233A] transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">inventory_2</span>
                <span>My Requests</span>
              </Link>
              <Link
                to="/inquiries"
                onClick={() => setInternalDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F3F0FF] text-[#25233A] transition-colors font-semibold text-xs"
              >
                <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">chat</span>
                <span>Inquiries & Support</span>
              </Link>
            </div>

            {/* Logout Action */}
            <div className="pt-4 border-t border-[#F0EBFF] flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold text-[#BA1A1A] hover:bg-[#FFF2F2] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={() => setInternalDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#25233A]/70 hover:bg-[#FAF8FF] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileBottomNav;
