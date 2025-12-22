import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'success';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantClasses = {
    default: 'bg-card',
    primary: 'bg-primary/5 border-primary/20',
    accent: 'bg-accent/5 border-accent/20',
    warning: 'bg-warning/5 border-warning/20',
    success: 'bg-success/5 border-success/20',
  };

  const iconClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-lg",
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          iconClasses[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

interface AppointmentCardProps {
  id: string;
  patientName?: string;
  doctorName?: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
  reason?: string;
  onAction?: (action: string) => void;
  showActions?: boolean;
  className?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = memo(({
  patientName,
  doctorName,
  date,
  time,
  status,
  reason,
  onAction,
  showActions = false,
  className,
}) => {
  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-info/10 text-info border-info/20',
    completed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-muted text-muted-foreground border-muted',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 transition-all hover:shadow-md",
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <p className="font-semibold text-foreground">
            {patientName || doctorName}
          </p>
          <p className="text-sm text-muted-foreground">
            {date} at {time}
          </p>
          {reason && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              Reason: {reason}
            </p>
          )}
        </div>
        <span className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize",
          statusColors[status]
        )}>
          {status}
        </span>
      </div>
      
      {showActions && status === 'pending' && onAction && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <button
            onClick={() => onAction('approve')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => onAction('reject')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
});

AppointmentCard.displayName = 'AppointmentCard';

interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  department?: string;
  rating?: number;
  experience?: string;
  image?: string;
  available?: boolean;
  onBook?: () => void;
  className?: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = memo(({
  name,
  specialization,
  department,
  rating,
  experience,
  available = true,
  onBook,
  className,
}) => {
  return (
    <div className={cn(
      "group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-display font-bold text-xl">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">
            {name}
          </h3>
          <p className="text-sm text-primary font-medium">{specialization}</p>
          {department && (
            <p className="text-sm text-muted-foreground">{department}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        {rating && (
          <span className="flex items-center gap-1">
            <span className="text-warning">★</span>
            {rating.toFixed(1)}
          </span>
        )}
        {experience && (
          <span>{experience} exp</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium",
          available ? "text-success" : "text-muted-foreground"
        )}>
          <span className={cn(
            "h-2 w-2 rounded-full",
            available ? "bg-success" : "bg-muted-foreground"
          )} />
          {available ? 'Available Today' : 'Not Available'}
        </span>
        
        {onBook && available && (
          <button
            onClick={onBook}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
});

DoctorCard.displayName = 'DoctorCard';
