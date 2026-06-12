import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { AdditionalInfoComponent } from './additional-info/additional-info.component';
import {
  MeResponse,
  MeService,
  ProfileResponse,
} from '../../services/me.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    PersonalInfoComponent,
    AdditionalInfoComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private meService = inject(MeService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  me: MeResponse | null = null;
  profile: ProfileResponse | null = null;
  loading = true;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return; // 👈 skip on server

    forkJoin({
      me: this.meService.getMe(),
      profile: this.meService.getProfile(),
    }).subscribe({
      next: ({ me, profile }) => {
        this.me = me.data;
        this.profile = profile.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Profile API error:', err); // 👈 add this
        this.toastr.error(
          'حدث خطأ أثناء تحميل البيانات، حاول مرة أخرى',
          'خطأ',
          { timeOut: 3000 },
        );
      },
    });
  }
}
