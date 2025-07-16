from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Home and Authentication
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='exam/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # Exam URLs
    path('exams/', views.exam_list, name='exam_list'),
    path('exams/<int:exam_id>/', views.exam_detail, name='exam_detail'),
    path('exams/<int:exam_id>/take/', views.take_exam, name='take_exam'),
    path('exams/<int:exam_id>/submit/', views.submit_exam, name='submit_exam'),
    path('exams/create/', views.create_exam, name='create_exam'),
    
    # Results
    path('results/<int:result_id>/', views.exam_result, name='exam_result'),
    path('my-results/', views.my_results, name='my_results'),
    
    # Subjects
    path('subjects/', views.subjects, name='subjects'),
    path('subjects/<int:subject_id>/', views.subject_detail, name='subject_detail'),
    
    # Profile
    path('profile/', views.profile, name='profile'),
    
    # Password Reset
    path('password-reset/', 
         auth_views.PasswordResetView.as_view(template_name='exam/password_reset.html'),
         name='password_reset'),
    path('password-reset-done/', 
         auth_views.PasswordResetDoneView.as_view(template_name='exam/password_reset_done.html'),
         name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(template_name='exam/password_reset_confirm.html'),
         name='password_reset_confirm'),
    path('password-reset-complete/', 
         auth_views.PasswordResetCompleteView.as_view(template_name='exam/password_reset_complete.html'),
         name='password_reset_complete'),
]