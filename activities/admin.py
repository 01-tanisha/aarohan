from django.contrib import admin

from .models import Activity, Announcement, Category, Feedback, Schedule

# Register your models here.
admin.site.register(Category)
admin.site.register(Activity)

admin.site.register(Schedule)
admin.site.register(Announcement)
admin.site.register(Feedback)