from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import timedelta

from .models import Subject, Question, Option, Exam, ExamResult, StudentAnswer, UserProfile
from .forms import UserRegistrationForm, ExamForm, QuestionForm

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'exam/home.html')

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
    else:
        form = UserRegistrationForm()
    return render(request, 'exam/register.html', {'form': form})

@login_required
def dashboard(request):
    user_profile = UserProfile.objects.get_or_create(user=request.user)[0]
    
    if user_profile.user_type == 'student':
        # Student dashboard
        available_exams = Exam.objects.filter(
            start_time__lte=timezone.now(),
            end_time__gte=timezone.now(),
            is_active=True
        ).exclude(
            examresult__student=request.user
        )
        
        completed_exams = ExamResult.objects.filter(
            student=request.user,
            status='completed'
        ).order_by('-start_time')[:5]
        
        context = {
            'available_exams': available_exams,
            'completed_exams': completed_exams,
            'user_profile': user_profile
        }
        return render(request, 'exam/student_dashboard.html', context)
    
    elif user_profile.user_type == 'teacher':
        # Teacher dashboard
        my_exams = Exam.objects.filter(created_by=request.user).order_by('-created_at')[:5]
        total_questions = Question.objects.filter(created_by=request.user).count()
        
        context = {
            'my_exams': my_exams,
            'total_questions': total_questions,
            'user_profile': user_profile
        }
        return render(request, 'exam/teacher_dashboard.html', context)
    
    else:
        # Admin dashboard
        total_users = UserProfile.objects.count()
        total_exams = Exam.objects.count()
        total_subjects = Subject.objects.count()
        recent_results = ExamResult.objects.order_by('-start_time')[:10]
        
        context = {
            'total_users': total_users,
            'total_exams': total_exams,
            'total_subjects': total_subjects,
            'recent_results': recent_results,
            'user_profile': user_profile
        }
        return render(request, 'exam/admin_dashboard.html', context)

@login_required
def exam_list(request):
    exams = Exam.objects.filter(is_active=True).order_by('-created_at')
    paginator = Paginator(exams, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'exam/exam_list.html', {'page_obj': page_obj})

@login_required
def exam_detail(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id, is_active=True)
    
    # Check if user has already taken this exam
    existing_result = ExamResult.objects.filter(exam=exam, student=request.user).first()
    
    context = {
        'exam': exam,
        'existing_result': existing_result,
        'can_take_exam': exam.is_available() and not existing_result
    }
    
    return render(request, 'exam/exam_detail.html', context)

@login_required
def take_exam(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id, is_active=True)
    
    # Check if exam is available
    if not exam.is_available():
        messages.error(request, 'This exam is not available at the moment.')
        return redirect('exam_detail', exam_id=exam_id)
    
    # Check if user has already taken this exam
    existing_result = ExamResult.objects.filter(exam=exam, student=request.user).first()
    if existing_result:
        messages.error(request, 'You have already taken this exam.')
        return redirect('exam_detail', exam_id=exam_id)
    
    # Create exam result
    exam_result = ExamResult.objects.create(
        exam=exam,
        student=request.user,
        total_marks=exam.total_marks,
        status='started'
    )
    
    # Get questions for this exam
    exam_questions = exam.examquestion_set.all().order_by('order')
    questions = [eq.question for eq in exam_questions]
    
    context = {
        'exam': exam,
        'questions': questions,
        'exam_result': exam_result,
    }
    
    return render(request, 'exam/take_exam.html', context)

