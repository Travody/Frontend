'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '@/lib/api/notification-service';
import { Notification } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  fetchNotifications: (params?: { unreadOnly?: boolean; page?: number; limit?: number; append?: boolean }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadCountRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (params?: { unreadOnly?: boolean; page?: number; limit?: number; append?: boolean; silent?: boolean }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const append = params?.append || false;
    const silent = params?.silent || false;

    // Only show loading if we don't have notifications yet, if appending, or if not silent
    if (append) {
      setIsLoadingMore(true);
    } else if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const response = await notificationService.getNotifications({
        page,
        limit,
        unreadOnly: params?.unreadOnly,
      });
      
      if (append) {
        setNotifications((prev) => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
        setCurrentPage(1);
      }
      
      setUnreadCount(response.unreadCount);
      if (!append) {
        previousUnreadCountRef.current = response.unreadCount;
      }
      setHasMore(response.pagination.hasNext);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      const previousCount = previousUnreadCountRef.current;
      
      // If count increased, refresh notifications to get new ones
      // Remove the previousCount > 0 check so it works even when starting from 0
      if (count > previousCount) {
        // Refresh notifications to get new ones at the top
        fetchNotifications({ page: 1 });
      }
      
      previousUnreadCountRef.current = count;
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotification = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications]);

  const refreshNotifications = useCallback(async () => {
    // Use silent mode to avoid showing loading state when refreshing
    await Promise.all([fetchNotifications({ page: 1, silent: true }), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchNotifications({ page: currentPage + 1, append: true });
  }, [hasMore, isLoadingMore, currentPage, fetchNotifications]);

  // Initial fetch - only when user is authenticated
  useEffect(() => {
    if (user) {
      // Fetch notifications first, then unread count
      // This ensures previousUnreadCountRef is set correctly
      fetchNotifications().then(() => {
        fetchUnreadCount();
      });
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      previousUnreadCountRef.current = 0;
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Poll for new notifications every 30 seconds - only when user is authenticated
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        loadMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

