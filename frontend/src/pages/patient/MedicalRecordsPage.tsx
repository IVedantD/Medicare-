import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, Download, Eye, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyMedicalRecords } from '@/hooks/useMedicalRecords';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

const MedicalRecordsPage: React.FC = () => {
  const { data: records = [], isLoading, error } = useMyMedicalRecords();

  return (
    <DashboardLayout title="Medical Records">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Medical Records
        </h2>
        <p className="text-muted-foreground mt-1">
          Access your complete medical history and prescriptions
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load medical records. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <CardSkeleton count={4} />
        </div>
      )}

      {/* Records List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((record) => (
          <div
            key={record.id}
            className="bg-card rounded-xl border p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Medical Record
                  </h3>
                  {record.doctorName && (
                    <p className="text-sm text-muted-foreground">
                      {record.doctorName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Diagnosis</p>
                <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
              </div>
              {record.prescription && record.prescription.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground">Prescription</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {record.prescription.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {record.notes && (
                <div>
                  <p className="text-sm font-medium text-foreground">Notes</p>
                  <p className="text-sm text-muted-foreground">{record.notes}</p>
                </div>
              )}
            </div>
          </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No medical records found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MedicalRecordsPage;
