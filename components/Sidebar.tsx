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

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: any) => n.isRead === false).length 
    : 0;

  const isAdmin = user?.role === 'ADMIN';
  const isSRC = ['ADMIN', 'SRC_MEMBER', 'SRC_EXECUTIVE'].includes(user?.role || '');
  const isPersonalUser = ['STUDENT', 'CLASS_REP'].includes(user?.role || '');
  const isClassRep = user?.role === 'CLASS_REP';

  const navigation = [
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
      case 'STUDENT': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const SidebarContent = () => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
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
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
        </button>
      </div>
    </div>
  );

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

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