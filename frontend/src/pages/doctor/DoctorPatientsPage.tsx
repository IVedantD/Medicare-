import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Search, FileText, Calendar, AlertCircle } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { DoctorCardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DoctorPatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients = [], isLoading, error } = usePatients({
    search: searchQuery || undefined,
  });

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  return (
    <DashboardLayout title="My Patients">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          My Patients
        </h2>
        <p className="text-muted-foreground mt-1">
          View and manage your patient records
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients by name or email..."
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load patients. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DoctorCardSkeleton count={6} />
        </div>
      )}

      {/* Patients Grid */}
      {!isLoading && !error && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-card rounded-xl border p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {patient.email}
                    </p>
                    {patient.phone && (
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    Records
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No patients found</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatientsPage;
