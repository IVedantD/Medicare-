import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, Filter, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const actionLabels: Record<string, string> = {
  doctor_approved: 'Doctor Approved',
  doctor_rejected: 'Doctor Rejected',
  doctor_blocked: 'Doctor Blocked',
  doctor_unblocked: 'Doctor Unblocked',
  patient_blocked: 'Patient Blocked',
  patient_unblocked: 'Patient Unblocked',
  user_status_changed: 'User Status Changed',
  appointment_viewed: 'Appointment Viewed',
  dashboard_accessed: 'Dashboard Accessed',
  audit_log_viewed: 'Audit Log Viewed'
};

const actionColors: Record<string, string> = {
  doctor_approved: 'bg-success/10 text-success border-success/20',
  doctor_rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  doctor_blocked: 'bg-warning/10 text-warning border-warning/20',
  doctor_unblocked: 'bg-info/10 text-info border-info/20',
  patient_blocked: 'bg-warning/10 text-warning border-warning/20',
  patient_unblocked: 'bg-info/10 text-info border-info/20',
  user_status_changed: 'bg-muted text-muted-foreground',
  appointment_viewed: 'bg-primary/10 text-primary border-primary/20',
  dashboard_accessed: 'bg-primary/10 text-primary border-primary/20',
  audit_log_viewed: 'bg-primary/10 text-primary border-primary/20'
};

const AdminActivityPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data, isLoading, error } = useAuditLogs({
    page,
    limit: 20,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    
    const query = searchQuery.toLowerCase();
    return logs.filter((log: any) =>
      log.adminName?.toLowerCase().includes(query) ||
      log.targetName?.toLowerCase().includes(query) ||
      log.notes?.toLowerCase().includes(query)
    );
  }, [logs, searchQuery]);

  const getActionBadge = (action: string) => {
    const color = actionColors[action] || 'bg-muted text-muted-foreground';
    const label = actionLabels[action] || action.replace(/_/g, ' ');

    return (
      <Badge className={cn('capitalize', color)}>
        {label}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Admin Activity">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Admin Activity Log
        </h2>
        <p className="text-muted-foreground mt-1">
          View all admin actions and system activity
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by admin, target, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Filter */}
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {Object.keys(actionLabels).map(action => (
                <SelectItem key={action} value={action}>
                  {actionLabels[action]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Target Type Filter */}
          <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="flex-1"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              className="flex-1"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(actionFilter !== 'all' || targetTypeFilter !== 'all' || startDate || endDate || searchQuery) && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionFilter('all');
                setTargetTypeFilter('all');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setPage(1);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load audit logs. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <CardSkeleton count={5} className="h-24" />
      ) : (
        <>
          <div className="bg-card rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log: any) => (
                    <TableRow key={log._id || log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {log.createdAt ? format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.adminName || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{log.adminEmail || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.targetName || 'N/A'}</p>
                          {log.targetEmail && (
                            <p className="text-xs text-muted-foreground">{log.targetEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.targetType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {log.notes || '—'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total logs)
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
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminActivityPage;

