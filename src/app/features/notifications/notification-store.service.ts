// @path src/app/features/notifications/notification-store.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiNotification, PaginatedResponse } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationStoreService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = 'https://egypassport.runasp.net/api/me/notifications';

  private readonly _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  constructor() {
    this.loadCount();
  }

  loadCount(): void {
    this.http
      .get<PaginatedResponse<ApiNotification>>(this.baseUrl, {
        params: { pageNumber: 1, pageSize: 10 },
      })
      .subscribe({
        next: response => {
          const items = response.data ?? [];
          if (response.totalUnreadCount !== undefined) {
            this._unreadCount.set(response.totalUnreadCount);
          } else {
            this._unreadCount.set(items.filter(n => !n.isRead).length);
          }
        },
        error: () => {},
      });
  }

  setCount(n: number): void {
    this._unreadCount.set(Math.max(0, n));
  }

  decrement(): void {
    this._unreadCount.update(c => Math.max(0, c - 1));
  }

  clearAll(): void {
    this._unreadCount.set(0);
  }


}
