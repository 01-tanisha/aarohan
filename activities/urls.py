from django.urls import path
from .views import (
    activity_list,
    category_list,
    create_activity,
    update_activity,
    delete_activity
)

urlpatterns = [
    path('activities/', activity_list),                 # GET all activities
    path('activities/categories/', category_list),

    path('activities/create/', create_activity),
    path('activities/update/<int:id>/', update_activity),
    path('activities/delete/<int:id>/', delete_activity),
]