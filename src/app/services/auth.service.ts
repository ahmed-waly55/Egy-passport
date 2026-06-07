import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ILogin, ISignup } from '../core/models/iauth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient) { }

  login(emailOrMobile: string, password: string):Observable<ILogin> {
    // Implement login logic here, e.g., send credentials to the backend API
    return this._http.post<ILogin>(`${environment.baseApiUrl}/api/auth/login`, { emailOrMobile, password });
  }

  register(userData: ISignup): Observable<ISignup> {
    // Implement registration logic here, e.g., send user data to the backend API
    return this._http.post<ISignup>(`${environment.baseApiUrl}/api/auth/register`, userData);
  }

}
