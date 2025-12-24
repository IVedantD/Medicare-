import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminDoctors, useApproveDoctor, useRejectDoctor, useBlockDoctor, useUnblockDoctor } from '@/hooks/useAdmin';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, XCircle, Ban, RefreshCcw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusBadge = (verified: boolean, isActive: boolean) => {
  let text = 'Pending';
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  if (!isActive) {
    text = 'Blocked';
    variant = 'destructive';
  } else if (verified) {
    text = 'Approved';
    variant = 'secondary';
  }
  return <Badge variant={variant}>{text}</Badge>;
};

const AdminDoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') as 'all' | 'pending' | 'approved' | 'blocked' | null;
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>(
    statusFromUrl && ['all', 'pending', 'approved', 'blocked'].includes(statusFromUrl) ? statusFromUrl : 'all'
  );
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; action: string; name: string } | null>(null);

  // Update URL when filter changes
  useEffect(() => {
    if (statusFilter !== 'all') {
      setSearchParams({ status: statusFilter });
    } else {
      setSearchParams({});
    }
  }, [statusFilter, setSearchParams]);

  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminDoctors({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    page,
    limit: 20
  });

  const doctors = data?.doctors || data || [];
  const pagination = data?.pagination;

  const approveDoctor = useApproveDoctor();
  const rejectDoctor = useRejectDoctor();
  const blockDoctor = useBlockDoctor();
  const unblockDoctor = useUnblockDoctor();

  const handleAction = async () => {
    if (!confirm) return;
    const { id, action } = confirm;
    if (action === 'approve') await approveDoctor.mutateAsync(id);
    if (action === 'reject') await rejectDoctor.mutateAsync(id);
    if (action === 'block') await blockDoctor.mutateAsync(id);
    if (action === 'unblock') await unblockDoctor.mutateAsync(id);
    setConfirm(null);
  };

  const filtered = useMemo(() => doctors, [doctors]);

  return (
    <DashboardLayout title="Doctors Moderation">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">Doctors</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load doctors.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 border rounded-xl bg-card">
          <p className="text-muted-foreground">No doctors found</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name || doc.email || 'Unknown'}</TableCell>
                    <TableCell>{doc.email || '—'}</TableCell>
                    <TableCell>{doc.specialization || doc.department || '—'}</TableCell>
                    <TableCell>{statusBadge(doc.verified, doc.isActive)}</TableCell>
                    <TableCell>{doc.createdAt ? format(new Date(doc.createdAt), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {!doc.verified && doc.isActive && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setConfirm({ id: doc.id, action: 'approve', name: doc.name || doc.email || 'Doctor' })}
                          disabled={approveDoctor.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {!doc.verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirm({ id: doc.id, action: 'reject', name: doc.name || doc.email || 'Doctor' })}
                          disabled={rejectDoctor.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      )}
                      {doc.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConfirm({ id: doc.id, action: 'block', name: doc.name || doc.email || 'Doctor' })}
                          disabled={blockDoctor.isPending}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirm({ id: doc.id, action: 'unblock', name: doc.name || doc.email || 'Doctor' })}
                          disabled={unblockDoctor.isPending}
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          Unblock
                        </Button>
                      )}
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
      )}

      <AlertDialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === 'approve' && 'Approve doctor?'}
              {confirm?.action === 'reject' && 'Reject doctor?'}
              {confirm?.action === 'block' && 'Block doctor?'}
              {confirm?.action === 'unblock' && 'Unblock doctor?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={cn(
                confirm?.action === 'block' || confirm?.action === 'reject'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminDoctorsPage;

