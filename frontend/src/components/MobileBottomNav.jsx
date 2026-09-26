import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function MobileBottomNav({ activeTab }) {
  const location = useLocation();
  const currentPath = location.pathname;

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
      icon: 'grid_view'
    },
    {
      id: 'requests',
      name: 'My Requests',
      path: '/my-requests',
      icon: 'inventory_2'
    },
    {
      id: 'inquiries',
      name: 'Inquiries',
      path: '/inquiries',
      icon: 'chat_bubble',
      badge: '2'
    }
  ];

  const getIsActive = (tab) => {
    if (activeTab) return activeTab === tab.id;
    if (tab.path === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(tab.path);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container py-1.5 px-3 flex lg:hidden items-center justify-around shadow-[0_-4px_24px_rgba(108,99,255,0.08)]"
    >
      {tabs.map((tab) => {
        const isActive = getIsActive(tab);
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'bg-surface-container-highest text-primary font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_2px_rgba(77,65,223,0.1)] scale-105'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span className={`material-symbols-outlined text-[22px] transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              {tab.badge && !isActive && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed text-[9px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight font-medium mt-0.5 whitespace-nowrap">
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
