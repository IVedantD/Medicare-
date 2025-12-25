// Notification Service - Provides role-specific notifications

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const getNotificationsForRole = (role: string): Notification[] => {
  const baseTime = Date.now();

  switch (role?.toLowerCase()) {
    case 'patient':
      return [
        {
          id: 'p1',
          title: 'Appointment Confirmed',
          message: 'Your appointment with Dr. Smith has been confirmed for tomorrow at 2:00 PM',
          type: 'success',
          timestamp: new Date(baseTime - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: '/patient/appointments'
        },
        {
          id: 'p2',
          title: 'Lab Results Available',
          message: 'Your recent blood test results are now available in your medical records',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          actionUrl: '/patient/medical-records'
        },
        {
          id: 'p3',
          title: 'Prescription Reminder',
          message: 'Remember to take your medication as prescribed by Dr. Johnson',
          type: 'warning',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 6), // 6 hours ago
          read: true
        },
        {
          id: 'p4',
          title: 'Upcoming Appointment',
          message: 'You have an appointment with Dr. Wilson in 2 days. Please arrive 15 minutes early.',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 12), // 12 hours ago
          read: true,
          actionUrl: '/patient/appointments'
        },
        {
          id: 'p5',
          title: 'Welcome to MediCare',
          message: 'Thank you for joining MediCare. Complete your profile to get started',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: '/patient/profile'
        }
      ];

    case 'doctor':
      return [
        {
          id: 'd1',
          title: 'New Patient Appointment',
          message: 'Sarah Wilson has booked an appointment for tomorrow at 10:00 AM',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 15), // 15 minutes ago
          read: false,
          actionUrl: '/doctor/appointments'
        },
        {
          id: 'd2',
          title: 'Patient Lab Results',
          message: 'Lab results for John Doe are ready for review',
          type: 'success',
          timestamp: new Date(baseTime - 1000 * 60 * 45), // 45 minutes ago
          read: false,
          actionUrl: '/doctor/patients'
        },
        {
          id: 'd3',
          title: 'Schedule Update',
          message: 'Your availability for next week has been updated successfully',
          type: 'success',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 3), // 3 hours ago
          read: true,
          actionUrl: '/doctor/availability'
        },
        {
          id: 'd4',
          title: 'Urgent: Patient Message',
          message: 'Patient Emma Davis has sent an urgent message regarding her medication',
          type: 'warning',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 5), // 5 hours ago
          read: true,
          actionUrl: '/doctor/patients'
        },
        {
          id: 'd5',
          title: 'Profile Verification',
          message: 'Your medical license verification is complete. You can now accept appointments.',
          type: 'success',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          read: true,
          actionUrl: '/doctor/profile'
        }
      ];

    case 'admin':
      return [
        {
          id: 'a1',
          title: 'New Doctor Registration',
          message: 'Dr. Michael Chen has registered and requires verification',
          type: 'warning',
          timestamp: new Date(baseTime - 1000 * 60 * 20), // 20 minutes ago
          read: false,
          actionUrl: '/admin/doctors'
        },
        {
          id: 'a2',
          title: 'System Backup Complete',
          message: 'Daily system backup completed successfully at 3:00 AM',
          type: 'success',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 8), // 8 hours ago
          read: false
        },
        {
          id: 'a3',
          title: 'High Server Load',
          message: 'Server load is above 80%. Consider scaling resources.',
          type: 'warning',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 4), // 4 hours ago
          read: true
        },
        {
          id: 'a4',
          title: 'Monthly Report Ready',
          message: 'The monthly analytics report for November is now available',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 12), // 12 hours ago
          read: true,
          actionUrl: '/admin/reports'
        },
        {
          id: 'a5',
          title: 'User Feedback',
          message: '15 new user feedback submissions received this week',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: '/admin/feedback'
        }
      ];

    default:
      return [
        {
          id: 'default1',
          title: 'Welcome to MediCare',
          message: 'Thank you for joining MediCare. Explore the platform to get started.',
          type: 'info',
          timestamp: new Date(baseTime - 1000 * 60 * 60), // 1 hour ago
          read: false
        }
      ];
  }
};

// Mock API functions - in a real app, these would make HTTP requests
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`Marked notification ${notificationId} as read`);
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log(`Marked all notifications as read for user ${userId}`);
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`Deleted notification ${notificationId}`);
};

export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};