import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminPatients, useBlockPatient, useUnblockPatient } from '@/hooks/useAdmin';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Ban, RefreshCcw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AdminPatientsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; action: string; name: string } | null>(null);

  const { data, isLoading, error } = useAdminPatients({
    search: search || undefined,
    page,
    limit: 20
  });

  const patients = data?.patients || data || [];
  const pagination = data?.pagination;

  const blockPatient = useBlockPatient();
  const unblockPatient = useUnblockPatient();

  const handleAction = async () => {
    if (!confirm) return;
    const { id, action } = confirm;
    if (action === 'block') await blockPatient.mutateAsync(id);
    if (action === 'unblock') await unblockPatient.mutateAsync(id);
    setConfirm(null);
  };

  return (
    <DashboardLayout title="Patients Moderation">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-display font-bold text-foreground">Patients</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load patients.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : patients.length === 0 ? (
        <div className="text-center py-10 border rounded-xl bg-card">
          <p className="text-muted-foreground">No patients found</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name || p.email || 'Unknown'}</TableCell>
                    <TableCell>{p.email || '—'}</TableCell>
                    <TableCell>{p.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? 'secondary' : 'destructive'}>
                        {p.isActive ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy') : '—'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {p.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setConfirm({ id: p.id, action: 'block', name: p.name || p.email || 'Patient' })}
                          disabled={blockPatient.isPending}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirm({ id: p.id, action: 'unblock', name: p.name || p.email || 'Patient' })}
                          disabled={unblockPatient.isPending}
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
              {confirm?.action === 'block' ? 'Block patient?' : 'Unblock patient?'}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirm?.name}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={cn(
                confirm?.action === 'block'
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

export default AdminPatientsPage;

