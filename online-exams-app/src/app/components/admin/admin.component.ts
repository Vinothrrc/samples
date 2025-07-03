import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ExamService, Exam, Question, ExamResult } from '../../services/exam.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card bg-dark text-white">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h2 class="mb-2">
                    <i class="fas fa-cog me-2"></i>
                    Admin Dashboard
                  </h2>
                  <p class="mb-0 opacity-75">Manage exams, questions, and view student results</p>
                </div>
                <div class="col-md-4 text-md-end">
                  <button 
                    class="btn btn-success"
                    (click)="showCreateExamModal()">
                    <i class="fas fa-plus me-1"></i>
                    Create New Exam
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-file-alt fa-2x text-primary mb-2"></i>
              <h5 class="card-title">{{ totalExams }}</h5>
              <p class="card-text text-muted">Total Exams</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
              <h5 class="card-title">{{ activeExams }}</h5>
              <p class="card-text text-muted">Active Exams</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-users fa-2x text-info mb-2"></i>
              <h5 class="card-title">{{ totalAttempts }}</h5>
              <p class="card-text text-muted">Total Attempts</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center border-0 shadow-sm">
            <div class="card-body">
              <i class="fas fa-percentage fa-2x text-warning mb-2"></i>
              <h5 class="card-title">{{ averageScore }}%</h5>
              <p class="card-text text-muted">Average Score</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="row mb-4">
        <div class="col-12">
          <ul class="nav nav-tabs" id="adminTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link active" 
                id="exams-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#exams" 
                type="button" 
                role="tab">
                <i class="fas fa-list me-1"></i>
                Manage Exams
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="results-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#results" 
                type="button" 
                role="tab">
                <i class="fas fa-chart-bar me-1"></i>
                View Results
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content" id="adminTabsContent">
        <!-- Exams Management Tab -->
        <div class="tab-pane fade show active" id="exams" role="tabpanel">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>
                All Exams
              </h5>
            </div>
            <div class="card-body p-0">
              <div *ngIf="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading exams...</p>
              </div>

              <div class="table-responsive" *ngIf="!loading">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Questions</th>
                      <th>Duration</th>
                      <th>Points</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let exam of exams">
                      <td>
                        <strong>{{ exam.title }}</strong>
                        <br>
                        <small class="text-muted">{{ exam.description }}</small>
                      </td>
                      <td>{{ exam.totalQuestions }}</td>
                      <td>{{ exam.duration }} min</td>
                      <td>{{ exam.totalPoints }}</td>
                      <td>
                        <span 
                          class="badge"
                          [class.bg-success]="exam.isActive"
                          [class.bg-secondary]="!exam.isActive">
                          {{ exam.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>{{ exam.createdDate | date:'short' }}</td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            class="btn btn-sm btn-outline-primary"
                            (click)="editExam(exam)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            class="btn btn-sm"
                            [class.btn-outline-success]="!exam.isActive"
                            [class.btn-outline-warning]="exam.isActive"
                            (click)="toggleExamStatus(exam)">
                            <i [class]="exam.isActive ? 'fas fa-pause' : 'fas fa-play'"></i>
                          </button>
                          <button 
                            class="btn btn-sm btn-outline-danger"
                            (click)="deleteExam(exam)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Tab -->
        <div class="tab-pane fade" id="results" role="tabpanel">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light border-0">
              <h5 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>
                Student Results
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Time Taken</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let result of allResults">
                      <td>Student {{ result.userId }}</td>
                      <td>{{ getExamTitle(result.examId) }}</td>
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
                      <td>{{ result.timeTaken }} min</td>
                      <td>{{ result.completedDate | date:'short' }}</td>
                      <td>
                        <span 
                          class="badge"
                          [class.bg-success]="result.percentage >= 70"
                          [class.bg-danger]="result.percentage < 70">
                          {{ result.percentage >= 70 ? 'Passed' : 'Failed' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Exam Modal -->
    <div 
      class="modal fade" 
      id="examModal" 
      tabindex="-1" 
      *ngIf="showExamModal">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-plus me-2"></i>
              {{ isEditMode ? 'Edit Exam' : 'Create New Exam' }}
            </h5>
            <button type="button" class="btn-close" (click)="closeExamModal()"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="examForm" (ngSubmit)="saveExam()">
              <!-- Basic Information -->
              <div class="row mb-4">
                <div class="col-md-6">
                  <label for="title" class="form-label">Exam Title *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="title"
                    formControlName="title"
                    placeholder="Enter exam title">
                  <div *ngIf="examForm.get('title')?.invalid && examForm.get('title')?.touched" class="invalid-feedback d-block">
                    Title is required
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="duration" class="form-label">Duration (minutes) *</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="duration"
                    formControlName="duration"
                    placeholder="30">
                  <div *ngIf="examForm.get('duration')?.invalid && examForm.get('duration')?.touched" class="invalid-feedback d-block">
                    Duration is required and must be positive
                  </div>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-12">
                  <label for="description" class="form-label">Description *</label>
                  <textarea 
                    class="form-control" 
                    id="description"
                    formControlName="description"
                    rows="3"
                    placeholder="Enter exam description"></textarea>
                  <div *ngIf="examForm.get('description')?.invalid && examForm.get('description')?.touched" class="invalid-feedback d-block">
                    Description is required
                  </div>
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="isActive"
                      formControlName="isActive">
                    <label class="form-check-label" for="isActive">
                      Active (students can take this exam)
                    </label>
                  </div>
                </div>
              </div>

              <!-- Questions Section -->
              <hr>
              <h5 class="mb-3">
                <i class="fas fa-question-circle me-2"></i>
                Questions
              </h5>

              <div formArrayName="questions">
                <div 
                  *ngFor="let questionGroup of questionsArray.controls; let i = index"
                  [formGroupName]="i"
                  class="card mb-3">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">Question {{ i + 1 }}</h6>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger"
                      (click)="removeQuestion(i)"
                      [disabled]="questionsArray.length <= 1">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div class="card-body">
                    <div class="row mb-3">
                      <div class="col-md-8">
                        <label class="form-label">Question Text *</label>
                        <textarea 
                          class="form-control" 
                          formControlName="text"
                          rows="2"
                          placeholder="Enter question text"></textarea>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Points *</label>
                        <input 
                          type="number" 
                          class="form-control" 
                          formControlName="points"
                          placeholder="10"
                          min="1">
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <label class="form-label">Options *</label>
                        <div formArrayName="options">
                          <div 
                            *ngFor="let option of getOptionsArray(i).controls; let optIndex = index"
                            class="input-group mb-2">
                            <span class="input-group-text">{{ String.fromCharCode(65 + optIndex) }}</span>
                            <input 
                              type="text" 
                              class="form-control" 
                              [formControlName]="optIndex"
                              [placeholder]="'Option ' + String.fromCharCode(65 + optIndex)">
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row mt-3">
                      <div class="col-12">
                        <label class="form-label">Correct Answer *</label>
                        <select class="form-select" formControlName="correctAnswer">
                          <option value="">Select correct answer</option>
                          <option [value]="0">A</option>
                          <option [value]="1">B</option>
                          <option [value]="2">C</option>
                          <option [value]="3">D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                class="btn btn-outline-primary mb-3"
                (click)="addQuestion()">
                <i class="fas fa-plus me-1"></i>
                Add Question
              </button>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeExamModal()">Cancel</button>
            <button 
              type="button" 
              class="btn btn-success"
              (click)="saveExam()"
              [disabled]="examForm.invalid || isSaving">
              <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!isSaving" class="fas fa-save me-1"></i>
              {{ isSaving ? 'Saving...' : (isEditMode ? 'Update Exam' : 'Create Exam') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Screen -->
    <div *ngIf="loading && !authService.isAdmin()" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
        <h5>Access Denied</h5>
        <p>You don't have permission to access this page.</p>
        <button class="btn btn-primary" routerLink="/dashboard">
          <i class="fas fa-arrow-left me-1"></i>
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .min-vh-100 {
      min-height: 100vh;
    }
    
    .modal {
      display: block;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .table th {
      border-top: none;
      font-weight: 600;
    }
    
    .btn-group .btn {
      border-radius: 0.375rem;
      margin-right: 2px;
    }
    
    .card {
      border-radius: 12px;
    }
    
    .nav-tabs .nav-link {
      border-radius: 8px 8px 0 0;
    }
    
    .form-control:focus,
    .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class AdminComponent implements OnInit {
  exams: Exam[] = [];
  allResults: ExamResult[] = [];
  loading = true;
  
  // Statistics
  totalExams = 0;
  activeExams = 0;
  totalAttempts = 0;
  averageScore = 0;

  // Modal
  showExamModal = false;
  isEditMode = false;
  currentExam: Exam | null = null;
  isSaving = false;

  // Form
  examForm: FormGroup;

  constructor(
    public authService: AuthService,
    private examService: ExamService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.examForm = this.initializeForm();
  }

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadData();
  }

  initializeForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: [30, [Validators.required, Validators.min(1)]],
      isActive: [true],
      questions: this.fb.array([this.createQuestionGroup()])
    });
  }

  createQuestionGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      correctAnswer: ['', Validators.required],
      points: [10, [Validators.required, Validators.min(1)]]
    });
  }

  get questionsArray(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('options') as FormArray;
  }

  loadData() {
    this.loading = true;
    
    this.examService.getExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.loading = false;
      }
    });

    this.examService.getAllResults().subscribe({
      next: (results) => {
        this.allResults = results.sort((a, b) => 
          new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
        );
      },
      error: (error) => {
        console.error('Error loading results:', error);
      }
    });
  }

  calculateStats() {
    this.totalExams = this.exams.length;
    this.activeExams = this.exams.filter(e => e.isActive).length;
    this.totalAttempts = this.allResults.length;
    
    if (this.allResults.length > 0) {
      const totalPercentage = this.allResults.reduce((sum, result) => sum + result.percentage, 0);
      this.averageScore = Math.round(totalPercentage / this.allResults.length);
    }
  }

  showCreateExamModal() {
    this.isEditMode = false;
    this.currentExam = null;
    this.examForm = this.initializeForm();
    this.showExamModal = true;
  }

  editExam(exam: Exam) {
    this.isEditMode = true;
    this.currentExam = exam;
    this.populateForm(exam);
    this.showExamModal = true;
  }

  populateForm(exam: Exam) {
    this.examForm.patchValue({
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      isActive: exam.isActive
    });

    // Clear existing questions
    while (this.questionsArray.length !== 0) {
      this.questionsArray.removeAt(0);
    }

    // Add exam questions
    exam.questions.forEach(question => {
      const questionGroup = this.fb.group({
        text: [question.text, Validators.required],
        options: this.fb.array([
          this.fb.control(question.options[0] || '', Validators.required),
          this.fb.control(question.options[1] || '', Validators.required),
          this.fb.control(question.options[2] || '', Validators.required),
          this.fb.control(question.options[3] || '', Validators.required)
        ]),
        correctAnswer: [question.correctAnswer, Validators.required],
        points: [question.points, [Validators.required, Validators.min(1)]]
      });
      this.questionsArray.push(questionGroup);
    });
  }

  closeExamModal() {
    this.showExamModal = false;
    this.isEditMode = false;
    this.currentExam = null;
  }

  addQuestion() {
    this.questionsArray.push(this.createQuestionGroup());
  }

  removeQuestion(index: number) {
    if (this.questionsArray.length > 1) {
      this.questionsArray.removeAt(index);
    }
  }

  saveExam() {
    if (this.examForm.invalid) return;

    this.isSaving = true;
    const formValue = this.examForm.value;

    const examData = {
      title: formValue.title,
      description: formValue.description,
      duration: formValue.duration,
      isActive: formValue.isActive,
      totalQuestions: formValue.questions.length,
      totalPoints: formValue.questions.reduce((sum: number, q: any) => sum + q.points, 0),
      questions: formValue.questions.map((q: any, index: number) => ({
        id: this.isEditMode && this.currentExam ? this.currentExam.questions[index]?.id || Date.now() + index : Date.now() + index,
        text: q.text,
        options: q.options,
        correctAnswer: +q.correctAnswer,
        points: q.points
      }))
    };

    const operation = this.isEditMode && this.currentExam
      ? this.examService.updateExam(this.currentExam.id, examData)
      : this.examService.createExam(examData);

    operation.subscribe({
      next: (result) => {
        this.isSaving = false;
        this.closeExamModal();
        this.loadData();
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error saving exam:', error);
      }
    });
  }

  toggleExamStatus(exam: Exam) {
    this.examService.updateExam(exam.id, { isActive: !exam.isActive }).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating exam status:', error);
      }
    });
  }

  deleteExam(exam: Exam) {
    if (confirm(`Are you sure you want to delete "${exam.title}"? This action cannot be undone.`)) {
      this.examService.deleteExam(exam.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadData();
          }
        },
        error: (error) => {
          console.error('Error deleting exam:', error);
        }
      });
    }
  }

  getExamTitle(examId: number): string {
    const exam = this.exams.find(e => e.id === examId);
    return exam ? exam.title : 'Unknown Exam';
  }
}