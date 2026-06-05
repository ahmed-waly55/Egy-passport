
import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent }  from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DocumentService }  from '../../services/document.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  private readonly svc    = inject(DocumentService);
  private readonly router = inject(Router);

  // Single source of truth for sidebar state
  readonly sidebarOpen = signal(window.innerWidth >= 992);
  readonly isMobile    = signal(window.innerWidth < 992);

  get lang() { return this.svc.lang(); }
  get dir()  { return this.lang === 'ar' ? 'rtl' : 'ltr'; }

  constructor() {
    console.trace('MainLayout loaded'+this);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      // Close on mobile after navigation
      if (this.isMobile()) this.sidebarOpen.set(false);
    });
  }

  @HostListener('window:resize')
  onResize() {
    const mobile = window.innerWidth < 992;
    this.isMobile.set(mobile);
    // On desktop always open, on mobile always closed unless toggled
    this.sidebarOpen.set(!mobile);
  }

  //  Single toggle — flips between true/false
  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeOverlay() {
    this.sidebarOpen.set(false);
  }
}