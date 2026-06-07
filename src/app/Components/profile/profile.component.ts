import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  MeResponse,
  MeService,
  ProfileResponse,
} from '../../Services/me.service';
import { ProfileHeaderComponent } from './Components/profile-header/profile-header.component';
import { PersonalInfoComponent } from './Components/personal-info/personal-info.component';
import { AdditionalInfoComponent } from './Components/additional-info/additional-info.component';
import { ToastrService } from 'ngx-toastr';

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

  me: MeResponse | null = null;
  profile: ProfileResponse | null = null;
  loading = true;

  ngOnInit() {
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
        this.toastr.error('حدث خطأ أثناء تحميل البيانات، حاول مرة أخرى', 'خطأ');
      },
    });
  }
}
