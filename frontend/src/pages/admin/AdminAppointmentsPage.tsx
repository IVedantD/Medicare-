import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Filter, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminAppointments } from '@/hooks/useAdmin';
import { useDoctors } from '@/hooks/useDoctors';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AdminAppointmentsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAdminAppointments({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    doctorId: doctorFilter !== 'all' ? doctorFilter : undefined,
    date: dateFilter || undefined,
    search: searchQuery || undefined,
    page,
    limit: 20
  });

  const appointments = data?.appointments || data || [];
  const pagination = data?.pagination;

  const { data: doctors = [] } = useDoctors();

  // Search is now handled by backend, but we can do client-side filtering if needed
  const filteredAppointments = useMemo(() => {
    return appointments;
  }, [appointments]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-info/10 text-info border-info/20',
      completed: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-muted text-muted-foreground border-muted',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
      <Badge className={cn('capitalize', variants[status] || 'bg-muted')}>
        {status}
      </Badge>
    );
  };

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      approved: appointments.filter(a => a.status === 'approved').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };
  }, [appointments]);

  return (
    <DashboardLayout title="Appointments Management">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          All Appointments
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitor and manage all appointments across the clinic
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-warning/5 rounded-xl border border-warning/20 p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="bg-info/5 rounded-xl border border-info/20 p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-info">{stats.approved}</p>
        </div>
        <div className="bg-success/5 rounded-xl border border-success/20 p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="bg-muted rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Cancelled</p>
          <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, doctor, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Doctor Filter */}
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="All Doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name || doctor.email || 'Unknown Doctor'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full lg:w-[180px]"
            />
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || doctorFilter !== 'all' || dateFilter || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('all');
                setDoctorFilter('all');
                setDateFilter('');
                setSearchQuery('');
              }}
            >
              Clear
            </Button>
          )}
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
          Showing {filteredAppointments.length} appointment(s)
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <CardSkeleton count={5} />
        </div>
      )}

      {/* Appointments Table */}
      {!isLoading && !error && (
        <>
          {filteredAppointments.length > 0 ? (
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{apt.patientName}</p>
                            <p className="text-xs text-muted-foreground">{apt.patientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{apt.doctorName}</p>
                            {apt.doctorSpecialization && (
                              <p className="text-xs text-muted-foreground">{apt.doctorSpecialization}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {apt.department || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {apt.date ? format(new Date(apt.date), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">{apt.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {apt.reason || 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(apt.status)}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-muted-foreground">
                            {apt.createdAt ? format(new Date(apt.createdAt), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrev || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={!pagination.hasNext || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
              {(statusFilter !== 'all' || doctorFilter !== 'all' || dateFilter || searchQuery) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminAppointmentsPage;

