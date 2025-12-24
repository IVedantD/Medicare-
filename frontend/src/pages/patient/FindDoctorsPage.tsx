import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DoctorCard } from '@/components/ui/Cards';
import { Button } from '@/components/ui/button';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { useDoctors } from '@/hooks/useDoctors';
import { DoctorCardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const specializations = [
  'All',
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Gynecology',
];

const FindDoctorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const navigate = useNavigate();

  const { data: doctors = [], isLoading, error } = useDoctors({
    specialization: selectedSpecialization !== 'All' ? selectedSpecialization : undefined,
    search: searchQuery || undefined,
  });

  // Note: Backend already filters by specialization and search
  // Frontend filtering is kept for additional client-side filtering if needed
  const filteredDoctors = useMemo(() => {
    if (!doctors.length) return [];
    
    // Additional client-side filtering (backend already does most filtering)
    return doctors.filter((doctor) => {
      const matchesSearch = !searchQuery || 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialization = selectedSpecialization === 'All' ||
        doctor.specialization === selectedSpecialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchQuery, selectedSpecialization]);

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  return (
    <DashboardLayout title="Find Doctors">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Find Your Doctor
        </h2>
        <p className="text-muted-foreground mt-1">
          Search and book appointments with our expert medical professionals
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialization..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load doctors. {error.message || 'Please try again later.'}
            <br />
            <span className="text-xs mt-1 block">
              Make sure the backend server is running and doctors are registered.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DoctorCardSkeleton count={6} />
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredDoctors.length} doctors
          </p>

          {/* Doctors Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                id={doctor.id}
                name={doctor.name}
                specialization={doctor.specialization}
                department={doctor.department}
                rating={doctor.rating}
                experience={doctor.experience}
                available={doctor.available}
                onBook={() => handleBookAppointment(doctor.id)}
              />
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border p-8">
              <p className="text-muted-foreground mb-2">
                {doctors.length === 0 
                  ? 'No doctors available at the moment'
                  : 'No doctors found matching your criteria'}
              </p>
              {doctors.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Please contact an administrator to add doctors to the system.
                </p>
              )}
              {(searchQuery || selectedSpecialization !== 'All') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialization('All');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default FindDoctorsPage;
