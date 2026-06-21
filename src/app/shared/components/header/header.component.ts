import {
  Component,
  Output,
  EventEmitter,
  inject,
  signal,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../services/document.service';
import { NotificationStoreService } from '../../../features/notifications/notification-store.service';
import { MeService } from '../../../services/me.service';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly svc = inject(DocumentService);
  private readonly el = inject(ElementRef);
  private readonly notifStore = inject(NotificationStoreService);
  private readonly meService = inject(MeService);
  langOpen = signal(false);
  userMenuOpen = signal(false);

  userName = '';
  userRole = '';
  avatarUrl = 'assets/default-avatar.png';

  ngOnInit(): void {
    forkJoin({
      me: this.meService.getMe(),
      profile: this.meService.getProfile(),
    }).subscribe({
      next: ({ me, profile }) => {
        this.userName = me.data?.fullName ?? '';

        this.userRole =
          this.lang === 'ar' ? 'المواطن المصري' : 'Egyptian Citizen';

        if (profile.data?.profilePhotoUrl) {
          this.avatarUrl =
            'https://egypassport.runasp.net' + profile.data.profilePhotoUrl;
        }
      },

      error: (err) => {
        console.error(err);
      },
    });
  }
  get lang() {
    return this.svc.lang();
  }
  get user() {
    return this.svc.user;
  }
  get notifCount() {
    return this.notifStore.unreadCount();
  }

  toggleLang() {
    this.langOpen.update((v) => !v);
    this.userMenuOpen.set(false);
  }
  toggleUserMenu() {
    this.userMenuOpen.update((v) => !v);
    this.langOpen.set(false);
  }
  selectLang(l: 'ar' | 'en') {
    this.svc.setLang(l);
    this.langOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.langOpen.set(false);
      this.userMenuOpen.set(false);
    }
  }
}
