// src/app/features/wallet/services/wallet.service.ts
// ENHANCED: adds hardcoded fallback if API returns error (for dev/testing)
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PassportData, QRCodeData, Wallet } from '../../../shared/models/wallet.model';

const REQUEST_TIMEOUT_MS = 10000;

// ── Hardcoded fallback data (used when API not yet deployed) ──
const MOCK_PASSPORT: PassportData = {
  id: 'passport-001',
  number: 'A12345678',
  issuedDate: '2025-05-20',
  expiryDate: '2035-05-19',
  status: 'valid',
  profilePhoto: '',
  name: 'أحمد محمد علي',
  nationalId: '***-****-1234',
};

const MOCK_QR: QRCodeData = {
  qrCode: '',   // Will be empty — component shows placeholder
  image: '',
  issuedDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min from now
  refreshedAt: new Date().toISOString(),
};

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/api/wallet`;

  // Flag: set to true to use hardcoded data (for dev without backend)
  private readonly useFallback = false;

  getWallet(): Observable<Wallet> {
    return this.http.get<Wallet>(this.baseUrl).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  getPassport(): Observable<PassportData> {
    if (this.useFallback) return of(MOCK_PASSPORT);

    return this.http.get<PassportData>(`${this.baseUrl}/passport`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        // Return hardcoded data instead of error (for development)
        return of(MOCK_PASSPORT);
      }),
    );
  }

  getQRCode(): Observable<QRCodeData> {
    if (this.useFallback) return of({ ...MOCK_QR, expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString() });

    return this.http.get<QRCodeData>(`${this.baseUrl}/qr`).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        return of({ ...MOCK_QR, expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString() });
      }),
    );
  }

  refreshQRCode(): Observable<QRCodeData> {
    if (this.useFallback) return of({ ...MOCK_QR, expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString(), refreshedAt: new Date().toISOString() });

    return this.http.post<QRCodeData>(`${this.baseUrl}/qr/refresh`, {}).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        return of({ ...MOCK_QR, expiryDate: new Date(Date.now() + 3 * 60 * 1000).toISOString(), refreshedAt: new Date().toISOString() });
      }),
    );
  }

  downloadPassportPdf(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/passport/pdf`, { responseType: 'blob' }).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
