import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ExamService, Exam, Question } from '../../services/exam.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid" *ngIf="exam">
      <!-- Header -->
      <div class="row bg-primary text-white py-3 sticky-top shadow">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-0">
                <i class="fas fa-file-alt me-2"></i>
                {{ exam.title }}
              </h4>
              <small class="opacity-75">{{ exam.description }}</small>
            </div>
            <div class="text-end">
              <div class="timer" [class.text-danger]="timeRemaining < 300">
                <i class="fas fa-clock me-1"></i>
                <span class="fs-5 fw-bold">{{ formatTime(timeRemaining) }}</span>
              </div>
              <small class="d-block opacity-75">Time Remaining</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="row">
        <div class="col-12">
          <div class="progress" style="height: 4px;">
            <div 
              class="progress-bar bg-success" 
              role="progressbar" 
              [style.width.%]="progressPercentage">
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row mt-4">
        <!-- Questions Navigation Sidebar -->
        <div class="col-lg-3 col-md-4 mb-4">
          <div class="card sticky-top" style="top: 120px;">
            <div class="card-header bg-light">
              <h6 class="mb-0">
                <i class="fas fa-list me-1"></i>
                Questions Navigation
              </h6>
            </div>
            <div class="card-body p-2">
              <div class="row g-1">
                <div 
                  class="col-3" 
                  *ngFor="let question of exam.questions; let i = index">
                  <button 
                    class="btn btn-sm w-100 question-nav-btn"
                    [class.btn-primary]="currentQuestionIndex === i"
                    [class.btn-success]="answers[question.id] !== undefined && currentQuestionIndex !== i"
                    [class.btn-outline-secondary]="answers[question.id] === undefined && currentQuestionIndex !== i"
                    (click)="goToQuestion(i)">
                    {{ i + 1 }}
                  </button>
                </div>
              </div>
              
              <hr class="my-3">
              
              <div class="question-stats">
                <div class="d-flex justify-content-between mb-2">
                  <small class="text-muted">Answered:</small>
                  <small class="fw-bold">{{ answeredCount }}/{{ exam.questions.length }}</small>
                </div>
                <div class="d-flex justify-content-between">
                  <small class="text-muted">Remaining:</small>
                  <small class="fw-bold">{{ exam.questions.length - answeredCount }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Content -->
        <div class="col-lg-9 col-md-8">
          <div class="card shadow-sm border-0" *ngIf="currentQuestion">
            <div class="card-header bg-light border-0">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  Question {{ currentQuestionIndex + 1 }} of {{ exam.questions.length }}
                </h5>
                <span class="badge bg-info">{{ currentQuestion.points }} points</span>
              </div>
            </div>
            
            <div class="card-body p-4">
              <h6 class="question-text mb-4">{{ currentQuestion.text }}</h6>
              
              <div class="options">
                <div 
                  class="form-check mb-3" 
                  *ngFor="let option of currentQuestion.options; let i = index">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    [name]="'question_' + currentQuestion.id"
                    [id]="'option_' + currentQuestion.id + '_' + i"
                    [value]="i"
                    [(ngModel)]="answers[currentQuestion.id]"
                    (change)="onAnswerChange()">
                  <label 
                    class="form-check-label w-100" 
                    [for]="'option_' + currentQuestion.id + '_' + i">
                    <div class="option-content p-3 border rounded">
                      <strong>{{ String.fromCharCode(65 + i) }}.</strong> {{ option }}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="card-footer bg-transparent border-0">
              <div class="d-flex justify-content-between">
                <button 
                  class="btn btn-outline-secondary"
                  [disabled]="currentQuestionIndex === 0"
                  (click)="previousQuestion()">
                  <i class="fas fa-chevron-left me-1"></i>
                  Previous
                </button>
                
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-outline-primary"
                    (click)="clearAnswer()">
                    <i class="fas fa-eraser me-1"></i>
                    Clear
                  </button>
                  
                  <button 
                    *ngIf="currentQuestionIndex < exam.questions.length - 1"
                    class="btn btn-primary"
                    (click)="nextQuestion()">
                    Next
                    <i class="fas fa-chevron-right ms-1"></i>
                  </button>
                  
                  <button 
                    *ngIf="currentQuestionIndex === exam.questions.length - 1"
                    class="btn btn-success"
                    (click)="openSubmitModal()"
                    [disabled]="answeredCount === 0">
                    <i class="fas fa-check me-1"></i>
                    Finish Exam
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div 
      class="modal fade" 
      id="submitModal" 
      tabindex="-1" 
      *ngIf="showSubmitModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle text-warning me-2"></i>
              Submit Exam
            </h5>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to submit your exam?</p>
            
            <div class="alert alert-info">
              <h6>Summary:</h6>
              <ul class="mb-0">
                <li>Questions answered: {{ answeredCount }}/{{ exam?.questions.length }}</li>
                <li>Questions remaining: {{ (exam?.questions.length || 0) - answeredCount }}</li>
                <li>Time used: {{ formatTime(totalTime - timeRemaining) }}</li>
              </ul>
            </div>
            
            <div *ngIf="answeredCount < (exam?.questions.length || 0)" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-1"></i>
              You have unanswered questions. They will be marked as incorrect.
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="closeSubmitModal()">
              Continue Exam
            </button>
            <button 
              type="button" 
              class="btn btn-success"
              (click)="submitExam()"
              [disabled]="isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!isSubmitting" class="fas fa-check me-1"></i>
              {{ isSubmitting ? 'Submitting...' : 'Submit Exam' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Screen -->
    <div *ngIf="!exam && !error" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5>Loading exam...</h5>
      </div>
    </div>

    <!-- Error Screen -->
    <div *ngIf="error" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h5>{{ error }}</h5>
        <button class="btn btn-primary mt-3" (click)="goBack()">
          <i class="fas fa-arrow-left me-1"></i>
          Go Back
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sticky-top {
      z-index: 1020;
    }
    
    .timer {
      font-family: 'Courier New', monospace;
    }
    
    .question-nav-btn {
      aspect-ratio: 1;
      border-radius: 50%;
      padding: 0;
      font-size: 0.875rem;
    }
    
    .option-content {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .option-content:hover {
      background-color: #f8f9fa;
      border-color: #0d6efd !important;
    }
    
    .form-check-input:checked + .form-check-label .option-content {
      background-color: #e7f3ff;
      border-color: #0d6efd !important;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
    
    .question-text {
      font-size: 1.1rem;
      line-height: 1.6;
    }
    
    .min-vh-100 {
      min-height: 100vh;
    }
    
    .modal {
      display: block;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .progress {
      border-radius: 0;
    }
  `]
})
export class ExamComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  currentQuestionIndex = 0;
  currentQuestion: Question | null = null;
  answers: { [questionId: number]: number } = {};
  timeRemaining = 0;
  totalTime = 0;
  startTime = 0;
  
  showSubmitModal = false;
  isSubmitting = false;
  error = '';

  private timerSubscription?: Subscription;

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

    const examId = this.route.snapshot.params['id'];
    this.loadExam(+examId);
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadExam(examId: number) {
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        if (exam) {
          this.exam = exam;
          this.currentQuestion = exam.questions[0];
          this.totalTime = exam.duration * 60; // Convert minutes to seconds
          this.timeRemaining = this.totalTime;
          this.startTime = Date.now();
          this.startTimer();
        } else {
          this.error = 'Exam not found';
        }
      },
      error: (error) => {
        this.error = 'Failed to load exam';
        console.error('Error loading exam:', error);
      }
    });
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.autoSubmitExam();
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (!this.exam) return 0;
    return (this.answeredCount / this.exam.questions.length) * 100;
  }

  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  goToQuestion(index: number) {
    if (!this.exam) return;
    
    this.currentQuestionIndex = index;
    this.currentQuestion = this.exam.questions[index];
  }

  nextQuestion() {
    if (!this.exam || this.currentQuestionIndex >= this.exam.questions.length - 1) return;
    
    this.currentQuestionIndex++;
    this.currentQuestion = this.exam.questions[this.currentQuestionIndex];
  }

  previousQuestion() {
    if (this.currentQuestionIndex <= 0) return;
    
    this.currentQuestionIndex--;
    this.currentQuestion = this.exam.questions[this.currentQuestionIndex];
  }

  onAnswerChange() {
    // This method is called when an answer is selected
    // The actual answer is automatically bound via ngModel
  }

  clearAnswer() {
    if (this.currentQuestion) {
      delete this.answers[this.currentQuestion.id];
    }
  }

  openSubmitModal() {
    this.showSubmitModal = true;
  }

  closeSubmitModal() {
    this.showSubmitModal = false;
  }

  submitExam() {
    if (!this.exam || !this.authService.getCurrentUser()) return;
    
    this.isSubmitting = true;
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000 / 60); // Convert to minutes
    
    this.examService.submitExam(
      this.exam.id,
      this.authService.getCurrentUser()!.id,
      this.answers,
      timeTaken
    ).subscribe({
      next: (result) => {
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        this.router.navigate(['/results', result.id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.error = 'Failed to submit exam';
        console.error('Error submitting exam:', error);
      }
    });
  }

  autoSubmitExam() {
    if (!this.exam || !this.authService.getCurrentUser()) return;
    
    const timeTaken = this.exam.duration; // Full duration used
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) return;
    
    this.examService.submitExam(
      this.exam.id,
      currentUser.id,
      this.answers,
      timeTaken
    ).subscribe({
      next: (result) => {
        this.router.navigate(['/results', result.id]);
      },
      error: (error) => {
        this.error = 'Failed to submit exam';
        console.error('Error submitting exam:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}