# admin_panel/urls.py

from django.urls import path
from .views import (
    dashboard_data,
    hostel_list,
    classroom_list,
    all_results,
    all_feedback,
    admin_supervise_users,
    admin_supervise_update,
    admin_supervise_delete,
)

urlpatterns = [
    path('hostels/', hostel_list),
    path('classrooms/', classroom_list),
    path('results/', all_results),
    path('feedbacks/', all_feedback),
    path('admin/supervise/users/', admin_supervise_users),
    path('admin/supervise/<str:user_type>/<int:id>/update/', admin_supervise_update),
    path('admin/supervise/<str:user_type>/<int:id>/delete/', admin_supervise_delete),
    path('dashboard/', dashboard_data),
]