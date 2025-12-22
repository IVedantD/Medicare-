import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppointmentCard } from '@/components/ui/Cards';
import { cn } from '@/lib/utils';
import { useMyAppointments } from '@/hooks/useAppointments';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

const PatientAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const { data: appointments = [], isLoading, error } = useMyAppointments();

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
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                id={apt.id}
                doctorName={apt.doctorName}
                date={apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : ''}
                time={apt.time}
                status={apt.status}
                reason={apt.reason}
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

export default PatientAppointmentsPage;
