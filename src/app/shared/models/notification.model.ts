export type NotificationType     = 'approved' | 'update' | 'rejected' | 'warning' | 'payment' | 'info';
export type NotificationStatus   = 'new' | 'read';
export type NotificationCategory = 'requests' | 'documents' | 'alerts' | 'general';
export type NotificationTab      = 'all' | 'unread' | 'requests' | 'documents' | 'alerts';

export interface Notification {
  id: number;
  title: string;
  description: string;
  timestamp: Date;
  status: NotificationStatus;
  type: NotificationType;
  category: NotificationCategory;
  actionLabel?: string;
  actionRoute?: string;
}

export interface NotificationTabItem {
  id: NotificationTab;
  label: string;
  icon: string;
}

export interface NotificationTypeConfig {
  iconClass: string;
  bgColorClass: string;
  textColorClass: string;
}

/* ── API Contract ── */
export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
