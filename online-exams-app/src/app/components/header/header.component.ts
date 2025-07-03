import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand" routerLink="/dashboard">
          <i class="fas fa-graduation-cap me-2"></i>
          Online Exams
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" *ngIf="authService.isLoggedIn()">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="fas fa-tachometer-alt me-1"></i>
                Dashboard
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.isAdmin()">
              <a class="nav-link" routerLink="/admin" routerLinkActive="active">
                <i class="fas fa-cog me-1"></i>
                Admin
              </a>
            </li>
          </ul>
          
          <ul class="navbar-nav">
            <li class="nav-item dropdown" *ngIf="authService.isLoggedIn()">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>
                {{ authService.getCurrentUser()?.name }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-1"></i>
                  Logout
                </a></li>
              </ul>
            </li>
            <li class="nav-item" *ngIf="!authService.isLoggedIn()">
              <a class="nav-link" routerLink="/login">
                <i class="fas fa-sign-in-alt me-1"></i>
                Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: bold;
      font-size: 1.5rem;
    }
    
    .nav-link {
      transition: all 0.3s ease;
    }
    
    .nav-link:hover {
      transform: translateY(-1px);
    }
    
    .dropdown-item {
      transition: all 0.3s ease;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
      padding-left: 20px;
    }
  `]
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}