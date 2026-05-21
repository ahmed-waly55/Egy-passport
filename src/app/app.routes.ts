import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), title: 'Login'},
  {path: "forgot-password", loadComponent: () => import('./features/auth/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent)},
  {path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent), title: 'Signup'},
  {path:"**", redirectTo: 'login', pathMatch: 'full'},
];
