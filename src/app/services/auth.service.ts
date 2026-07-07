import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {
  IForgotPassword,
  ILogin,
  IResetPassword,
  ISignup,
} from '../core/models/iauth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _http: HttpClient) {}

  login(emailOrMobile: string, password: string): Observable<ILogin> {
    // Implement login logic here, e.g., send credentials to the backend API
    return this._http.post<ILogin>(`${environment.baseApiUrl}/api/auth/login`, {
      emailOrMobile,
      password,
    });
  }

  register(userData: any): Observable<ISignup> {
    // Implement registration logic here, e.g., send user data to the backend API
    return this._http.post<ISignup>(
      `${environment.baseApiUrl}/api/auth/register`,
      userData,
    );
  }

  forgotPassword(emailOrMobile: string): Observable<IForgotPassword> {
    // Implement forgot password logic here, e.g., send email or mobile number to the backend API
    return this._http.post<IForgotPassword>(
      `${environment.baseApiUrl}/api/auth/forgot-password`,
      { emailOrMobile },
    );
  }

  resetPassword(resetData: any): Observable<IResetPassword> {
    return this._http.post<IResetPassword>(
      `${environment.baseApiUrl}/api/auth/reset-password`,
      { resetData },
    );
  }

  logout(refreshToken: string): Observable<any> {
    return this._http.post(`${environment.baseApiUrl}/api/auth/logout`, {
      refreshToken,
    });
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Observable<any> {
    return this._http.post(
      `${environment.baseApiUrl}/api/auth/change-password`,
      {
        currentPassword,
        newPassword,
        confirmPassword,
      },
    );
  }
}
