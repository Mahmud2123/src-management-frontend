// components/Sidebar.tsx
'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { fetchNotifications, fetchSystemSettings } from '@/lib/api';
import { 
  Home, FileText, Users, Bell, Settings, 
  LogOut, Shield, Plus, Menu, X, ChevronRight, Activity,
  UserCircle, TrendingUp, GraduationCap, User, Lightbulb, ShieldCheck,
  Building2, Server, KeyRound, Landmark, PanelLeftClose, PanelLeftOpen, Wrench,
  Megaphone, Users as UsersIcon, Crown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Role } from '@/types';

function SidebarNavList({ 
  onNavigate,
  isCollapsed
}: { 
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
}) {
  const { user } = useAuth();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: any) => n.isRead === false).length 
    : 0;

  const role = (user?.role as Role) || 'STUDENT';
  
  // ✅ STRICT ROLE DEFINITIONS
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isSrcMember = role === 'SRC_MEMBER';
  const isSRC = isSuperAdmin || isSrcMember;
  const isPersonalUser = ['STUDENT', 'CLASS_REP'].includes(role);
  const isClassRep = role === 'CLASS_REP';
  
  const isUnitStaff = [
    'ICT_UNIT', 
    'SECURITY_UNIT', 
    'HOSTEL_MANAGEMENT_UNIT', 
    'SENATE_UNIT'
  ].includes(role);

  // ✅ NAVIGATION WITH STRICT ROLE-BASED VISIBILITY
  const navigation = [
    // Public / All Users
    { name: 'Dashboard', icon: Home, path: '/dashboard', show: true },
    { name: 'My Profile', icon: User, path: '/profile', show: true },
    { name: 'Announcements', icon: Megaphone, path: '/announcements', show: true },
    { name: 'Suggestion Box', icon: Lightbulb, path: '/suggestions', show: true },
    { name: 'Notifications', icon: Bell, path: '/notifications', show: true, badge: unreadCount },
    
    // Students & Class Reps
    { name: 'My Complaints', icon: UserCircle, path: '/complaints?filter=MINE', show: isPersonalUser },
    { name: 'Submit Issue', icon: Plus, path: '/complaints/create', show: isPersonalUser, highlight: true },
    { name: 'Class Portal', icon: GraduationCap, path: '/class-rep', show: isClassRep },
    
    // SRC Members & Super Admins
    { name: 'All Complaints', icon: FileText, path: '/complaints?filter=ALL', show: isSRC || isUnitStaff },
    { name: 'Verify Complaints', icon: ShieldCheck, path: '/moderation', show: isSRC },
    { name: 'Global Statistics', icon: TrendingUp, path: '/statistics', show: isSRC },
    { name: 'Executive Council', icon: Crown, path: '/excos', show: isSRC },
    
    // 🔒 SUPER ADMIN ONLY - Strictly restricted
    { name: 'Users Management', icon: Users, path: '/users', show: isSuperAdmin },
    { name: 'Audit Logs', icon: Activity, path: '/audit-logs', show: isSuperAdmin },
    { name: 'Settings', icon: Settings, path: '/settings', show: isSuperAdmin },
  ];

  const visibleNav = navigation.filter((item) => item.show);

  const isActive = (path: string) => {
    if (path.includes('/complaints?filter=')) {
      if (pathname === '/complaints') {
        const currentFilter = searchParams.get('filter');
        const pathFilter = path.split('filter=')[1];
        return currentFilter === pathFilter;
      }
      return false;
    }
    return pathname === path || (pathname.startsWith(path) && path !== '/dashboard');
  };

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200">
      {visibleNav.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        const badgeValue = item.badge ?? 0;

        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            title={isCollapsed ? item.name : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3.5'} py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-150 group relative active:scale-[0.98] ${
              active
                ? 'bg-gradient-to-r from-green-700 to-green-800 text-white shadow-md shadow-green-900/10'
                : item.highlight
                ? 'bg-green-50 text-green-800 hover:bg-green-100/80 border border-green-200/80'
                : 'text-gray-700 hover:bg-gray-100/80'
            }`}
          >
            <Icon 
              className={`w-5 h-5 flex-shrink-0 transition-colors ${
                active 
                  ? 'text-white' 
                  : item.highlight 
                    ? 'text-green-700' 
                    : 'text-gray-500 group-hover:text-gray-700'
              }`} 
            />
            
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate ml-3">{item.name}</span>

                {badgeValue > 0 && (
                  <span 
                    className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full ${
                      active 
                        ? 'bg-white text-green-800' 
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {badgeValue > 99 ? '99+' : badgeValue}
                  </span>
                )}

                {active && <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0 ml-1" />}
              </>
            )}

            {isCollapsed && badgeValue > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (user?.role as Role) || 'STUDENT';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdminUser = ['SUPER_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'].includes(userRole);

  const { data: settings } = useQuery({
    queryKey: ['system-settings-sidebar-badge'],
    queryFn: fetchSystemSettings,
    enabled: !!user && isAdminUser,
    refetchInterval: 15000,
    retry: false,
  });

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  if (!mounted || !user) {
    return null;
  }

  const handleNavigation = (path: string) => {
    setIsMobileOpen(false);
    startTransition(() => {
      router.push(path);
    });
  };

  const handleLogout = () => {
    setIsMobileOpen(false);
    logout();
  };

  const getRoleConfig = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'SUPER ADMIN', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: KeyRound };
      case 'SRC_MEMBER':
        return { label: 'SRC MEMBER', color: 'bg-green-100 text-green-800 border-green-200', icon: Shield };
      case 'ICT_UNIT':
        return { label: 'ICT UNIT', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Server };
      case 'SECURITY_UNIT':
        return { label: 'SECURITY UNIT', color: 'bg-red-100 text-red-800 border-red-200', icon: Shield };
      case 'HOSTEL_MANAGEMENT_UNIT':
        return { label: 'HOSTEL UNIT', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Building2 };
      case 'SENATE_UNIT':
        return { label: 'SENATE UNIT', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Landmark };
      case 'CLASS_REP':
        return { label: 'CLASS REP', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: GraduationCap };
      case 'STUDENT':
      default:
        return { label: 'STUDENT', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: User };
    }
  };

  const roleConfig = getRoleConfig(userRole);
  const RoleIcon = roleConfig.icon;

  // ✅ Settings only available to SUPER_ADMIN now (removed SRC_MEMBER)
  const isSettingsAllowed = isSuperAdmin;

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200/80 select-none transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-xl flex items-center justify-center shadow-md shadow-green-900/20 flex-shrink-0">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-gray-900 leading-tight truncate">SRC Portal</h1>
              <p className="text-xs text-gray-500 font-medium truncate">Sa'adu Zungur Univ.</p>
            </div>
          )}
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Mobile Close Icon inside Panel Header */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* User Card */}
      {/* Resolve avatar URL from uploads or absolute */}
      {(() => {
        const resolveUploadUrl = (url?: string | null) => {
          if (!url) return null;
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || null;
          let base = 'http://localhost:3001';
          if (apiBase) base = apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
          return `${base}${url.startsWith('/') ? url : `/${url}`}`;
        };

        const avatarSrc = resolveUploadUrl(user?.avatarUrl || null);

        return !collapsed ? (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-green-50/60 to-emerald-50/40 border border-green-100/80">
            <div className="flex items-center gap-3 mb-2.5">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleConfig.color}`}>
              <RoleIcon className="w-3 h-3" />
              {roleConfig.label}
            </div>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-b border-gray-100">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name || 'User avatar'}
                title={`${user?.name} (${roleConfig.label})`}
                className="w-10 h-10 rounded-full object-cover shadow-sm cursor-pointer"
              />
            ) : (
              <div 
                title={`${user?.name} (${roleConfig.label})`}
                className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer"
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        );
      })()}

      {/* Maintenance Indicator Badge for Admins */}
      {settings?.maintenanceMode && isAdminUser && !collapsed && (
        <div className="mx-3 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-medium">
          <Wrench className="w-4 h-4 text-amber-600 animate-pulse flex-shrink-0" />
          <span className="truncate">Maintenance Mode Active</span>
        </div>
      )}

      {/* Navigation */}
      <Suspense fallback={<div className="flex-1 p-4 text-xs text-gray-400">Loading menu...</div>}>
        <SidebarNavList onNavigate={handleNavigation} isCollapsed={collapsed} />
      </Suspense>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {/* ✅ Settings only for SUPER_ADMIN */}
        {isSettingsAllowed && (
          <button
            onClick={() => handleNavigation('/settings')}
            title={collapsed ? 'Settings' : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-colors`}
          >
            <Settings className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors`}
        >
          <LogOut className="w-5 h-5 text-red-500 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Menu Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open Navigation Menu"
        className="lg:hidden fixed bottom-5 right-5 z-[90] p-3.5 bg-green-700 text-white rounded-full shadow-2xl shadow-green-900/40 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95 transition-all flex items-center justify-center"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          aria-hidden="true"
          className="lg:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[98] transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-80 max-w-[85vw] h-full z-[99] transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden lg:flex flex-col ${isCollapsed ? 'w-20' : 'w-72'} h-screen sticky top-0 flex-shrink-0 z-30 transition-all duration-300 ease-in-out`}>
        <SidebarContent collapsed={isCollapsed} />
      </aside>
    </>
  );
}