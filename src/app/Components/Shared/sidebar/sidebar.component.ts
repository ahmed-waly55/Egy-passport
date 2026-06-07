import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  navItems = [
    { icon: 'fa-regular fa-bell fa-house', label: 'الرئيسية', route: '/home' },

    {
      icon: 'fa-regular fa-bell fa-id-card',
      label: 'الهوية الرقمية',
      route: '/digital-id',
    },

    {
      icon: 'fa-regular fa-bell fa-file-lines',
      label: 'طلباتي',
      route: '/requests',
    },

    {
      icon: 'fa-regular fa-bell fa-folder-open',
      label: 'المستندات',
      route: '/documents',
    },

    {
      icon: 'fa-regular fa-bell',
      label: 'الإشعارات',
      route: '/notifications',
      badge: 3,
    },

    {
      icon: 'fa-regular fa-circle-user',
      label: 'الملف الشخصي',
      route: '/profile',
    },

    {
      icon: 'fa-regular fa-bell fa-gear',
      label: 'الإعدادات',
      route: '/settings',
    },
  ];
}
