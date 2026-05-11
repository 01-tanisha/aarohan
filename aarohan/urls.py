from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from core.views import password_reset_page
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "Backend running successfully!"
    })
urlpatterns = [
    path('', home),
    path('reset-password/<str:uidb64>/<str:token>/', password_reset_page),
    path('admin/', admin.site.urls),

    # ✅ clean API
    path('api/', include('core.urls')),        # login, register etc.
    path('api/', include('students.urls')),
    path('api/', include('teachers.urls')),
    path('api/', include('activities.urls')),
    path('api/', include('admin_panel.urls')),
    path('api/teacher/', include('teachers.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)