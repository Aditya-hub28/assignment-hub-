import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', to: '/dashboard' },
  { key: 'services', label: 'Services', to: '/services' },
  { key: 'my-requests', label: 'My Requests', to: '/my-requests' },
  { key: 'inquiries', label: 'Inquiries', to: '/inquiries' },
];

export function Navbar({ activePage, onNewRequest, onOpenProfile, onSelectInquiry }) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute active item
  const currentActiveKey = (() => {
    if (activePage) return activePage;
    const pathname = location.pathname;
    if (pathname === '/dashboard' || pathname === '/') return 'home';
    if (pathname.startsWith('/services')) return 'services';
    if (pathname.startsWith('/my-requests')) return 'my-requests';
    if (pathname.startsWith('/inquiries')) return 'inquiries';
    return 'home';
  })();

  // Fallback defaults for user info
  const fullName = profile?.fullName || profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Student';
  const firstName = fullName.split(' ')[0] || 'Student';
  const initial = (fullName.charAt(0) || 'A').toUpperCase();
  const email = profile?.email || user?.email || 'student@college.edu';

  const handleLogoutClick = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNewRequestClick = () => {
    if (typeof onNewRequest === 'function') {
      onNewRequest();
    } else {
      navigate('/services');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-[#E2DCFF]/50 shadow-[0_4px_20px_rgba(108,99,255,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand & Workspace Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center clay-card shadow-sm shrink-0 border border-[#6C63FF]/20">
              <img src="/logo.png" alt="Assignment Hub" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:inline-block text-xl font-extrabold text-[#25233A] tracking-tight whitespace-nowrap">
              Assignment<span className="text-[#6C63FF]">Hub</span>
            </span>
          </Link>

          <span className="hidden md:inline-flex items-center px-3.5 py-1 rounded-full bg-[#EDE8FA] text-[#6E6A8A] text-xs font-semibold clay-pill-inset whitespace-nowrap">
            Student Workspace
          </span>
        </div>

        {/* Centered Navigation Bar (Pill Shape) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#EDE8FA] rounded-full clay-pill-inset shrink-0"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentActiveKey === item.key;
            if (isActive) {
              return (
                <span
                  key={item.key}
                  className="px-5 py-2 rounded-full text-sm font-bold bg-[#DCD6FF] text-[#4D41DF] shadow-sm cursor-default select-none whitespace-nowrap"
                >
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.key}
                to={item.to}
                className="px-5 py-2 rounded-full text-sm font-semibold text-[#464555] hover:text-[#1B192F] hover:bg-[#F3EFFF]/60 transition-all duration-200 select-none whitespace-nowrap"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls: CTA, Notifications & User Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Distinct New Request CTA button with icon and prominent elevation */}
          <button
            type="button"
            onClick={handleNewRequestClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#6C63FF] text-white text-xs sm:text-sm font-bold clay-btn-primary hover:bg-[#5b52f5] active:scale-95 transition-all cursor-pointer shadow-md whitespace-nowrap"
            aria-label="Create New Request"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Request</span>
          </button>

          {/* Notification Bell */}
          <NotificationBell onSelectInquiry={onSelectInquiry} />

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
              aria-label="User profile menu"
              className="flex items-center gap-2 p-1.5 pr-3.5 rounded-full bg-white clay-card hover:bg-[#FAF8FF] transition-all cursor-pointer border border-white"
            >
              <div className="w-8 h-8 rounded-full bg-[#6C63FF] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                {initial}
              </div>
              <span className="hidden md:inline-block text-sm text-[#25233A] font-semibold max-w-[120px] truncate">
                {firstName}
              </span>
              <span
                className={`material-symbols-outlined text-[18px] text-[#6E6A8A] transition-transform duration-200 ${
                  userDropdownOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 z-50 clay-card shadow-2xl border border-[#E2DCFF]/60 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-[#E2DCFF] mb-1">
                  <p className="text-xs text-[#6E6A8A] font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-[#25233A] truncate" title={email}>
                    {email}
                  </p>
                </div>

                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">person</span>
                    <span>My Profile</span>
                  </button>
                )}

                <Link
                  to="/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">dashboard</span>
                  <span>Student Dashboard</span>
                </Link>

                <Link
                  to="/services"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">category</span>
                  <span>Academic Services</span>
                </Link>

                <Link
                  to="/my-requests"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">inventory_2</span>
                  <span>My Requests</span>
                </Link>

                <Link
                  to="/inquiries"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E6A8A] hover:bg-[#F3F0FF] hover:text-[#25233A] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#6C63FF]">chat</span>
                  <span>Inquiries</span>
                </Link>

                <div className="my-1 h-px bg-[#E2DCFF]"></div>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF2F2] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
