import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingGroup, SettingItem } from '../../shared/models/setting.model';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {

  constructor(private router: Router) {}

  readonly settingGroups: SettingGroup[] = [
    {
      id: 'account',
      title: 'الحساب والملف الشخصي',
      items: [
        {
          id: 'personal-info',
          label: 'معلوماتي الشخصية',
          description: 'عرض وتعديل بياناتك الشخصية',
          iconClass: 'bi bi-person-circle',
          iconBgColor: 'si-blue',
          route: '/settings/personal-info',
          action: 'navigate',
        },
        {
          id: 'account-settings',
          label: 'إعدادات الحساب',
          description: 'تغيير كلمة المرور والبريد الإلكتروني',
          iconClass: 'bi bi-credit-card-fill',
          iconBgColor: 'si-green',
          route: '/settings/account',
          action: 'navigate',
        },
        {
          id: 'manage-devices',
          label: 'إدارة الأجهزة',
          description: 'الأجهزة المسجلة على حسابك',
          iconClass: 'bi bi-laptop-fill',
          iconBgColor: 'si-teal',
          route: '/settings/devices',
          action: 'navigate',
        },
        {
          id: 'logout-all',
          label: 'تسجيل الخروج من جميع الأجهزة',
          description: 'تسجيل الخروج من جميع الجلسات',
          iconClass: 'bi bi-box-arrow-left',
          iconBgColor: 'si-red',
          action: 'logout-all',
        },
      ],
    },
    {
      id: 'security',
      title: 'الأمان والخصوصية',
      items: [
        {
          id: 'change-password',
          label: 'تغيير كلمة المرور',
          description: 'تحديث كلمة المرور الخاصة بحسابك بشكل دوري',
          iconClass: 'bi bi-lock-fill',
          iconBgColor: 'si-blue',
          route: '/settings/change-password',
          action: 'navigate',
        },
        {
          id: 'two-factor',
          label: 'التحقق بخطوتين',
          description: 'تفعيل أو تعطيل ميزة التحقق بخطوتين',
          iconClass: 'bi bi-shield-check',
          iconBgColor: 'si-green',
          route: '/settings/two-factor',
          action: 'navigate',
        },
        {
          id: 'permissions',
          label: 'إدارة الصلاحيات والموافقات',
          description: 'إدارة الموافقات على مشاركة بياناتك مع الجهات',
          iconClass: 'bi bi-key-fill',
          iconBgColor: 'si-orange',
          route: '/settings/permissions',
          action: 'navigate',
        },
        {
          id: 'activity-log',
          label: 'تاريخ النشاط',
          description: 'عرض سجل نشاطك وتسجيلات الدخول',
          iconClass: 'bi bi-clock-history',
          iconBgColor: 'si-purple',
          route: '/settings/activity',
          action: 'navigate',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'التفضيلات',
      items: [
        {
          id: 'dark-mode',
          label: 'الوضع الليلي',
          description: 'تفعيل أو تعطيل الوضع الليلي',
          iconClass: 'bi bi-moon-stars-fill',
          iconBgColor: 'si-dark',
          action: 'toggle-dark-mode',
        },
        {
          id: 'notifications-prefs',
          label: 'الإشعارات',
          description: 'إدارة تنبيهات التطبيق والبريد الإلكتروني',
          iconClass: 'bi bi-bell-fill',
          iconBgColor: 'si-blue',
          route: '/settings/notifications',
          action: 'navigate',
        },
        {
          id: 'language',
          label: 'اللغة',
          description: 'تغيير لغة التطبيق',
          iconClass: 'bi bi-globe2',
          iconBgColor: 'si-orange',
          route: '/settings/language',
          action: 'navigate',
        },

      ],
    },
    {
      id: 'support',
      title: 'الدعم والتطبيق',
      items: [
        {
          id: 'help-center',
          label: 'مركز المساعدة',
          description: 'الأسئلة الشائعة والأحكام',
          iconClass: 'bi bi-question-circle-fill',
          iconBgColor: 'si-blue',
          route: '/settings/help',
          action: 'navigate',
        },

        {
          id: 'privacy-policy',
          label: 'سياسة الخصوصية',
          description: 'عرض سياسة الخصوصية',
          iconClass: 'bi bi-file-earmark-text-fill',
          iconBgColor: 'si-blue',
          route: '/settings/privacy',
          action: 'navigate',
        },
        {
          id: 'terms',
          label: 'الشروط والأحكام',
          description: 'عرض الشروط والأحكام',
          iconClass: 'bi bi-file-earmark-check-fill',
          iconBgColor: 'si-green',
          route: '/settings/terms',
          action: 'navigate',
        },
        {
          id: 'about',
          label: 'عن التطبيق',
          description: 'معلومات الإصدار والتحديثات',
          iconClass: 'bi bi-info-circle-fill',
          iconBgColor: 'si-teal',
          route: '/settings/about',
          action: 'navigate',
        },
      ],
    },
  ];

  onSettingClick(item: SettingItem): void {
    switch (item.action) {
      case 'navigate':
        if (item.route) this.router.navigate([item.route]);
        break;
      case 'logout-all':
        this.logoutAllDevices();
        break;
      case 'toggle-dark-mode':
        this.toggleDarkMode();
        break;
      case 'rate-app':
        this.openAppRating();
        break;
    }
  }

  private logoutAllDevices(): void {
  }

  private toggleDarkMode(): void {
    document.body.classList.toggle('dark-mode');
  }

  private openAppRating(): void {
  }
}
