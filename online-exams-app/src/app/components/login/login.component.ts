import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100">
        <div class="col-md-6 col-lg-4 mx-auto">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
                <h2 class="h3 mb-3 fw-normal">Online Exams Portal</h2>
                <p class="text-muted">Sign in to access your exams</p>
              </div>

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email address</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      placeholder="Enter your email"
                      [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                  </div>
                  <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="invalid-feedback">
                    <div *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</div>
                    <div *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input
                      [type]="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      formControlName="password"
                      placeholder="Enter your password"
                      [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      (click)="togglePassword()">
                      <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="invalid-feedback">
                    Password is required
                  </div>
                </div>

                <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-3"
                  [disabled]="loginForm.invalid || isLoading">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!isLoading" class="fas fa-sign-in-alt me-2"></i>
                  {{ isLoading ? 'Signing in...' : 'Sign In' }}
                </button>
              </form>

              <hr class="my-4">

              <div class="text-center">
                <small class="text-muted">Demo Credentials:</small><br>
                <small class="text-muted">
                  <strong>Student:</strong> student@example.com / password<br>
                  <strong>Admin:</strong> admin@example.com / password
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 {
      min-height: 100vh;
    }
    
    .card {
      border-radius: 15px;
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .btn {
      border-radius: 10px;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .input-group-text {
      background-color: #f8f9fa;
      border-right: none;
    }
    
    .form-control {
      border-left: none;
    }
    
    .form-control:focus {
      box-shadow: none;
      border-color: #0d6efd;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Invalid email or password';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'An error occurred. Please try again.';
        }
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}