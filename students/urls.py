from django.urls import path

from .views import (
    feedback_status,
    pick_activity,
    student_announcements,
    student_attendance_summary,
    student_leaderboard,
    student_profile_detail,
    student_profile_summary,
    student_result_detail,
    submit_feedback,
    unenroll_activity,
)

urlpatterns = [
    path('attendance/', student_attendance_summary),
    path('profile-summary/', student_profile_summary),
    path('profile/', student_profile_detail),
    path('result/', student_result_detail),
    path('leaderboard/', student_leaderboard),
    path('announcements/', student_announcements),
    path('pick-activity/', pick_activity),
    path('unenroll-activity/', unenroll_activity),
    path('feedback/submit/', submit_feedback),
    path('feedback/status/', feedback_status),
]