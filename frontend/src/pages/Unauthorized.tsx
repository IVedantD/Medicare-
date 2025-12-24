import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Unauthorized Access
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="text-left">
            <p className="text-sm text-muted-foreground mb-2">Your current role:</p>
            <p className="text-lg font-semibold text-foreground capitalize">
              {user?.role || 'Unknown'}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              This page is restricted to specific user roles. Please contact an administrator if you believe this is an error.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user && (
            <Button variant="default" asChild>
              <Link to={getDashboardPath(user.role)}>
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

