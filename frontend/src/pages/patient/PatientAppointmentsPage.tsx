import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppointmentCard } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMyAppointments, useCancelAppointment, useRescheduleAppointment } from '@/hooks/useAppointments';
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
import { AlertCircle, X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

const PatientAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{ id: string; date: string; time: string } | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  
  const { data: appointments = [], isLoading, error } = useMyAppointments();
  const cancelAppointment = useCancelAppointment();
  const rescheduleAppointment = useRescheduleAppointment();

  const filteredAppointments = useMemo(() => {
    if (!appointments.length) return [];
    
    return appointments.filter((apt) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Upcoming') return ['pending', 'approved'].includes(apt.status);
      if (activeTab === 'Completed') return apt.status === 'completed';
      if (activeTab === 'Cancelled') return apt.status === 'cancelled';
      return true;
    });
  }, [appointments, activeTab]);

  const handleCancelClick = (apt: any) => {
    if (apt.status === 'completed') {
      return; // Cannot cancel completed appointments
    }
    setSelectedAppointment({ id: apt.id, date: apt.date, time: apt.time });
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;
    try {
      await cancelAppointment.mutateAsync(selectedAppointment.id);
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRescheduleClick = (apt: any) => {
    if (apt.status === 'completed' || apt.status === 'cancelled') {
      return; // Cannot reschedule completed or cancelled appointments
    }
    setSelectedAppointment({ id: apt.id, date: apt.date, time: apt.time });
    setNewDate(format(new Date(apt.date), 'yyyy-MM-dd'));
    setNewTime(apt.time);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedAppointment || !newDate || !newTime) {
      return;
    }
    try {
      await rescheduleAppointment.mutateAsync({
        id: selectedAppointment.id,
        date: newDate,
        time: newTime,
      });
      setRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      setNewDate('');
      setNewTime('');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          My Appointments
        </h2>
        <p className="text-muted-foreground mt-1">
          View and manage your appointment history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load appointments. Please try again later.
          </AlertDescription>
        </Alert>
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
              const canCancel = ['pending', 'approved'].includes(apt.status);
              const canReschedule = ['pending', 'approved'].includes(apt.status);
              
              return (
                <div key={apt.id} className="bg-card rounded-xl border p-6">
                  <AppointmentCard
                    id={apt.id}
                    doctorName={apt.doctorName}
                    date={apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : ''}
                    time={apt.time}
                    status={apt.status}
                    reason={apt.reason}
                  />
                  
                  {/* Action Buttons */}
                  {canCancel || canReschedule ? (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {canReschedule && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleClick(apt)}
                          disabled={rescheduleAppointment.isPending}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(apt)}
                          disabled={cancelAppointment.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  ) : null}
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              {selectedAppointment && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Appointment Details:</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {selectedAppointment.date ? format(new Date(selectedAppointment.date), 'MMM dd, yyyy') : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Time: {selectedAppointment.time}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelAppointment.isPending ? 'Cancelling...' : 'Cancel Appointment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <AlertDialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new date and time for your appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Time
              </label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select time</option>
                {[
                  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
                  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
                  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
                ].map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Original</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRescheduleConfirm}
              disabled={!newDate || !newTime || rescheduleAppointment.isPending}
            >
              {rescheduleAppointment.isPending ? 'Rescheduling...' : 'Confirm Reschedule'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PatientAppointmentsPage;
