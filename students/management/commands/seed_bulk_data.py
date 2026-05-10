from datetime import date, timedelta
import random

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from students.models import Attendance, Student
from teachers.models import Teacher
from activities.models import Activity, Category
from admin_panel.models import Classroom, Hostel, Result


class Command(BaseCommand):
    help = "Create bulk demo data for teachers, students, attendance, and grades."

    DEMO_PASSWORD = "Passs@123"
    DEMO_PHOTO = "images/dd7e8543-3e4c-4555-ab1f-5c1c78fcc58f.jpeg"

    def add_arguments(self, parser):
        parser.add_argument("--students", type=int, default=5, help="Number of students to create")
        parser.add_argument("--teachers", type=int, default=5, help="Number of teachers to create")
        parser.add_argument(
            "--attendance-days",
            type=int,
            default=5,
            help="Attendance rows per student for latest N days",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing students, teachers, attendance, and results before seeding",
        )

    def handle(self, *args, **options):
        students_count = max(1, options["students"])
        teachers_count = max(1, options["teachers"])
        attendance_days = max(1, options["attendance_days"])
        do_reset = options["reset"]

        if do_reset:
            self.stdout.write(self.style.WARNING("Reset enabled: deleting old records..."))
            Attendance.objects.all().delete()
            Result.objects.all().delete()
            Student.objects.all().delete()
            Teacher.objects.all().delete()
            User.objects.filter(username__startswith="student").delete()
            User.objects.filter(username__startswith="teacher").delete()

        categories = self._ensure_categories()
        hostels = self._ensure_hostels()
        classrooms = self._ensure_classrooms()
        activities = self._ensure_activities(categories)

        teachers = self._create_teachers(teachers_count)
        students = self._create_students(students_count, hostels, classrooms, activities, teachers)

        self._create_attendance(students, teachers, attendance_days)
        self._create_results(students, teachers)

        self.stdout.write(self.style.SUCCESS("Bulk data seed completed successfully."))
        self.stdout.write(
            f"Teachers: {Teacher.objects.count()} | Students: {Student.objects.count()} | "
            f"Attendance: {Attendance.objects.count()} | Results: {Result.objects.count()}"
        )

    def _ensure_categories(self):
        category_names = [
            "Aesthetic Education",
            "Physical Education",
            "Practical Education",
            "Moral Education",
        ]
        categories = []
        for name in category_names:
            category, _ = Category.objects.get_or_create(name=name)
            categories.append(category)
        return categories

    def _ensure_hostels(self):
        hostel_names = ["Sharda", "Laxmi", "Saraswati", "Ganga"]
        hostels = []
        for name in hostel_names:
            hostel, _ = Hostel.objects.get_or_create(name=name)
            hostels.append(hostel)
        return hostels

    def _ensure_classrooms(self):
        classroom_names = ["BCA 1", "BCA 2", "BTech CSE", "MBA"]
        classrooms = []
        for name in classroom_names:
            classroom, _ = Classroom.objects.get_or_create(name=name)
            classrooms.append(classroom)
        return classrooms

    def _ensure_activities(self, categories):
        activity_map = {
            "Aesthetic Education": ["Folk Dance", "Creative Art", "Guitar", "Orchestra"],
            "Physical Education": ["Archery", "Yoga", "Athletics", "Basketball"],
            "Practical Education": ["Tailoring", "Craft", "Embroidery", "Batik"],
            "Moral Education": ["Prayer", "Gita Path", "Udbodhan", "Community Service"],
        }

        activities = []
        for category in categories:
            for name in activity_map.get(category.name, []):
                activity, _ = Activity.objects.get_or_create(
                    name=name,
                    defaults={
                        "description": f"{name} activity",
                        "category": category,
                        "capacity": 60,
                        "requirements": "Regular participation",
                    },
                )
                if activity.category_id != category.id:
                    activity.category = category
                    activity.save(update_fields=["category"])
                activities.append(activity)
        return activities

    def _create_teachers(self, count):
        teachers = []
        for i in range(1, count + 1):
            username = f"teacher{i:02d}"
            email = f"teacher{i:02d}@aarohan.local"

            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )
            if created:
                user.set_password(self.DEMO_PASSWORD)
                user.save()

            teacher, _ = Teacher.objects.get_or_create(
                user=user,
                defaults={
                    "first_name": f"Teacher{i}",
                    "last_name": "Aarohan",
                    "email": email,
                    "phone_number": f"98{i:08d}"[-10:],
                    "dob": date(1990, 1, 1) + timedelta(days=i),
                },
            )
            teachers.append(teacher)
        return teachers

    def _create_students(self, count, hostels, classrooms, activities, teachers):
        students = []
        for i in range(1, count + 1):
            username = f"student{i:03d}"
            email = f"student{i:03d}@aarohan.local"
            assigned_teacher = teachers[(i - 1) % len(teachers)]

            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": email},
            )
            if created:
                user.set_password(self.DEMO_PASSWORD)
                user.save()

            student, _ = Student.objects.get_or_create(
                user=user,
                defaults={
                    "first_name": f"Student{i}",
                    "last_name": "Aarohan",
                    "roll_number": f"BCA25{i:03d}",
                    "email": email,
                    "phone_number": f"97{i:08d}"[-10:],
                    "semester": (i % 8) + 1,
                    "dob": date(2004, 1, 1) + timedelta(days=i),
                    "father_name": f"Father{i}",
                    "mother_name": f"Mother{i}",
                    "photo": self.DEMO_PHOTO,
                    "teacher": assigned_teacher,
                    "hostel": random.choice(hostels),
                    "classroom": random.choice(classrooms),
                    "activity": random.choice(activities),
                },
            )

            if student.teacher_id != assigned_teacher.id:
                student.teacher = assigned_teacher
                student.save(update_fields=["teacher"])

            students.append(student)
        return students

    def _create_attendance(self, students, teachers, days):
        start_date = date.today() - timedelta(days=days)
        for student in students:
            for day_idx in range(days):
                current_date = start_date + timedelta(days=day_idx)
                Attendance.objects.get_or_create(
                    student=student,
                    date=current_date,
                    defaults={
                        "status": random.choice(["present", "present", "present", "absent"]),
                        "created_by": random.choice(teachers),
                    },
                )

    def _create_results(self, students, teachers):
        for student in students:
            Result.objects.get_or_create(
                student=student,
                defaults={
                    "score": round(random.uniform(60.0, 95.0), 2),
                    "remarks": random.choice([
                        "Good performance",
                        "Needs improvement",
                        "Very consistent",
                        "Excellent participation",
                    ]),
                    "created_by": random.choice(teachers),
                },
            )
