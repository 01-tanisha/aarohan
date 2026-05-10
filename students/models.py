from django.db import models
from django.contrib.auth.models import User


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    smart_card_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    roll_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=10, blank=True, null=True)
    semester = models.IntegerField()
    dob = models.DateField()
    father_name = models.CharField(max_length=50)
    mother_name = models.CharField(max_length=50)
    photo = models.ImageField(upload_to='images')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, blank=True)
    hostel = models.ForeignKey(
        'admin_panel.Hostel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    classroom = models.ForeignKey(
        'admin_panel.Classroom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    activity = models.ForeignKey(
        'activities.Activity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name or ''}".strip()


class Attendance(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    date = models.DateField()

    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    created_by = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)


class AttendanceCount(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    count = models.IntegerField()

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)


class StudentActivity(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    activity = models.ForeignKey('activities.Activity', on_delete=models.CASCADE)
    picked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="pending")

    def __str__(self):
        return f"{self.student.user.username} - {self.activity.name}"