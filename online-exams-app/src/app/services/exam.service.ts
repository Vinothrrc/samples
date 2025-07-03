import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalPoints: number;
  questions: Question[];
  isActive: boolean;
  createdDate: Date;
}

export interface ExamResult {
  id: number;
  examId: number;
  userId: number;
  answers: { [questionId: number]: number };
  score: number;
  totalPoints: number;
  percentage: number;
  completedDate: Date;
  timeTaken: number; // in minutes
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private examsSubject = new BehaviorSubject<Exam[]>([]);
  public exams$ = this.examsSubject.asObservable();

  private resultsSubject = new BehaviorSubject<ExamResult[]>([]);
  public results$ = this.resultsSubject.asObservable();

  // Mock exam data
  private mockExams: Exam[] = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics including variables, functions, and data types.',
      duration: 30,
      totalQuestions: 5,
      totalPoints: 50,
      isActive: true,
      createdDate: new Date('2024-01-15'),
      questions: [
        {
          id: 1,
          text: 'What is the correct way to declare a variable in JavaScript?',
          options: ['var myVar = 5;', 'variable myVar = 5;', 'v myVar = 5;', 'declare myVar = 5;'],
          correctAnswer: 0,
          points: 10
        },
        {
          id: 2,
          text: 'Which of the following is NOT a JavaScript data type?',
          options: ['String', 'Number', 'Boolean', 'Float'],
          correctAnswer: 3,
          points: 10
        },
        {
          id: 3,
          text: 'What does the "typeof" operator return for an array?',
          options: ['array', 'object', 'list', 'undefined'],
          correctAnswer: 1,
          points: 10
        },
        {
          id: 4,
          text: 'How do you create a function in JavaScript?',
          options: ['function = myFunction() {}', 'function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}'],
          correctAnswer: 1,
          points: 10
        },
        {
          id: 5,
          text: 'What is the result of 3 + "3" in JavaScript?',
          options: ['6', '33', 'Error', 'NaN'],
          correctAnswer: 1,
          points: 10
        }
      ]
    },
    {
      id: 2,
      title: 'Angular Framework',
      description: 'Advanced concepts in Angular including components, services, and routing.',
      duration: 45,
      totalQuestions: 4,
      totalPoints: 40,
      isActive: true,
      createdDate: new Date('2024-01-20'),
      questions: [
        {
          id: 6,
          text: 'What is a component in Angular?',
          options: ['A service', 'A directive with a template', 'A module', 'A pipe'],
          correctAnswer: 1,
          points: 10
        },
        {
          id: 7,
          text: 'Which decorator is used to define a service in Angular?',
          options: ['@Component', '@Service', '@Injectable', '@Module'],
          correctAnswer: 2,
          points: 10
        },
        {
          id: 8,
          text: 'What is the purpose of Angular Router?',
          options: ['HTTP requests', 'Navigation between views', 'Data binding', 'Form validation'],
          correctAnswer: 1,
          points: 10
        },
        {
          id: 9,
          text: 'Which lifecycle hook is called after component initialization?',
          options: ['ngOnInit', 'ngAfterInit', 'ngOnStart', 'ngCreate'],
          correctAnswer: 0,
          points: 10
        }
      ]
    },
    {
      id: 3,
      title: 'HTML & CSS Basics',
      description: 'Fundamental concepts of web development with HTML and CSS.',
      duration: 25,
      totalQuestions: 3,
      totalPoints: 30,
      isActive: false,
      createdDate: new Date('2024-01-10'),
      questions: [
        {
          id: 10,
          text: 'Which HTML tag is used for the largest heading?',
          options: ['<h6>', '<h1>', '<heading>', '<header>'],
          correctAnswer: 1,
          points: 10
        },
        {
          id: 11,
          text: 'What does CSS stand for?',
          options: ['Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'],
          correctAnswer: 2,
          points: 10
        },
        {
          id: 12,
          text: 'Which CSS property is used to change the text color?',
          options: ['color', 'text-color', 'font-color', 'text-style'],
          correctAnswer: 0,
          points: 10
        }
      ]
    }
  ];

  private mockResults: ExamResult[] = [];

  constructor() {
    this.examsSubject.next(this.mockExams);
  }

  getExams(): Observable<Exam[]> {
    return of(this.mockExams).pipe(delay(500));
  }

  getExamById(id: number): Observable<Exam | undefined> {
    const exam = this.mockExams.find(e => e.id === id);
    return of(exam).pipe(delay(300));
  }

  getActiveExams(): Observable<Exam[]> {
    const activeExams = this.mockExams.filter(e => e.isActive);
    return of(activeExams).pipe(delay(500));
  }

  submitExam(examId: number, userId: number, answers: { [questionId: number]: number }, timeTaken: number): Observable<ExamResult> {
    const exam = this.mockExams.find(e => e.id === examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    let score = 0;
    exam.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    });

    const result: ExamResult = {
      id: Date.now(),
      examId,
      userId,
      answers,
      score,
      totalPoints: exam.totalPoints,
      percentage: Math.round((score / exam.totalPoints) * 100),
      completedDate: new Date(),
      timeTaken
    };

    this.mockResults.push(result);
    this.resultsSubject.next([...this.mockResults]);

    return of(result).pipe(delay(1000));
  }

  getUserResults(userId: number): Observable<ExamResult[]> {
    const userResults = this.mockResults.filter(r => r.userId === userId);
    return of(userResults).pipe(delay(300));
  }

  getExamResult(resultId: number): Observable<ExamResult | undefined> {
    const result = this.mockResults.find(r => r.id === resultId);
    return of(result).pipe(delay(300));
  }

  getAllResults(): Observable<ExamResult[]> {
    return of(this.mockResults).pipe(delay(500));
  }

  createExam(exam: Omit<Exam, 'id' | 'createdDate'>): Observable<Exam> {
    const newExam: Exam = {
      ...exam,
      id: Date.now(),
      createdDate: new Date()
    };
    
    this.mockExams.push(newExam);
    this.examsSubject.next([...this.mockExams]);
    
    return of(newExam).pipe(delay(1000));
  }

  updateExam(id: number, examData: Partial<Exam>): Observable<Exam | null> {
    const index = this.mockExams.findIndex(e => e.id === id);
    if (index === -1) {
      return of(null);
    }

    this.mockExams[index] = { ...this.mockExams[index], ...examData };
    this.examsSubject.next([...this.mockExams]);

    return of(this.mockExams[index]).pipe(delay(1000));
  }

  deleteExam(id: number): Observable<boolean> {
    const index = this.mockExams.findIndex(e => e.id === id);
    if (index === -1) {
      return of(false);
    }

    this.mockExams.splice(index, 1);
    this.examsSubject.next([...this.mockExams]);

    return of(true).pipe(delay(500));
  }
}