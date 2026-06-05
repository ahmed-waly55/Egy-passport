import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Notification,
  NotificationTab,
  NotificationTabItem,
  NotificationTypeConfig,
  NotificationType,
} from '../../shared/models/notification.model';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {

  readonly tabs: NotificationTabItem[] = [
    { id: 'all',       label: 'الكل',       icon: 'bi bi-bell-fill'                  },
    { id: 'unread',    label: 'غير مقروءة', icon: 'bi bi-record-circle-fill'         },
    { id: 'requests',  label: 'طلبات',      icon: 'bi bi-file-earmark-text-fill'     },
    { id: 'documents', label: 'مستندات',    icon: 'bi bi-folder-fill'                },
    { id: 'alerts',    label: 'تنبيهات',    icon: 'bi bi-exclamation-triangle-fill'  },
  ];

  readonly typeConfig: Record<NotificationType, NotificationTypeConfig> = {
    approved: { iconClass: 'bi bi-file-earmark-check-fill',    bgColorClass: 'ni-bg-success', textColorClass: 'ni-text-success' },
    update:   { iconClass: 'bi bi-file-earmark-text-fill',     bgColorClass: 'ni-bg-primary', textColorClass: 'ni-text-primary' },
    rejected: { iconClass: 'bi bi-file-earmark-x-fill',        bgColorClass: 'ni-bg-danger',  textColorClass: 'ni-text-danger'  },
    warning:  { iconClass: 'bi bi-exclamation-triangle-fill',  bgColorClass: 'ni-bg-warning', textColorClass: 'ni-text-warning' },
    payment:  { iconClass: 'bi bi-credit-card-fill',           bgColorClass: 'ni-bg-success', textColorClass: 'ni-text-success' },
    info:     { iconClass: 'bi bi-info-circle-fill',           bgColorClass: 'ni-bg-info',    textColorClass: 'ni-text-info'    },
  };

  private readonly allNotifications: Notification[] = [
    {
      id: 1,
      title: 'تم الموافقة على طلب إصدار جواز سفر رقمي',
      description: 'تم الموافقة على طلبك بنجاح. يمكنك الآن متابعة خطوات الدفع واستلام الجواز.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      status: 'new',
      type: 'approved',
      category: 'requests',
      actionLabel: 'عرض الطلب',
      actionRoute: '/requests/details',
    },
    {
      id: 2,
      title: 'تم تحديث حالة طلبك',
      description: 'تحديث حالة طلب إصدار جواز سفر رقمي رقم EP-2025-0005847.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'new',
      type: 'update',
      category: 'requests',
      actionLabel: 'عرض التفاصيل',
      actionRoute: '/requests/details',
    },
    {
      id: 3,
      title: 'مستند مرفوض',
      description: 'تم رفض مستند "إثبات محل الإقامة". يرجى رفع نسخة واضحة وحديثة.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'new',
      type: 'rejected',
      category: 'documents',
      actionLabel: 'رفع مستند جديد',
      actionRoute: '/documents/upload',
    },
    {
      id: 4,
      title: 'تذكير: انتهاء صلاحية مستند',
      description: 'تنتهي صلاحية بطاقة الرقم القومي الخاصة بك خلال 30 يوماً.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'read',
      type: 'warning',
      category: 'alerts',
      actionLabel: 'عرض التفاصيل',
      actionRoute: '/documents',
    },
    {
      id: 5,
      title: 'تم استلام دفعتك بنجاح',
      description: 'تم استلام دفعة رسوم إصدار الجواز بنجاح. شكراً لاستخدامك خدماتنا الرقمية.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'read',
      type: 'payment',
      category: 'general',
      actionLabel: 'عرض الإيصال',
      actionRoute: '/payments/receipt',
    },
    {
      id: 6,
      title: 'مرحباً بك في الهوية الرقمية للسفر',
      description: 'اكتشف خدماتنا الرقمية وابدأ رحلتك بكل سهولة وأمان.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'read',
      type: 'info',
      category: 'general',
      actionLabel: 'استكشف الخدمات',
      actionRoute: '/home',
    },
  ];

  activeTab = signal<NotificationTab>('all');

  filteredNotifications = computed<Notification[]>(() => {
    const tab = this.activeTab();
    switch (tab) {
      case 'unread':    return this.allNotifications.filter(n => n.status === 'new');
      case 'requests':  return this.allNotifications.filter(n => n.category === 'requests');
      case 'documents': return this.allNotifications.filter(n => n.category === 'documents');
      case 'alerts':    return this.allNotifications.filter(n => n.category === 'alerts');
      default:          return this.allNotifications;
    }
  });

  unreadCount = computed<number>(() =>
    this.allNotifications.filter(n => n.status === 'new').length
  );

  setActiveTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  markAsRead(notification: Notification): void {
    notification.status = 'read';
  }

  markAllAsRead(): void {
    this.allNotifications.forEach(n => (n.status = 'read'));
  }

  getTypeConfig(type: NotificationType): NotificationTypeConfig {
    return this.typeConfig[type];
  }

  getRelativeTime(date: Date): string {
    const diff    = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);

    if (minutes < 60)  return `منذ ${minutes} دقيقة`;
    if (hours   < 24)  return `منذ ${hours} ساعة`;
    if (days    === 1) return 'منذ يوم واحد';
    return `منذ ${days} أيام`;
  }
}
