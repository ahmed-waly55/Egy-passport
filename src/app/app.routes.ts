import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    title: 'Login',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forget-password/forget-password.component').then(
        (m) => m.ForgetPasswordComponent,
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(
        (m) => m.SignupComponent,
      ),
    title: 'Signup',
  },

  {
    path: '',
    // Shell: renders header + sidebar + <router-outlet>
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        title: 'Dashboard | Egy E-Passport',
      },
      {
        path: 'wallet',
        loadComponent: () =>
          import('./features/wallet/wallet.component').then(
            (m) => m.WalletComponent,
          ),
        title: 'Digital ID | Egy E-Passport',
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/applications/applications.component').then(
            (m) => m.ApplicationsComponent,
          ),
        title: 'My Applications | Egy E-Passport',
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/documents/documents.component').then(
            (m) => m.DocumentsComponent,
          ),
        title: 'Documents | Egy E-Passport',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
        title: 'Notifications | Egy E-Passport',
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
        title: 'Settings | Egy E-Passport',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        title: 'Profile | Egy E-Passport',
      },
      {
        path: 'profile/changePassword',
        loadComponent: () =>
          import('./features/profile/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
        title: 'Profile | Egy E-Passport',
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./features/profile/edit-profile/edit-profile.component').then(
            (c) => c.EditProfileComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
