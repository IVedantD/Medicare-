import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppointmentCard } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { format } from 'date-fns';

const tabs = ['All', 'Pending', 'Approved', 'Completed'];

const DoctorAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{ id: string; action: string; appointment: any } | null>(null);
  const updateStatus = useUpdateAppointmentStatus();
  
  const { data: appointments = [], isLoading, error } = useDoctorAppointments({
    status: activeTab !== 'All' ? activeTab.toLowerCase() : undefined,
    date: selectedDate || undefined,
  });

  const filteredAppointments = useMemo(() => {
    return appointments.map(apt => ({
      id: apt.id,
      patientName: apt.patientName || 'Patient',
      date: apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : '',
      time: apt.time,
      status: apt.status,
      reason: apt.reason,
    }));
  }, [appointments]);

  const handleAction = (id: string, action: string, appointment: any) => {
    setSelectedAction({ id, action, appointment });
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedAction) return;
    
    let status: 'approved' | 'rejected' | 'completed' | 'cancelled';
    if (selectedAction.action === 'approve') {
      status = 'approved';
    } else if (selectedAction.action === 'reject') {
      status = 'rejected';
    } else if (selectedAction.action === 'complete') {
      status = 'completed';
    } else {
      return;
    }

    try {
      await updateStatus.mutateAsync({ id: selectedAction.id, status });
      setActionDialogOpen(false);
      setSelectedAction(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'approve': return 'Approve Appointment';
      case 'reject': return 'Reject Appointment';
      case 'complete': return 'Mark as Completed';
      default: return 'Update Appointment';
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'approve': return 'Are you sure you want to approve this appointment? The patient will be notified.';
      case 'reject': return 'Are you sure you want to reject this appointment? The patient will be notified.';
      case 'complete': return 'Mark this appointment as completed? This will finalize the appointment.';
      default: return 'Are you sure you want to perform this action?';
    }
  };

  return (
    <DashboardLayout title="Appointments">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Manage Appointments
        </h2>
        <p className="text-muted-foreground mt-1">
          Review and manage patient appointment requests
        </p>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load appointments. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      {!isLoading && !error && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredAppointments.length} appointments
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <CardSkeleton count={3} />
        </div>
      )}

      {/* Appointments List */}
      {!isLoading && !error && (
        <>
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const canApprove = apt.status === 'pending';
              const canReject = apt.status === 'pending';
              const canComplete = apt.status === 'approved';
              
              return (
                <div key={apt.id} className="bg-card rounded-xl border p-6">
                  <AppointmentCard
                    id={apt.id}
                    patientName={apt.patientName}
                    date={apt.date}
                    time={apt.time}
                    status={apt.status}
                    reason={apt.reason}
                  />
                  
                  {/* Action Buttons */}
                  {(canApprove || canReject || canComplete) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {canApprove && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAction(apt.id, 'approve', apt)}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {canReject && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAction(apt.id, 'reject', apt)}
                          disabled={updateStatus.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      )}
                      {canComplete && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAction(apt.id, 'complete', apt)}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          )}
        </>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction ? getActionTitle(selectedAction.action) : 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction ? getActionDescription(selectedAction.action) : ''}
              {selectedAction && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Appointment Details:</p>
                  <p className="text-sm text-muted-foreground">
                    Patient: {selectedAction.appointment.patientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {selectedAction.appointment.date}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Time: {selectedAction.appointment.time}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              className={
                selectedAction?.action === 'reject' || selectedAction?.action === 'complete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {updateStatus.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
