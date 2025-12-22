import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft, Star, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDoctor, useDoctorAvailability } from '@/hooks/useDoctors';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { Loader } from '@/components/ui/Loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

// Generate next 7 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const BookAppointmentPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: doctor, isLoading: doctorLoading, error: doctorError } = useDoctor(doctorId);
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: availability } = useDoctorAvailability(doctorId, selectedDateStr);
  const createAppointment = useCreateAppointment();

  const dates = generateDates();
  
  // Get available time slots from API or use default
  const availableTimeSlots = availability?.slots || timeSlots;

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !doctorId) {
      toast.error('Please select a date and time');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for your visit');
      return;
    }

    try {
      await createAppointment.mutateAsync({
        doctorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        reason: reason.trim(),
      });
      navigate('/patient/appointments');
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (doctorLoading) {
    return (
      <DashboardLayout title="Book Appointment">
        <div className="flex items-center justify-center py-12">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (doctorError || !doctor) {
    return (
      <DashboardLayout title="Book Appointment">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {doctorError ? 'Failed to load doctor information' : 'Doctor not found'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/patient/doctors')} className="mt-4">
          Back to Doctors
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Book Appointment">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/patient/doctors')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Doctors
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Doctor Info */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-display font-bold text-xl">
              {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {doctor.name}
              </h3>
              <p className="text-sm text-primary">{doctor.specialization}</p>
              {doctor.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
              )}
            </div>
          </div>
          {doctor.bio && (
            <p className="text-sm text-muted-foreground mb-4">
              {doctor.bio}
            </p>
          )}
          <div className="space-y-2 text-sm">
            {doctor.department && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="text-foreground">{doctor.department}</span>
              </div>
            )}
            {doctor.experience && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span className="text-foreground">{doctor.experience}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Selection */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Select Date
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "p-3 rounded-xl text-center transition-all",
                    selectedDate?.toDateString() === date.toDateString()
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <p className="text-xs font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-bold">{date.getDate()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Select Time
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">
                  No available slots for this date. Please select another date.
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Reason for Visit
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Please describe your symptoms or reason for the appointment..."
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Summary & Book Button */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Appointment Summary
            </h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="text-foreground font-medium">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground font-medium">
                  {selectedDate ? formatDate(selectedDate) : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground font-medium">
                  {selectedTime || 'Not selected'}
                </span>
              </div>
            </div>
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleBook}
              disabled={createAppointment.isPending || !selectedDate || !selectedTime}
            >
              {createAppointment.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Booking...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Confirm Appointment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointmentPage;
