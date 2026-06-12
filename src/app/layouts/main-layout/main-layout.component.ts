import {
  Component,
  inject,
  signal,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  private readonly svc = inject(DocumentService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly sidebarOpen = signal(false);
  readonly isMobile = signal(false);

  get lang() {
    return this.svc.lang();
  }

  get dir() {
    return this.lang === 'ar' ? 'rtl' : 'ltr';
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const mobile = window.innerWidth < 992;

      this.isMobile.set(mobile);
      this.sidebarOpen.set(!mobile);
    }

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile()) {
          this.sidebarOpen.set(false);
        }
      });
  }

  @HostListener('window:resize')
  onResize() {
    if (!isPlatformBrowser(this.platformId)) return;

    const mobile = window.innerWidth < 992;

    this.isMobile.set(mobile);
    this.sidebarOpen.set(!mobile);
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeOverlay() {
    this.sidebarOpen.set(false);
  }
}
