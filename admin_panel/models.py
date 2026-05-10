from django.db import models

# Create your models here.
from django.db import models


class Hostel(models.Model):
    name = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Classroom(models.Model):
    name = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Result(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)

    score = models.FloatField(null=True, blank=True)
    grade = models.CharField(max_length=10, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)

    created_by = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)