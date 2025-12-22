import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Cards';
import { Users, UserCheck, Calendar, Activity, TrendingUp } from 'lucide-react';
import { useDashboardStats, useAllUsers } from '@/hooks/useAdmin';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();

  const doctors = users.filter(u => u.role === 'doctor');
  const patients = users.filter(u => u.role === 'patient');
  const pendingDoctors = doctors.filter(d => !d.verified);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground mt-1">
          Overview of clinic operations and analytics
        </p>
      </div>

      {/* Error State */}
      {statsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard statistics. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      {statsLoading || usersLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCardSkeleton count={4} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Patients" 
            value={stats?.totalPatients ?? patients.length} 
            icon={Users} 
            variant="primary" 
            trend={stats?.totalPatients ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard 
            title="Total Doctors" 
            value={stats?.totalDoctors ?? doctors.length} 
            icon={UserCheck} 
            variant="accent" 
            subtitle={`${pendingDoctors.length} pending approval`}
          />
          <StatCard 
            title="Appointments Today" 
            value={stats?.appointmentsToday ?? 0} 
            icon={Calendar} 
            variant="success" 
          />
          <StatCard 
            title="Revenue (Month)" 
            value={stats?.revenue ?? '$0'} 
            icon={TrendingUp} 
            variant="warning" 
            trend={stats?.revenue ? { value: 8, isPositive: true } : undefined}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { text: 'New patient registration: John Doe', time: '5 min ago', type: 'patient' },
              { text: 'Dr. Wilson approved 3 appointments', time: '15 min ago', type: 'doctor' },
              { text: 'New doctor application: Dr. Adams', time: '1 hour ago', type: 'pending' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {['Dr. James Adams - Cardiology', 'Dr. Maria Garcia - Pediatrics'].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                <span className="text-sm font-medium">{doc}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-medium rounded bg-success text-success-foreground">Approve</button>
                  <button className="px-3 py-1 text-xs font-medium rounded bg-destructive text-destructive-foreground">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
