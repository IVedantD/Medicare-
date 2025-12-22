import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppointmentCard } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, AlertCircle } from 'lucide-react';
import { useDoctorAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

const tabs = ['All', 'Pending', 'Approved', 'Completed'];

const DoctorAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
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

  const handleAction = async (id: string, action: string) => {
    const status = action === 'approve' ? 'approved' : 'rejected';
    await updateStatus.mutateAsync({ id, status });
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
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                id={apt.id}
                patientName={apt.patientName}
                date={apt.date}
                time={apt.time}
                status={apt.status}
                reason={apt.reason}
                showActions={apt.status === 'pending'}
                onAction={(action) => handleAction(apt.id, action)}
              />
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;
