import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Cards';
import { Users, UserCheck, Calendar, Activity, TrendingUp } from 'lucide-react';
import { useDashboardStats, useAllUsers, useApproveDoctor, useRejectDoctor } from '@/hooks/useAdmin';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const approveDoctor = useApproveDoctor();
  const rejectDoctor = useRejectDoctor();

  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject'; name: string } | null>(null);

  // Use dashboard API data if available
  const dashboardStats = dashboardData?.stats || stats;
  const pendingDoctorApprovals = dashboardData?.pendingDoctorApprovals || [];
  
  const doctors = users.filter(u => u.role === 'doctor');
  const patients = users.filter(u => u.role === 'patient');
  const pendingDoctors = (pendingDoctorApprovals.length > 0 
    ? pendingDoctorApprovals 
    : doctors.filter(d => !d.verified && d.isActive)).filter(doc => doc && (doc.id || doc._id || doc.email));

  const handleAction = async () => {
    if (!confirmAction) return;
    
    try {
      if (confirmAction.action === 'approve') {
        await approveDoctor.mutateAsync(confirmAction.id);
      } else if (confirmAction.action === 'reject') {
        await rejectDoctor.mutateAsync(confirmAction.id);
      }
      setConfirmAction(null);
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

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
      {(dashboardLoading || statsLoading || usersLoading) ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCardSkeleton count={4} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Patients" 
            value={dashboardStats?.totalPatients ?? patients.length} 
            icon={Users} 
            variant="primary" 
            trend={dashboardStats?.totalPatients ? { value: 12, isPositive: true } : undefined}
          />
          <StatCard 
            title="Total Doctors" 
            value={dashboardStats?.totalDoctors ?? doctors.length} 
            icon={UserCheck} 
            variant="accent" 
            subtitle={`${pendingDoctors.length} pending approval`}
          />
          <StatCard 
            title="Appointments Today" 
            value={dashboardStats?.appointmentsToday ?? 0} 
            icon={Calendar} 
            variant="success" 
          />
          <StatCard 
            title="Revenue (Month)" 
            value={dashboardStats?.revenue ?? '$0'} 
            icon={TrendingUp} 
            variant="warning" 
            trend={dashboardStats?.revenue ? { value: 8, isPositive: true } : undefined}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Pending Approvals
              {pendingDoctors.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">
                  {pendingDoctors.length} new
                </span>
              )}
            </h3>
            {pendingDoctors.length > 0 && (
              <button
                onClick={() => navigate('/admin/doctors?status=pending')}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                View all <span className="text-xs">→</span>
              </button>
            )}
          </div>
          <div className="space-y-3">
            {pendingDoctors.length > 0 ? (
              pendingDoctors.slice(0, 5).filter((doc: any) => doc && (doc.id || doc._id || doc.email)).map((doc: any) => (
                <div key={doc.id || doc._id || doc.email} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{doc.name || doc.email || 'Unknown'}</span>
                    {doc.specialization && (
                      <p className="text-xs text-muted-foreground mt-1">{doc.specialization}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-success text-success-foreground hover:bg-success/90"
                      onClick={() => setConfirmAction({ id: doc.id || doc._id || '', action: 'approve', name: doc.name || doc.email || 'Doctor' })}
                      disabled={approveDoctor.isPending || rejectDoctor.isPending}
                    >
                      {approveDoctor.isPending && confirmAction?.id === (doc.id || doc._id) && confirmAction?.action === 'approve' ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : null}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmAction({ id: doc.id || doc._id || '', action: 'reject', name: doc.name || doc.email || 'Doctor' })}
                      disabled={approveDoctor.isPending || rejectDoctor.isPending}
                    >
                      {rejectDoctor.isPending && confirmAction?.id === (doc.id || doc._id) && confirmAction?.action === 'reject' ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : null}
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending doctor approvals
              </p>
            )}
          </div>

          {/* Confirmation Dialog */}
          <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirmAction?.action === 'approve' ? 'Approve Doctor' : 'Reject Doctor'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmAction?.action === 'approve' 
                    ? `Are you sure you want to approve ${confirmAction?.name || 'this doctor'}? This will allow them to manage appointments and be visible to patients.`
                    : `Are you sure you want to reject ${confirmAction?.name || 'this doctor'}? This will mark their account as inactive and they will not be able to log in.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAction}
                  disabled={approveDoctor.isPending || rejectDoctor.isPending}
                  className={confirmAction?.action === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                >
                  {(approveDoctor.isPending || rejectDoctor.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm {confirmAction?.action === 'approve' ? 'Approve' : 'Reject'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
