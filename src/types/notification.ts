export enum NotificationType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  REVIEW_RESPONSE = 'REVIEW_RESPONSE',
  PLAN_APPROVED = 'PLAN_APPROVED',
  PLAN_REJECTED = 'PLAN_REJECTED',
  VERIFICATION_COMPLETE = 'VERIFICATION_COMPLETE',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export interface Notification {
  _id: string;
  userType: 'traveler' | 'guider' | 'admin';
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    bookingId?: string;
    planId?: string;
    reviewId?: string;
    guiderId?: string;
    travelerId?: string;
    [key: string]: any;
  };
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

