import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ExamService, Exam, ExamResult } from '../../services/exam.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h2 class="mb-2">
                    <i class="fas fa-user-circle me-2"></i>
                    Welcome back, {{ currentUser?.name }}!
                  </h2>
                  <p class="mb-0 opacity-75">
                    Ready to take some exams? Choose from the available exams below.
                  </p>
                </div>
                <div class="col-md-4 text-md-end">
                  <div class="stats">
                    <div class="stat-item">
                      <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                      <h4>{{ availableExams.length }}</h4>
                      <small>Available Exams</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats for Students -->
      <div class="row mb-4" *ngIf="authService.isStudent()">
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-chart-line fa-2x text-success mb-2"></i>
              <h5 class="card-title">{{ completedExams }}</h5>
              <p class="card-text text-muted">Completed</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-percentage fa-2x text-info mb-2"></i>
              <h5 class="card-title">{{ averageScore }}%</h5>
              <p class="card-text text-muted">Average Score</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-trophy fa-2x text-warning mb-2"></i>
              <h5 class="card-title">{{ highestScore }}%</h5>
              <p class="card-text text-muted">Best Score</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-clock fa-2x text-danger mb-2"></i>
              <h5 class="card-title">{{ availableExams.length }}</h5>
              <p class="card-text text-muted">Available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Exams Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>
              <i class="fas fa-list-alt me-2"></i>
              Available Exams
            </h4>
            <button 
              *ngIf="authService.isAdmin()" 
              class="btn btn-success"
              routerLink="/admin">
              <i class="fas fa-plus me-1"></i>
              Manage Exams
            </button>
          </div>

          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading exams...</p>
          </div>

          <div *ngIf="!loading && availableExams.length === 0" class="text-center py-5">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No exams available</h5>
            <p class="text-muted">Check back later for new exams.</p>
          </div>

          <div class="row" *ngIf="!loading && availableExams.length > 0">
            <div class="col-lg-4 col-md-6 mb-4" *ngFor="let exam of availableExams">
              <div class="card h-100 shadow-sm border-0 exam-card">
                <div class="card-header bg-light border-0">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="card-title mb-0 text-primary">{{ exam.title }}</h6>
                    <span class="badge bg-success">Active</span>
                  </div>
                </div>
                <div class="card-body">
                  <p class="card-text text-muted">{{ exam.description }}</p>
                  
                  <div class="exam-info">
                    <div class="info-item">
                      <i class="fas fa-clock text-warning me-1"></i>
                      <small>Duration: {{ exam.duration }} minutes</small>
                    </div>
                    <div class="info-item">
                      <i class="fas fa-question-circle text-info me-1"></i>
                      <small>Questions: {{ exam.totalQuestions }}</small>
                    </div>
                    <div class="info-item">
                      <i class="fas fa-star text-success me-1"></i>
                      <small>Points: {{ exam.totalPoints }}</small>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-transparent border-0 pt-0">
                  <button 
                    class="btn btn-primary w-100"
                    [routerLink]="['/exam', exam.id]"
                    [disabled]="isExamCompleted(exam.id)">
                    <i class="fas fa-play me-1" *ngIf="!isExamCompleted(exam.id)"></i>
                    <i class="fas fa-check me-1" *ngIf="isExamCompleted(exam.id)"></i>
                    {{ isExamCompleted(exam.id) ? 'Completed' : 'Start Exam' }}
                  </button>
                  <button 
                    *ngIf="isExamCompleted(exam.id)"
                    class="btn btn-outline-info w-100 mt-2"
                    (click)="viewResult(exam.id)">
                    <i class="fas fa-chart-bar me-1"></i>
                    View Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Results Section for Students -->
      <div class="row" *ngIf="authService.isStudent() && userResults.length > 0">
        <div class="col-12">
          <h4 class="mb-3">
            <i class="fas fa-history me-2"></i>
            Recent Results
          </h4>
          
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let result of userResults.slice(0, 5)">
                  <td>
                    <strong>{{ getExamTitle(result.examId) }}</strong>
                  </td>
                  <td>{{ result.score }}/{{ result.totalPoints }}</td>
                  <td>
                    <span 
                      class="badge"
                      [class.bg-success]="result.percentage >= 70"
                      [class.bg-warning]="result.percentage >= 50 && result.percentage < 70"
                      [class.bg-danger]="result.percentage < 50">
                      {{ result.percentage }}%
                    </span>
                  </td>
                  <td>{{ result.completedDate | date:'short' }}</td>
                  <td>
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      [routerLink]="['/results', result.id]">
                      <i class="fas fa-eye me-1"></i>
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .exam-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .exam-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
    }
    
    .stats .stat-item {
      text-align: center;
    }
    
    .exam-info .info-item {
      margin-bottom: 8px;
      display: block;
    }
    
    .badge {
      font-size: 0.75rem;
    }
    
    .table th {
      border-top: none;
      font-weight: 600;
    }
    
    .card {
      border-radius: 12px;
    }
    
    .btn {
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-1px);
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  availableExams: Exam[] = [];
  userResults: ExamResult[] = [];
  loading = true;
  
  // Stats
  completedExams = 0;
  averageScore = 0;
  highestScore = 0;

  constructor(
    public authService: AuthService,
    private examService: ExamService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    this.examService.getActiveExams().subscribe({
      next: (exams) => {
        this.availableExams = exams;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.loading = false;
      }
    });

    if (this.authService.isStudent() && this.currentUser) {
      this.examService.getUserResults(this.currentUser.id).subscribe({
        next: (results) => {
          this.userResults = results.sort((a, b) => 
            new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
          );
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error loading user results:', error);
        }
      });
    }
  }

  calculateStats() {
    this.completedExams = this.userResults.length;
    
    if (this.userResults.length > 0) {
      const totalPercentage = this.userResults.reduce((sum, result) => sum + result.percentage, 0);
      this.averageScore = Math.round(totalPercentage / this.userResults.length);
      this.highestScore = Math.max(...this.userResults.map(result => result.percentage));
    }
  }

  isExamCompleted(examId: number): boolean {
    return this.userResults.some(result => result.examId === examId);
  }

  getExamTitle(examId: number): string {
    const exam = this.availableExams.find(e => e.id === examId);
    return exam ? exam.title : 'Unknown Exam';
  }

  viewResult(examId: number) {
    const result = this.userResults.find(r => r.examId === examId);
    if (result) {
      this.router.navigate(['/results', result.id]);
    }
  }
}