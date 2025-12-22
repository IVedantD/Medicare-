import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Clock, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultTimeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const initialAvailability: Record<string, string[]> = {
  Monday: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM', '03:00 PM'],
  Tuesday: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
  Wednesday: ['09:00 AM', '09:30 AM', '10:00 AM', '02:00 PM', '02:30 PM'],
  Thursday: ['10:00 AM', '10:30 AM', '11:00 AM', '03:00 PM', '03:30 PM', '04:00 PM'],
  Friday: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'],
  Saturday: [],
  Sunday: [],
};

const DoctorAvailabilityPage: React.FC = () => {
  const [availability, setAvailability] = useState(initialAvailability);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isLoading, setIsLoading] = useState(false);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter((s) => s !== slot) };
      } else {
        return { ...prev, [day]: [...daySlots, slot].sort() };
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Availability updated successfully!');
    setIsLoading(false);
  };

  const clearDay = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: [] }));
  };

  const selectAll = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: [...defaultTimeSlots] }));
  };

  return (
    <DashboardLayout title="Availability">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Set Your Availability
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your weekly schedule for patient appointments
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Day Selection */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Select Day</h3>
          <div className="space-y-1">
            {weekDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  selectedDay === day
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span>{day}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  selectedDay === day
                    ? "bg-primary-foreground/20"
                    : "bg-muted text-muted-foreground"
                )}>
                  {availability[day].length} slots
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="lg:col-span-3 bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                {selectedDay}'s Schedule
              </h3>
              <p className="text-sm text-muted-foreground">
                Select available time slots for appointments
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => clearDay(selectedDay)}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={() => selectAll(selectedDay)}>
                <Plus className="h-4 w-4 mr-1" />
                Select All
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Morning Slots
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {defaultTimeSlots.slice(0, 6).map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleSlot(selectedDay, slot)}
                  className={cn(
                    "py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
                    availability[selectedDay].includes(slot)
                      ? "bg-success text-success-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Afternoon Slots
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {defaultTimeSlots.slice(6).map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleSlot(selectedDay, slot)}
                  className={cn(
                    "py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
                    availability[selectedDay].includes(slot)
                      ? "bg-success text-success-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="hero"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="mt-8 bg-card rounded-xl border p-6">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Weekly Overview
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {day.slice(0, 3)}
              </p>
              <div className={cn(
                "h-16 rounded-lg flex items-center justify-center",
                availability[day].length > 0 ? "bg-success/10" : "bg-muted"
              )}>
                <span className={cn(
                  "text-lg font-bold",
                  availability[day].length > 0 ? "text-success" : "text-muted-foreground"
                )}>
                  {availability[day].length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAvailabilityPage;
