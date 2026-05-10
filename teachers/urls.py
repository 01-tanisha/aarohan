from django.urls import path
from . import views

urlpatterns = [
    path('', views.teacher_list),
    path('<int:id>/delete/', views.delete_teacher),
    path('profile/', views.teacher_profile_detail),
    path('teacher/students/', views.teacher_students),
    path('teacher/bulk-attendance/', views.bulk_attendance),
    path('teacher/attendance-entries/', views.get_attendance_entries),
    path('teacher/grade-entries/', views.get_grade_entries),
    path('teacher/submit-grade/', views.submit_grade),
    path('teacher/leaderboard/', views.teacher_leaderboard),
    path('announcement/create/', views.create_announcement),
    path('announcement/list/', views.list_announcements),
]