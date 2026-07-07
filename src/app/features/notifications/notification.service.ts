import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiNotification, PaginatedResponse } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://egypassport.runasp.net/api/me/notifications';

  getNotifications(
    pageNumber = 1,
    pageSize = 10,
  ): Observable<PaginatedResponse<ApiNotification>> {
    return this.http
      .get<PaginatedResponse<ApiNotification>>(this.baseUrl, {
        params: { pageNumber, pageSize },
      })
      .pipe(shareReplay(1));
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/read-all`, {});
  }
}
