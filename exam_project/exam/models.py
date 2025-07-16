from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Question(models.Model):
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice'),
        ('TF', 'True/False'),
        ('SA', 'Short Answer'),
    ]
    
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPES, default='MCQ')
    marks = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    difficulty = models.CharField(max_length=10, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.subject.name} - {self.question_text[:50]}..."
    
    class Meta:
        ordering = ['-created_at']

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.question.question_text[:30]}... - {self.option_text}"
    
    class Meta:
        ordering = ['id']

class Exam(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    questions = models.ManyToManyField(Question, through='ExamQuestion')
    duration = models.IntegerField(help_text="Duration in minutes")
    total_marks = models.IntegerField(default=0)
    passing_marks = models.IntegerField(default=0)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title
    
    def is_available(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time and self.is_active
    
    class Meta:
        ordering = ['-created_at']

class ExamQuestion(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        unique_together = ['exam', 'question']

class ExamResult(models.Model):
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(default=0)
    total_marks = models.IntegerField(default=0)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='started')
    time_taken = models.DurationField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.student.username} - {self.exam.title} - {self.score}/{self.total_marks}"
    
    def calculate_percentage(self):
        if self.total_marks > 0:
            return (self.score / self.total_marks) * 100
        return 0
    
    def is_passed(self):
        return self.score >= self.exam.passing_marks
    
    class Meta:
        ordering = ['-start_time']
        unique_together = ['exam', 'student']

class StudentAnswer(models.Model):
    exam_result = models.ForeignKey(ExamResult, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True, blank=True)
    answer_text = models.TextField(blank=True)  # For short answer questions
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.exam_result.student.username} - {self.question.question_text[:30]}..."
    
    class Meta:
        unique_together = ['exam_result', 'question']

class UserProfile(models.Model):
    USER_TYPES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='student')
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.user_type}"
