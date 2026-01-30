'use client';

import { useAuth } from '@/providers/auth';
import { useRouter, usePathname } from 'next/navigation';
import { fetchNotifications } from '@/lib/api';
import { 
  Home, FileText, Users, Bell, Settings, 
  LogOut, Shield, Plus, Menu, X, ChevronRight, Activity,
  UserCircle, TrendingUp, GraduationCap, User, Lightbulb, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  // 2. Fetch real notification data
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user, // Only fetch if user is logged in
    refetchInterval: 30000, // Optional: refresh every 30 seconds
  });

  //3. Count unread notifications
  // Adjust 'isRead' to 'read' based on your backend field name
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const isAdmin = user.role === 'ADMIN';
  const isSRC = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user.role);
  const isPersonalUser = ['STUDENT', 'CLASS_REP'].includes(user.role);
  const isClassRep = user.role === 'CLASS_REP';

  const navigation = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      show: true,
    },
 
   // Inside your navigation array:
{
  name: 'All Complaints',
  icon: FileText,
  path: '/complaints',
  show: isSRC, 
},

    {
      name: 'All Complaints',
      icon: FileText,
      path: '/complaints?filter=ALL',
      show: isSRC,
    },
 
    {
      name: 'My Submissions',
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

      badge: unreadCount, // This should come from real notification count
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
    router.push('/');
  };

  const isActive = (path: string) => {
    // Special handling for complaints with filters
    if (path.includes('/complaints?filter=')) {
      if (pathname === '/complaints') {
        const currentFilter = new URLSearchParams(window.location.search).get('filter');
        const pathFilter = path.split('filter=')[1];
        return currentFilter === pathFilter;
      }
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SRC_EXECUTIVE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SRC_MEMBER': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLASS_REP': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'STUDENT': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SRC Portal</h1>
            <p className="text-xs text-gray-600">Sa'adu Zungur University</p>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
          <Shield className="w-3 h-3" />
          {user.role.replace('_', ' ')}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30'
                  : item.highlight
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : item.highlight ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className={`flex-1 font-medium ${active ? 'text-white' : ''}`}>
                {item.name}
              </span>
              {active && <ChevronRight className="w-4 h-4 text-white" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
        >
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 z-30">
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