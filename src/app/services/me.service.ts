import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

export interface MeResponse {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;

  isEmailVerified: boolean;
  isMobileVerified: boolean;

  createdAt: string;
  role: string;
  isActive: boolean;
}

export interface ProfileResponse {
  nationalId: string;
  dateOfBirth: string;
  gender: string;
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
export interface UpdateProfileRequest {
  nationalId: string;
  governorate: string;
  address: string;
  nationality: string;
  placeOfBirth: string;
  profilePhotoUrl: string;
}
@Injectable({
  providedIn: 'root',
})
export class MeService {
  constructor(private _http: HttpClient) {}

  getMe() {
    return this._http.get<any>(`${environment.baseApiUrl}/api/me`);
  }

  getProfile() {
    return this._http.get<ApiResponse<ProfileResponse>>(
      `${environment.baseApiUrl}/api/me/profile`,
    );
  }

  updateProfile(data: UpdateProfileRequest) {
    return this._http.put(`${environment.baseApiUrl}/api/me/profile`, data);
  }
}
