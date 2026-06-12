import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MeResponse, ProfileResponse } from '../../../services/me.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Route, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css',
})
export class PersonalInfoComponent {
  @Input() me: MeResponse | null = null;
  @Input() profile: ProfileResponse | null = null;
  @Input() loading = true;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _toastr: ToastrService,
  ) {}

  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';

    this._authService.logout(refreshToken).subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this._toastr.success(
          'You have been logged out successfully',
          'Goodbye!',
        );
        this._router.navigate(['/auth/login']);
      },
      error: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this._toastr.error(
          'Something went wrong, but you have been logged out',
          'Error',
        );
        this._router.navigate(['/auth/login']);
      },
    });
  }
}
