import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Application,
  ApplicationPersonalInfo,
  ApplicationStatus,
  ApplicationsListResponse,
} from '../../../shared/models/application.model';

const REQUEST_TIMEOUT_MS = 10000;

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/api/applications`;

  getAllApplications(): Observable<Application[]> {
    return this.http.get<ApplicationsListResponse>(this.baseUrl).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      map((res) => res.data ?? []),
      catchError((err) => throwError(() => err)),
    );
  }

  getApplicationStatus(id: string): Observable<ApplicationStatus> {
    return this.http.get<ApplicationStatus>(`${this.baseUrl}/${id}/status`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => throwError(() => err)),
    );
  }

  createDraft(): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}/draft`, {}).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => throwError(() => err)),
    );
  }

  updatePersonalInfo(id: string, personalInfo: ApplicationPersonalInfo): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/${id}/personal-info`, personalInfo).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => throwError(() => err)),
    );
  }

  submitApplication(id: string): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}/${id}/submit`, {}).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => throwError(() => err)),
    );
  }
}
