import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';
import {
  Heart,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Stethoscope,
  ClipboardList,
  Clock,
  UserCheck,
  BarChart3,
  UserPlus,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const patientNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Find Doctors', href: '/patient/doctors', icon: Stethoscope },
  { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
  { label: 'Medical Records', href: '/patient/records', icon: FileText },
  { label: 'Profile', href: '/patient/profile', icon: Settings },
];

const doctorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { label: 'My Patients', href: '/doctor/patients', icon: Users },
  { label: 'Availability', href: '/doctor/availability', icon: Clock },
  { label: 'Profile', href: '/doctor/profile', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Doctors', href: '/admin/doctors', icon: UserCheck },
  { label: 'Appointments', href: '/admin/appointments', icon: ClipboardList },
  { label: 'Activity Log', href: '/admin/activity', icon: History },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = user.role === 'patient' 
    ? patientNavItems 
    : user.role === 'doctor' 
    ? doctorNavItems 
    : adminNavItems;

  const dashboardPath = getDashboardPath(user.role);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <Link 
        to={dashboardPath}
        className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-display font-bold text-sidebar-foreground">
          MediCare
        </span>
      </Link>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary font-semibold">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || user?.email || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user?.role || 'user'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};
