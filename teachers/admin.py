from django.contrib import admin

from .models import Specialization, Teacher, Announcement

# Register your models here.
admin.site.register(Teacher)
admin.site.register(Specialization)
admin.site.register(Announcement)