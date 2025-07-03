import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'exam/:id', 
    loadComponent: () => import('./components/exam/exam.component').then(m => m.ExamComponent)
  },
  { 
    path: 'results/:id', 
    loadComponent: () => import('./components/results/results.component').then(m => m.ResultsComponent)
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
  },
  { path: '**', redirectTo: '/login' }
];
