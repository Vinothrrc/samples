from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Subject, Question, Option, Exam, ExamQuestion, ExamResult, StudentAnswer, UserProfile

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    max_num = 4

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    list_filter = ['created_at']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'subject', 'question_type', 'marks', 'difficulty', 'created_by', 'created_at']
    list_filter = ['subject', 'question_type', 'difficulty', 'created_at']
    search_fields = ['question_text', 'subject__name']
    inlines = [OptionInline]
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'is_correct']
    list_filter = ['is_correct', 'question__subject']
    search_fields = ['option_text', 'question__question_text']

class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1
    ordering = ['order']

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'duration', 'total_marks', 'passing_marks', 'start_time', 'end_time', 'is_active']
    list_filter = ['subject', 'is_active', 'start_time', 'created_at']
    search_fields = ['title', 'description', 'subject__name']
    inlines = [ExamQuestionInline]
    date_hierarchy = 'start_time'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'exam', 'score', 'total_marks', 'percentage', 'status', 'start_time', 'end_time']
    list_filter = ['status', 'exam__subject', 'start_time']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'exam__title']
    readonly_fields = ['start_time', 'end_time', 'time_taken']
    date_hierarchy = 'start_time'
    
    def has_add_permission(self, request):
        return False

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ['exam_result', 'question', 'selected_option', 'is_correct', 'marks_obtained']
    list_filter = ['is_correct', 'exam_result__exam__subject']
    search_fields = ['exam_result__student__username', 'question__question_text']
    
    def has_add_permission(self, request):
        return False

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_user_type', 'is_staff')
    
    def get_user_type(self, obj):
        try:
            return obj.userprofile.user_type
        except UserProfile.DoesNotExist:
            return 'No Profile'
    get_user_type.short_description = 'User Type'

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone']
    list_filter = ['user_type']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'phone']
