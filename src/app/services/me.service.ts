import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

export interface MeResponse {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ProfileResponse {
  nationalId: string;
  governorate: string;
  address: string;
  nationality: string;
  placeOfBirth: string;
  profilePhotoUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  messageAr: string;
  messageEn: string;
  data: T | null;
  errors: any | null;
}

@Injectable({
  providedIn: 'root',
})
export class MeService {
  constructor(private _http: HttpClient) {}

  getMe() {
    return this._http.get<ApiResponse<MeResponse>>(
      `${environment.baseApiUrl}/api/me`,
    );
  }

  getProfile() {
    return this._http.get<ApiResponse<ProfileResponse>>(
      `${environment.baseApiUrl}/api/me/profile`,
    );
  }

  updateProfile(body: any) {
    return this._http.put<ApiResponse<any>>(
      `${environment.baseApiUrl}/api/me/profile`,
      body,
    );
  }
}
