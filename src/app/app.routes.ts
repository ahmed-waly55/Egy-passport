import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',                redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',           loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),                    title: 'Login' },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent) },
  { path: 'signup',          loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent),                 title: 'Signup' },

  
  {
    path: '',
    // Shell: renders header + sidebar + <router-outlet>
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'documents',
        loadComponent: () =>
          import('./pages/documents/documents.component')
            .then(m => m.DocumentsComponent),
        title: 'Documents | Egy E-Passport',
      },
            {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
        title: 'Notifications | Egy E-Passport',
      },
 
                  {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component')
            .then(m => m.SettingsComponent),
        title: 'Settings | Egy E-Passport',
      },
    ],
  },

  { path: '**',              redirectTo: 'login', pathMatch: 'full' },
];
