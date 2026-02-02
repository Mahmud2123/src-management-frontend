'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/providers/ThemeProvider';
import { fetchNotifications } from '@/lib/api';
import { 
  Home, FileText, Users, Bell, Settings, 
  LogOut, Shield, Plus, Menu, X, ChevronRight, Activity,
  UserCircle, TrendingUp, GraduationCap, User, Lightbulb, ShieldCheck,
  Moon, Sun
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Debug: Log to see if component renders
  console.log('Sidebar rendering, user:', user);

  // Fetch real notification data
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 30000,
  });


  useEffect(() => {
    setMounted(true); // Add this
  }, []);

  if (!mounted || !user) { // Change this
    return null;
  }
  // Count unread notifications
  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: any) => n.isRead === false).length 
    : 0;

  const isAdmin = user?.role === 'ADMIN';
  const isSRC = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user?.role || '');
  const isPersonalUser = ['STUDENT', 'CLASS_REP'].includes(user?.role || '');
  const isClassRep = user?.role === 'CLASS_REP';

  const navigation = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      show: true,
    },
    {
      name: 'All Complaints',
      icon: FileText,
      path: '/complaints?filter=ALL',
      show: isSRC,
    },
    {
      name: 'My Complaints',
      icon: UserCircle,
      path: '/complaints?filter=MINE',
      show: isPersonalUser,
    },
    {
      name: 'Submit Issue',
      icon: Plus,
      path: '/complaints/create',
      show: isPersonalUser,
      highlight: true,
    },
    {
      name: 'Suggestion Box',
      icon: Lightbulb,
      path: '/suggestions',
      show: true,
    },
    {
      name: 'Verify Complaints',
      icon: ShieldCheck,
      path: '/moderation',
      show: isSRC,
    },
    {
      name: 'Class Portal',
      icon: GraduationCap,
      path: '/class-rep',
      show: isClassRep,
    },
    {
      name: 'Notifications',
      icon: Bell,
      path: '/notifications',
      show: true,
      badge: unreadCount,
    },
    {
      name: 'Global Statistics',
      icon: TrendingUp,
      path: '/statistics',
      show: isSRC,
    },
    {
      name: 'Users Management',
      icon: Users,
      path: '/users',
      show: isAdmin,
    },
    {
      name: 'Audit Logs',
      icon: Activity,
      path: '/audit-logs',
      show: isAdmin,
    },
    {
      name: 'My Profile',
      icon: User,
      path: '/profile',
      show: true,
    },
  ];

  const visibleNav = navigation.filter(item => item.show);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path.includes('/complaints?filter=')) {
      if (pathname === '/complaints') {
        const currentFilter = new URLSearchParams(window.location.search).get('filter');
        const pathFilter = path.split('filter=')[1];
        return currentFilter === pathFilter;
      }
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'SRC_EXECUTIVE': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SRC_MEMBER': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'CLASS_REP': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'STUDENT': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">SRC Portal</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Sa'adu Zungur University</p>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email || 'email@example.com'}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user?.role || 'STUDENT')}`}>
          <Shield className="w-3 h-3" />
          {user?.role?.replace('_', ' ') || 'STUDENT'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const badgeValue = item.badge ?? 0;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative ${
                active
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30'
                  : item.highlight
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-green-200 dark:border-green-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon 
                className={`w-5 h-5 ${
                  active ? 'text-white' : item.highlight ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`} 
              />
              
              <span className={`flex-1 font-medium ${active ? 'text-white' : ''}`}>
                {item.name}
              </span>

              {/* Badge */}
              {badgeValue > 0 && (
                <span 
                  className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full border-2 transition-colors duration-200 ${
                    active 
                      ? 'bg-white text-green-700 border-green-600' 
                      : 'bg-red-500 text-white border-white dark:border-gray-900'
                  }`}
                >
                  {badgeValue > 9 ? '9+' : badgeValue}
                </span>
              )}

              {active && <ChevronRight className="w-4 h-4 text-white" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" strokeWidth={2.5} />
              <span className="font-medium">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-yellow-500" strokeWidth={2.5} />
              <span className="font-medium">Light Mode</span>
            </>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <span className="font-medium">Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  // Don't render anything if no user
  if (!user) {
    console.log('Sidebar: No user, returning null');
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-white" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-72 h-full">
  <SidebarContent />
</aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-72 h-screen z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}