@login_required
@require_http_methods(["POST"])
def submit_exam(request, exam_id):
    exam = get_object_or_404(Exam, id=exam_id)
    exam_result = get_object_or_404(ExamResult, exam=exam, student=request.user, status='started')
    
    # Calculate score
    total_score = 0
    exam_questions = exam.examquestion_set.all().order_by('order')
    
    for eq in exam_questions:
        question = eq.question
        answer_key = f'question_{question.id}'
        
        if answer_key in request.POST:
            selected_option_id = request.POST[answer_key]
            
            if selected_option_id:
                selected_option = get_object_or_404(Option, id=selected_option_id)
                is_correct = selected_option.is_correct
                marks_obtained = question.marks if is_correct else 0
                
                StudentAnswer.objects.create(
                    exam_result=exam_result,
                    question=question,
                    selected_option=selected_option,
                    is_correct=is_correct,
                    marks_obtained=marks_obtained
                )
                
                total_score += marks_obtained
    
    # Update exam result
    exam_result.end_time = timezone.now()
    exam_result.score = total_score
    exam_result.percentage = (total_score / exam.total_marks) * 100 if exam.total_marks > 0 else 0
    exam_result.status = 'completed'
    exam_result.time_taken = exam_result.end_time - exam_result.start_time
    exam_result.save()
    
    return redirect('exam_result', result_id=exam_result.id)

@login_required
def exam_result(request, result_id):
    exam_result = get_object_or_404(ExamResult, id=result_id, student=request.user)
    student_answers = StudentAnswer.objects.filter(exam_result=exam_result).order_by('question__id')
    
    context = {
        'exam_result': exam_result,
        'student_answers': student_answers,
    }
    
    return render(request, 'exam/exam_result.html', context)

@login_required
def my_results(request):
    results = ExamResult.objects.filter(student=request.user).order_by('-start_time')
    paginator = Paginator(results, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'exam/my_results.html', {'page_obj': page_obj})

@login_required
def create_exam(request):
    # Check if user is teacher or admin
    user_profile = UserProfile.objects.get_or_create(user=request.user)[0]
    if user_profile.user_type not in ['teacher', 'admin']:
        messages.error(request, 'You do not have permission to create exams.')
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = ExamForm(request.POST)
        if form.is_valid():
            exam = form.save(commit=False)
            exam.created_by = request.user
            exam.save()
            
            # Add questions to exam
            selected_questions = request.POST.getlist('questions')
            for i, question_id in enumerate(selected_questions):
                question = get_object_or_404(Question, id=question_id)
                exam.examquestion_set.create(question=question, order=i+1)
            
            # Update total marks
            total_marks = sum(q.marks for q in exam.questions.all())
            exam.total_marks = total_marks
            exam.save()
            
            messages.success(request, 'Exam created successfully!')
            return redirect('dashboard')
    else:
        form = ExamForm()
    
    questions = Question.objects.all().order_by('subject', '-created_at')
    
    return render(request, 'exam/create_exam.html', {
        'form': form,
        'questions': questions
    })

@login_required
def profile(request):
    user_profile = UserProfile.objects.get_or_create(user=request.user)[0]
    
    if request.method == 'POST':
        # Update profile logic here
        user_profile.phone = request.POST.get('phone', '')
        user_profile.address = request.POST.get('address', '')
        user_profile.save()
        
        request.user.first_name = request.POST.get('first_name', '')
        request.user.last_name = request.POST.get('last_name', '')
        request.user.email = request.POST.get('email', '')
        request.user.save()
        
        messages.success(request, 'Profile updated successfully!')
        return redirect('profile')
    
    return render(request, 'exam/profile.html', {'user_profile': user_profile})

@login_required
def subjects(request):
    subjects = Subject.objects.all().order_by('name')
    return render(request, 'exam/subjects.html', {'subjects': subjects})

@login_required
def subject_detail(request, subject_id):
    subject = get_object_or_404(Subject, id=subject_id)
    questions = Question.objects.filter(subject=subject).order_by('-created_at')
    exams = Exam.objects.filter(subject=subject, is_active=True).order_by('-created_at')
    
    context = {
        'subject': subject,
        'questions': questions,
        'exams': exams,
    }
    
    return render(request, 'exam/subject_detail.html', context)
