'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notification';
import { getNotificationRoute } from '@/lib/notifications/notification-routes';
// Simple date formatter
const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};
import { Check, CheckCheck, Trash2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    notifications, 
    isLoading, 
    isLoadingMore,
    hasMore,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    loadMore 
  } = useNotifications();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Get route based on notification type and user type
    // Use actionUrl from backend if provided (for backward compatibility), otherwise use frontend routing
    const route = notification.actionUrl || (user ? getNotificationRoute(notification.type, user.userType, notification.metadata) : '/');
    router.push(route);
    onClose();
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    return '🔔';
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm rounded-lg border bg-white shadow-lg z-[100]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="h-[500px] overflow-auto" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-sm font-medium text-gray-900 mb-1">No notifications</p>
            <p className="text-xs text-gray-500 text-center">
              You're all caught up! We'll notify you when something new happens.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  'relative px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors',
                  !notification.isRead && 'bg-blue-50/50'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        'text-sm font-medium text-gray-900',
                        !notification.isRead && 'font-semibold'
                      )}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      <div className="flex items-center gap-1">
                        {notification.actionUrl && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleDelete(e, notification._id)}
                        >
                          <Trash2 className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex items-center justify-center py-4">
                {isLoadingMore ? (
                  <div className="text-sm text-gray-500">Loading more...</div>
                ) : (
                  <div className="h-4" /> // Spacer for intersection observer
                )}
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

