import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MeResponse, ProfileResponse } from '../../../services/me.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.css',
})
export class ProfileHeaderComponent {
  @Input() me: MeResponse | null = null;
  @Input() profile: ProfileResponse | null = null;
  @Input() loading = true;

  imageUrl(): string {
    if (!this.profile?.profilePhotoUrl) {
      return 'assets/user.png';
    }

    return `https://egypassport.runasp.net${this.profile.profilePhotoUrl}`;
  }
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/user.png';
  }
}
