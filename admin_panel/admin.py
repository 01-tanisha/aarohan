from django.contrib import admin

from .models import Classroom, Hostel, Result

# Register your models here.
admin.site.register(Hostel)
admin.site.register(Classroom)


admin.site.register(Result)
