import { NotificationType } from '@/types/notification';
import { User } from '@/contexts/AuthContext';

/**
 * Get the route for a notification based on its type and user type
 * This centralizes routing logic in the frontend for better scalability
 * 
 * Only uses routes that actually exist in the application
 */
export function getNotificationRoute(
  type: NotificationType,
  userType: User['userType'],
  metadata?: {
    bookingId?: string;
    planId?: string;
    reviewId?: string;
    [key: string]: any;
  }
): string {
  switch (type) {
    // Booking-related notifications
    // Routes: /traveler/trips, /guider/bookings
    case NotificationType.BOOKING_CREATED:
    case NotificationType.BOOKING_CONFIRMED:
    case NotificationType.BOOKING_CANCELLED:
    case NotificationType.BOOKING_REMINDER:
    case NotificationType.PAYMENT_SUCCESS:
    case NotificationType.PAYMENT_FAILED:
      return userType === 'traveler' ? '/traveler/trips' : '/guider/bookings';

    // Review-related notifications
    // Routes: /traveler/trips, /guider/bookings (reviews shown on these pages)
    case NotificationType.REVIEW_RECEIVED:
    case NotificationType.REVIEW_RESPONSE:
      return userType === 'traveler' ? '/traveler/trips' : '/guider/bookings';

    // Plan-related notifications
    // Route: /guider/my-plans
    case NotificationType.PLAN_APPROVED:
    case NotificationType.PLAN_REJECTED:
      return '/guider/my-plans';

    // Verification notifications
    // Route: /guider/verification
    case NotificationType.VERIFICATION_COMPLETE:
    case NotificationType.VERIFICATION_PENDING:
      return '/guider/verification';

    // System announcements
    // Routes: /traveler/dashboard, /guider/dashboard
    case NotificationType.SYSTEM_ANNOUNCEMENT:
    default:
      return userType === 'traveler' ? '/traveler/dashboard' : '/guider/dashboard';
  }
}

