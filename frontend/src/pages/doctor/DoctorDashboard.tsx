import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { StatCard, AppointmentCard } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useDoctorAppointments } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { StatCardSkeleton, CardSkeleton } from '@/components/LoadingSkeleton';
import { format, isToday, parseISO } from 'date-fns';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: appointments = [], isLoading: appointmentsLoading } = useDoctorAppointments();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  const todayAppointments = useMemo(() => {
    const today = appointments.filter(apt => {
      if (!apt.date) return false;
      try {
        return isToday(parseISO(apt.date));
      } catch {
        return false;
      }
    });
    
    return today.slice(0, 3).map(apt => ({
      id: apt.id,
      patientName: apt.patientName || 'Patient',
      date: 'Today',
      time: apt.time,
      status: apt.status as 'pending' | 'approved' | 'completed',
      reason: apt.reason,
    }));
  }, [appointments]);

  const pendingRequests = useMemo(() => {
    return appointments
      .filter(apt => apt.status === 'pending')
      .slice(0, 2)
      .map(apt => ({
        id: apt.id,
        patientName: apt.patientName || 'Patient',
        date: apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : '',
        time: apt.time,
        status: apt.status as 'pending',
        reason: apt.reason,
      }));
  }, [appointments]);

  const stats = useMemo(() => {
    const today = appointments.filter(apt => {
      if (!apt.date) return false;
      try {
        return isToday(parseISO(apt.date));
      } catch {
        return false;
      }
    });
    
    return {
      todayCount: today.length,
      pendingCount: today.filter(apt => apt.status === 'pending').length,
      totalPatients: patients.length,
      newPatients: 0, // This would come from API
      pendingRequests: appointments.filter(apt => apt.status === 'pending').length,
      completedToday: today.filter(apt => apt.status === 'completed').length,
      remainingToday: today.filter(apt => ['pending', 'approved'].includes(apt.status)).length,
    };
  }, [appointments, patients]);

  const handleAppointmentAction = (id: string, action: string) => {
    console.log(`${action} appointment ${id}`);
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Good morning, {user?.name}! 👨‍⚕️
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's your schedule for today
        </p>
      </div>

      {/* Stats Grid */}
      {appointmentsLoading || patientsLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCardSkeleton count={4} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Today's Appointments"
            value={stats.todayCount}
            subtitle={`${stats.pendingCount} pending approval`}
            icon={Calendar}
            variant="primary"
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            subtitle={`${stats.newPatients} new this month`}
            icon={Users}
            variant="accent"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            subtitle="Action required"
            icon={AlertCircle}
            variant="warning"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            subtitle={`${stats.remainingToday} remaining`}
            icon={CheckCircle}
            variant="success"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Today's Schedule
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/appointments" className="gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {appointmentsLoading ? (
              <CardSkeleton count={3} />
            ) : todayAppointments.length > 0 ? (
              todayAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  patientName={apt.patientName}
                  date={apt.date}
                  time={apt.time}
                  status={apt.status}
                  reason={apt.reason}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No appointments scheduled for today
              </p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Pending Requests
            </h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">
              {pendingRequests.length} new
            </span>
          </div>

          <div className="space-y-3">
            {appointmentsLoading ? (
              <CardSkeleton count={2} />
            ) : pendingRequests.length > 0 ? (
              pendingRequests.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  patientName={apt.patientName}
                  date={apt.date}
                  time={apt.time}
                  status={apt.status}
                  reason={apt.reason}
                  showActions
                  onAction={(action) => handleAppointmentAction(apt.id, action)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending requests
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-card rounded-xl border p-6">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'View Appointments', href: '/doctor/appointments', icon: Calendar },
            { label: 'My Patients', href: '/doctor/patients', icon: Users },
            { label: 'Set Availability', href: '/doctor/availability', icon: Clock },
            { label: 'Update Profile', href: '/doctor/profile', icon: CheckCircle },
          ].map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
