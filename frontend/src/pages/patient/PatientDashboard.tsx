import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { StatCard, AppointmentCard, DoctorCard } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  FileText,
  Heart,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useMyAppointments } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { useMyMedicalRecords } from '@/hooks/useMedicalRecords';
import { usePatientDashboard } from '@/hooks/useDashboard';
import { StatCardSkeleton, CardSkeleton, DoctorCardSkeleton } from '@/components/LoadingSkeleton';
import { format } from 'date-fns';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = usePatientDashboard();
  const { data: appointments = [], isLoading: appointmentsLoading } = useMyAppointments({ status: 'pending' });
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
  const { data: records = [], isLoading: recordsLoading } = useMyMedicalRecords();

  // Use dashboard API data if available, otherwise fallback to existing hooks
  const upcomingAppointments = useMemo(() => {
    if (dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0) {
      return dashboardData.upcomingAppointments.slice(0, 2).map(apt => ({
        id: apt.id,
        doctorName: apt.doctorName || 'Doctor',
        date: apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : '',
        time: apt.time,
        status: apt.status as 'pending' | 'approved',
        reason: apt.reason,
      }));
    }
    return appointments
      .filter(apt => ['pending', 'approved'].includes(apt.status))
      .slice(0, 2)
      .map(apt => ({
        id: apt.id,
        doctorName: apt.doctorName || 'Doctor',
        date: apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : '',
        time: apt.time,
        status: apt.status as 'pending' | 'approved',
        reason: apt.reason,
      }));
  }, [dashboardData, appointments]);

  const recommendedDoctors = useMemo(() => {
    return doctors.slice(0, 2).map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      rating: doctor.rating,
      experience: doctor.experience,
      available: doctor.available,
    }));
  }, [doctors]);

  const stats = useMemo(() => {
    // Use dashboard API stats if available
    if (dashboardData?.stats) {
      const nextDate = dashboardData.stats.nextAppointment 
        ? format(new Date(dashboardData.stats.nextAppointment.date), 'MMM dd')
        : 'None';
      return {
        upcoming: dashboardData.stats.totalUpcoming,
        nextDate,
        records: dashboardData.stats.totalRecords,
        lastRecordDate: records[0] ? format(new Date(records[0].createdAt), 'MMM dd') : 'None',
        prescriptions: records.filter(r => r.prescription && r.prescription.length > 0).length,
        totalVisits: dashboardData.stats.totalCompleted,
      };
    }
    // Fallback to existing logic
    const upcomingCount = appointments.filter(apt => ['pending', 'approved'].includes(apt.status)).length;
    const nextAppointment = appointments
      .filter(apt => ['pending', 'approved'].includes(apt.status))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    return {
      upcoming: upcomingCount,
      nextDate: nextAppointment ? format(new Date(nextAppointment.date), 'MMM dd') : 'None',
      records: records.length,
      lastRecordDate: records[0] ? format(new Date(records[0].createdAt), 'MMM dd') : 'None',
      prescriptions: records.filter(r => r.prescription && r.prescription.length > 0).length,
      totalVisits: appointments.filter(apt => apt.status === 'completed').length,
    };
  }, [dashboardData, appointments, records]);

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your health journey
        </p>
      </div>

      {/* Stats Grid */}
      {dashboardLoading || appointmentsLoading || recordsLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCardSkeleton count={4} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Upcoming Appointments"
            value={stats.upcoming}
            subtitle={`Next: ${stats.nextDate}`}
            icon={Calendar}
            variant="primary"
          />
          <StatCard
            title="Medical Records"
            value={stats.records}
            subtitle={`Last updated: ${stats.lastRecordDate}`}
            icon={FileText}
            variant="accent"
          />
          <StatCard
            title="Prescriptions"
            value={stats.prescriptions}
            subtitle="Active medications"
            icon={Heart}
            variant="success"
          />
          <StatCard
            title="Total Visits"
            value={stats.totalVisits}
            subtitle="Completed appointments"
            icon={Activity}
            variant="default"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-foreground">
              Upcoming Appointments
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/appointments" className="gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-3">
            {appointmentsLoading ? (
              <CardSkeleton count={2} />
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  doctorName={apt.doctorName}
                  date={apt.date}
                  time={apt.time}
                  status={apt.status}
                  reason={apt.reason}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming appointments
              </p>
            )}
          </div>

          <Button variant="hero" className="w-full" asChild>
            <Link to="/patient/doctors">
              <Calendar className="h-4 w-4 mr-2" />
              Book New Appointment
            </Link>
          </Button>
        </div>

        {/* Quick Actions & Health Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Find a Doctor', href: '/patient/doctors', icon: Heart },
                { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
                { label: 'Medical Records', href: '/patient/records', icon: FileText },
                { label: 'Update Profile', href: '/patient/profile', icon: Clock },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Health Tip */}
          <div className="bg-gradient-hero rounded-xl p-6 text-primary-foreground">
            <h3 className="text-lg font-display font-semibold mb-2">
              💡 Health Tip
            </h3>
            <p className="text-sm text-primary-foreground/80">
              Remember to stay hydrated! Drinking 8 glasses of water daily helps 
              maintain energy levels and supports overall health.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Doctors */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-foreground">
            Recommended Doctors
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/patient/doctors" className="gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {doctorsLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <DoctorCardSkeleton count={2} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                id={doctor.id}
                name={doctor.name}
                specialization={doctor.specialization}
                department={doctor.department}
                rating={doctor.rating}
                experience={doctor.experience}
                available={doctor.available}
                onBook={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
