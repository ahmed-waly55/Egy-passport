import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { NotificationService } from './notification.service';
import { NotificationStoreService } from './notification-store.service';
import {
  ApiNotification,
  Notification,
  NotificationCategory,
  NotificationStatus,
  NotificationTab,
  NotificationTabItem,
  NotificationType,
  NotificationTypeConfig,
} from '../../shared/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatPaginator],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly service    = inject(NotificationService);
  private readonly store      = inject(NotificationStoreService);
  private readonly destroyRef = inject(DestroyRef);

  /* ── State ── */
  readonly notifications = signal<Notification[]>([]);
  readonly loading       = signal(true);
  readonly error         = signal<string | null>(null);
  readonly totalCount    = signal(0);
  readonly pageNumber    = signal(1);
  readonly pageSize      = signal(10);
  readonly activeTab     = signal<NotificationTab>('all');

  /* ── Derived ── */
  readonly unreadCount = computed(() =>
    this.notifications().filter(n => n.status === 'new').length
  );

  readonly filteredNotifications = computed<Notification[]>(() => {
    const tab = this.activeTab();
    const all = this.notifications();
    switch (tab) {
      case 'unread':    return all.filter(n => n.status === 'new');
      case 'requests':  return all.filter(n => n.category === 'requests');
      case 'documents': return all.filter(n => n.category === 'documents');
      case 'alerts':    return all.filter(n => n.category === 'alerts');
      default:          return all;
    }
  });

  /* ── Static config ── */
  readonly skeletonItems = Array(10).fill(null);

  readonly tabs: NotificationTabItem[] = [
    { id: 'all',       label: 'الكل',       icon: 'bi bi-bell-fill'                 },
    { id: 'unread',    label: 'غير مقروءة', icon: 'bi bi-record-circle-fill'        },
    { id: 'requests',  label: 'طلبات',      icon: 'bi bi-file-earmark-text-fill'    },
    { id: 'documents', label: 'مستندات',    icon: 'bi bi-folder-fill'               },
    { id: 'alerts',    label: 'تنبيهات',    icon: 'bi bi-exclamation-triangle-fill' },
  ];

  readonly typeConfig: Record<string, NotificationTypeConfig> = {
    approved: { iconClass: 'bi bi-file-earmark-check-fill',   bgColorClass: 'ni-bg-success', textColorClass: 'ni-text-success' },
    update:   { iconClass: 'bi bi-file-earmark-text-fill',    bgColorClass: 'ni-bg-primary', textColorClass: 'ni-text-primary' },
    rejected: { iconClass: 'bi bi-file-earmark-x-fill',       bgColorClass: 'ni-bg-danger',  textColorClass: 'ni-text-danger'  },
    warning:  { iconClass: 'bi bi-exclamation-triangle-fill', bgColorClass: 'ni-bg-warning', textColorClass: 'ni-text-warning' },
    payment:  { iconClass: 'bi bi-credit-card-fill',          bgColorClass: 'ni-bg-success', textColorClass: 'ni-text-success' },
    info:     { iconClass: 'bi bi-info-circle-fill',          bgColorClass: 'ni-bg-info',    textColorClass: 'ni-text-info'    },
  };

  /* ── Reload trigger ── */
  private readonly loadPage$ = new Subject<void>();

  constructor() {
    this.loadPage$
      .pipe(
        switchMap(() => {
          this.loading.set(true);
          this.error.set(null);
          return this.service
            .getNotifications(this.pageNumber(), this.pageSize())
            .pipe(
              catchError(() => {
                this.error.set('فشل في تحميل الإشعارات. يرجى المحاولة مرة أخرى.');
                this.loading.set(false);
                return EMPTY;
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(response => {
        const mapped = this.mapNotifications(response.data);
        this.notifications.set(mapped);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);

        // Sync badge count from fresh API data
        if (response.totalUnreadCount !== undefined) {
          this.store.setCount(response.totalUnreadCount);
        } else {
          this.store.setCount(mapped.filter(n => n.status === 'new').length);
        }
      });

    this.loadPage$.next();
  }

  /* ── Public actions ── */

  refresh(): void {
    this.pageNumber.set(1);
    this.loadPage$.next();
  }

  setActiveTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  markAsRead(notification: Notification): void {
    if (notification.status === 'read') return;

    const prev = [...this.notifications()];
    this.notifications.update(list =>
      list.map(n =>
        n.id === notification.id ? { ...n, status: 'read' as NotificationStatus } : n
      )
    );
    this.store.decrement(); // optimistic badge update

    this.service
      .markAsRead(String(notification.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.notifications.set(prev); // revert local state
          this.store.loadCount();       // revert badge by re-fetching
        },
      });
  }

  markAllAsRead(): void {
    this.service
      .markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.update(list =>
            list.map(n => ({ ...n, status: 'read' as NotificationStatus }))
          );
          this.store.clearAll(); // set badge to 0 after confirmed success
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadPage$.next();
  }

  /* ── Template helpers ── */

  trackById(_: number, n: Notification): number {
    return n.id;
  }

  getTypeConfig(type: string): NotificationTypeConfig {
    return this.typeConfig[type] ?? this.typeConfig['info'];
  }

  getRelativeTime(date: Date): string {
    const diff    = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);

    if (minutes < 1)   return 'الآن';
    if (minutes < 60)  return `منذ ${minutes} دقيقة`;
    if (hours   < 24)  return `منذ ${hours} ساعة`;
    if (days    === 1) return 'منذ يوم واحد';
    return `منذ ${days} أيام`;
  }

  /* ── Private mapping ── */

  private mapNotifications(apiData: ApiNotification[]): Notification[] {
    return apiData.map(n => ({
      id:          Number(n.id) || 0,
      title:       n.title,
      description: n.message,
      timestamp:   new Date(n.createdAt),
      status:      (n.isRead ? 'read' : 'new') as NotificationStatus,
      type:        (this.typeConfig[n.type ?? ''] ? n.type : 'info') as NotificationType,
      category:    this.inferCategory(n.type) as NotificationCategory,
    }));
  }

  private inferCategory(type?: string): NotificationCategory {
    const map: Record<string, NotificationCategory> = {
      approved: 'requests',
      update:   'requests',
      rejected: 'documents',
      warning:  'alerts',
      payment:  'general',
      info:     'general',
    };
    return map[type ?? ''] ?? 'general';
  }
}
