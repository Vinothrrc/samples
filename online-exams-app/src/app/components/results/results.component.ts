import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamService, Exam, ExamResult, Question } from '../../services/exam.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4" *ngIf="result && exam">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm" [ngClass]="getScoreCardClass()">
            <div class="card-body text-white">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h2 class="mb-2">
                    <i class="fas fa-chart-bar me-2"></i>
                    Exam Results
                  </h2>
                  <h4 class="mb-1">{{ exam.title }}</h4>
                  <p class="mb-0 opacity-75">{{ exam.description }}</p>
                </div>
                <div class="col-md-4 text-md-end">
                  <div class="score-display">
                    <div class="score-circle mx-auto mb-2" [ngClass]="getScoreCircleClass()">
                      <span class="score-percentage">{{ result.percentage }}%</span>
                    </div>
                    <h5 class="mb-0">{{ result.score }}/{{ result.totalPoints }} Points</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row mb-4">
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
              <h5 class="card-title">{{ correctAnswers }}</h5>
              <p class="card-text text-muted">Correct</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-times-circle fa-2x text-danger mb-2"></i>
              <h5 class="card-title">{{ incorrectAnswers }}</h5>
              <p class="card-text text-muted">Incorrect</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-clock fa-2x text-info mb-2"></i>
              <h5 class="card-title">{{ result.timeTaken }} min</h5>
              <p class="card-text text-muted">Time Used</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-calendar fa-2x text-warning mb-2"></i>
              <h5 class="card-title">{{ result.completedDate | date:'short' }}</h5>
              <p class="card-text text-muted">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0">
                <i class="fas fa-chart-line me-2"></i>
                Performance Analysis
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Score Breakdown</h6>
                  <div class="progress mb-3" style="height: 25px;">
                    <div 
                      class="progress-bar bg-success" 
                      role="progressbar" 
                      [style.width.%]="result.percentage"
                      [attr.aria-valuenow]="result.percentage" 
                      aria-valuemin="0" 
                      aria-valuemax="100">
                      {{ result.percentage }}%
                    </div>
                  </div>
                  <div class="performance-text">
                    <p class="mb-1">
                      <strong>Grade:</strong> 
                      <span [ngClass]="getGradeClass()">{{ getGrade() }}</span>
                    </p>
                    <p class="mb-0">
                      <strong>Status:</strong> 
                      <span [ngClass]="getStatusClass()">{{ getStatus() }}</span>
                    </p>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6>Time Analysis</h6>
                  <div class="time-stats">
                    <div class="d-flex justify-content-between mb-2">
                      <span>Time Allowed:</span>
                      <strong>{{ exam.duration }} minutes</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Time Used:</span>
                      <strong>{{ result.timeTaken }} minutes</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Time Saved:</span>
                      <strong>{{ exam.duration - result.timeTaken }} minutes</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>Avg. per Question:</span>
                      <strong>{{ getAverageTimePerQuestion() }} min</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Review -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0">
                <i class="fas fa-search me-2"></i>
                Question Review
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="accordion" id="questionsAccordion">
                <div 
                  class="accordion-item border-0" 
                  *ngFor="let question of exam.questions; let i = index">
                  <h2 class="accordion-header" [id]="'heading' + i">
                    <button 
                      class="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      [attr.data-bs-target]="'#collapse' + i"
                      [attr.aria-expanded]="false" 
                      [attr.aria-controls]="'collapse' + i">
                      <div class="w-100 d-flex justify-content-between align-items-center me-3">
                        <span>
                          <strong>Question {{ i + 1 }}:</strong> 
                          {{ question.text.substring(0, 60) }}{{ question.text.length > 60 ? '...' : '' }}
                        </span>
                        <div class="question-status">
                          <span class="badge me-2" [ngClass]="getQuestionBadgeClass(question.id)">
                            {{ isCorrect(question.id) ? 'Correct' : 'Incorrect' }}
                          </span>
                          <span class="badge bg-info">{{ question.points }} pts</span>
                        </div>
                      </div>
                    </button>
                  </h2>
                  <div 
                    [id]="'collapse' + i" 
                    class="accordion-collapse collapse" 
                    [attr.aria-labelledby]="'heading' + i"
                    data-bs-parent="#questionsAccordion">
                    <div class="accordion-body">
                      <div class="question-review">
                        <h6 class="question-text mb-3">{{ question.text }}</h6>
                        
                        <div class="options-review">
                          <div 
                            class="option-item mb-2 p-3 rounded border"
                            *ngFor="let option of question.options; let optIndex = index"
                            [ngClass]="getOptionClass(question.id, optIndex, question.correctAnswer)">
                            <div class="d-flex justify-content-between align-items-center">
                              <span>
                                <strong>{{ String.fromCharCode(65 + optIndex) }}.</strong> {{ option }}
                              </span>
                              <div class="option-indicators">
                                <i 
                                  *ngIf="optIndex === question.correctAnswer"
                                  class="fas fa-check-circle text-success ms-2"
                                  title="Correct Answer"></i>
                                <i 
                                  *ngIf="result.answers[question.id] === optIndex && optIndex !== question.correctAnswer"
                                  class="fas fa-times-circle text-danger ms-2"
                                  title="Your Answer (Incorrect)"></i>
                                <i 
                                  *ngIf="result.answers[question.id] === optIndex && optIndex === question.correctAnswer"
                                  class="fas fa-check-circle text-success ms-2"
                                  title="Your Answer (Correct)"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="mt-3 pt-3 border-top">
                          <div class="row">
                            <div class="col-md-6">
                              <small class="text-muted">
                                <strong>Your Answer:</strong> 
                                {{ getSelectedOptionText(question, result.answers[question.id]) }}
                              </small>
                            </div>
                            <div class="col-md-6 text-md-end">
                              <small class="text-muted">
                                <strong>Points:</strong> 
                                {{ isCorrect(question.id) ? question.points : 0 }}/{{ question.points }}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="row">
        <div class="col-12 text-center">
          <button class="btn btn-primary me-3" routerLink="/dashboard">
            <i class="fas fa-arrow-left me-1"></i>
            Back to Dashboard
          </button>
          <button class="btn btn-outline-secondary" onclick="window.print()">
            <i class="fas fa-print me-1"></i>
            Print Results
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Screen -->
    <div *ngIf="loading && !error" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5>Loading results...</h5>
      </div>
    </div>

    <!-- Error Screen -->
    <div *ngIf="error" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h5>{{ error }}</h5>
        <button class="btn btn-primary mt-3" routerLink="/dashboard">
          <i class="fas fa-arrow-left me-1"></i>
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .score-circle.excellent {
      background-color: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.5);
    }
    
    .score-circle.good {
      background-color: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.5);
    }
    
    .score-circle.average {
      background-color: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.5);
    }
    
    .score-circle.poor {
      background-color: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.5);
    }
    
    .question-review .option-item.correct {
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    
    .question-review .option-item.incorrect {
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    
    .question-review .option-item.neutral {
      background-color: #f8f9fa;
      border-color: #dee2e6;
    }
    
    .accordion-button:not(.collapsed) {
      background-color: #f8f9fa;
      color: #0c63e4;
    }
    
    .min-vh-100 {
      min-height: 100vh;
    }
    
    @media print {
      .btn {
        display: none;
      }
    }
  `]
})
export class ResultsComponent implements OnInit {
  result: ExamResult | null = null;
  exam: Exam | null = null;
  loading = true;
  error = '';

  correctAnswers = 0;
  incorrectAnswers = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private examService: ExamService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const resultId = this.route.snapshot.params['id'];
    this.loadResult(+resultId);
  }

  loadResult(resultId: number) {
    this.examService.getExamResult(resultId).subscribe({
      next: (result) => {
        if (result) {
          this.result = result;
          this.loadExam(result.examId);
        } else {
          this.error = 'Result not found';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load result';
        this.loading = false;
        console.error('Error loading result:', error);
      }
    });
  }

  loadExam(examId: number) {
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        if (exam) {
          this.exam = exam;
          this.calculateStats();
          this.loading = false;
        } else {
          this.error = 'Exam not found';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load exam details';
        this.loading = false;
        console.error('Error loading exam:', error);
      }
    });
  }

  calculateStats() {
    if (!this.result || !this.exam) return;

    this.correctAnswers = 0;
    this.incorrectAnswers = 0;

    this.exam.questions.forEach(question => {
      if (this.result!.answers[question.id] === question.correctAnswer) {
        this.correctAnswers++;
      } else {
        this.incorrectAnswers++;
      }
    });
  }

  getScoreCardClass(): string {
    if (!this.result) return 'bg-secondary';
    
    if (this.result.percentage >= 90) return 'bg-success';
    if (this.result.percentage >= 70) return 'bg-info';
    if (this.result.percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  getScoreCircleClass(): string {
    if (!this.result) return 'poor';
    
    if (this.result.percentage >= 90) return 'excellent';
    if (this.result.percentage >= 70) return 'good';
    if (this.result.percentage >= 50) return 'average';
    return 'poor';
  }

  getGrade(): string {
    if (!this.result) return 'F';
    
    if (this.result.percentage >= 90) return 'A';
    if (this.result.percentage >= 80) return 'B';
    if (this.result.percentage >= 70) return 'C';
    if (this.result.percentage >= 60) return 'D';
    return 'F';
  }

  getGradeClass(): string {
    const grade = this.getGrade();
    if (grade === 'A') return 'text-success';
    if (grade === 'B') return 'text-info';
    if (grade === 'C') return 'text-warning';
    return 'text-danger';
  }

  getStatus(): string {
    if (!this.result) return 'Failed';
    return this.result.percentage >= 70 ? 'Passed' : 'Failed';
  }

  getStatusClass(): string {
    return this.getStatus() === 'Passed' ? 'text-success' : 'text-danger';
  }

  getAverageTimePerQuestion(): string {
    if (!this.result || !this.exam) return '0';
    const avgTime = this.result.timeTaken / this.exam.questions.length;
    return avgTime.toFixed(1);
  }

  isCorrect(questionId: number): boolean {
    if (!this.result || !this.exam) return false;
    
    const question = this.exam.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    return this.result.answers[questionId] === question.correctAnswer;
  }

  getQuestionBadgeClass(questionId: number): string {
    return this.isCorrect(questionId) ? 'bg-success' : 'bg-danger';
  }

  getOptionClass(questionId: number, optionIndex: number, correctAnswer: number): string {
    if (!this.result) return 'neutral';
    
    const userAnswer = this.result.answers[questionId];
    
    if (optionIndex === correctAnswer) {
      return 'correct';
    } else if (userAnswer === optionIndex) {
      return 'incorrect';
    }
    
    return 'neutral';
  }

  getSelectedOptionText(question: Question, selectedIndex: number): string {
    if (selectedIndex === undefined || selectedIndex === null) {
      return 'Not answered';
    }
    
    const option = question.options[selectedIndex];
    return option ? `${String.fromCharCode(65 + selectedIndex)}. ${option}` : 'Invalid selection';
  }
}