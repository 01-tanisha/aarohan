from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date
from .models import Announcement, Specialization
from students.models import Student, Attendance
from teachers.models import Teacher
from admin_panel.models import Result
from students.authentication import CsrfExemptSessionAuthentication
from django.utils.timezone import now


def _teacher_student_queryset(teacher):
    activity_ids = Specialization.objects.filter(teacher=teacher).values_list("activity_id", flat=True)
    return Student.objects.filter(activity_id__in=activity_ids).distinct()

@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_attendance(request):

    if not hasattr(request.user, "teacher"):
        return Response({"error": "Only teachers allowed"}, status=403)

    teacher = request.user.teacher
    student_id = request.data.get("student_id")
    status = request.data.get("status")

    student = Student.objects.get(id=student_id)
    today = now().date()

    # ✅ CHECK if already marked today
    already_marked = Attendance.objects.filter(
        student=student,
        date=today
    ).exists()

    if already_marked:
        return Response(
            {"error": "Attendance already marked for today"},
            status=400
        )

    # ✅ Create only if not marked
    Attendance.objects.create(
        student=student,
        created_by=teacher,
        status=status,
        date=today
    )

    return Response({"message": "Attendance marked"})
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def submit_grade(request):
    if not hasattr(request.user, "teacher"):
        return Response({"error": "Only teachers allowed"}, status=403)

    teacher = request.user.teacher
    student = Student.objects.get(id=request.data.get("student_id"))

    # Accept both "grade" and "score" for frontend compatibility
    grade_value = request.data.get("grade") or request.data.get("score")

    result, created = Result.objects.get_or_create(
        student=student,
        defaults={
            "grade": grade_value,
            "remarks": request.data.get("remarks", ""),
            "created_by": teacher,
        },
    )

    if not created:
        result.grade = grade_value
        result.remarks = request.data.get("remarks", "")
        result.save()

    return Response({"message": "Grade submitted"})


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def bulk_attendance(request):
    if not hasattr(request.user, "teacher"):
        return Response({"error": "Only teachers allowed"}, status=403)

    teacher = request.user.teacher
    records = request.data.get("records", [])
    today = now().date()

    if not records:
        return Response({"error": "No attendance records provided"}, status=400)

    teacher_student_ids = set(_teacher_student_queryset(teacher).values_list("id", flat=True))
    created_count = 0
    skipped_count = 0
    skipped_students = []

    for record in records:
        student_id = record.get("student_id")
        if student_id not in teacher_student_ids:
            skipped_count += 1
            skipped_students.append({"student_id": student_id, "reason": "Student not assigned to this teacher"})
            continue

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            skipped_count += 1
            skipped_students.append({"student_id": student_id, "reason": "Student does not exist"})
            continue

        already_marked = Attendance.objects.filter(
            student=student,
            date=today
        ).exists()

        if already_marked:
            skipped_count += 1
            skipped_students.append({"student_id": student_id, "reason": "Attendance already marked for today"})
            continue

        Attendance.objects.create(
            student=student,
            created_by=teacher,
            status=record.get("status", "absent"),
            date=today
        )
        created_count += 1

    if created_count == 0 and skipped_count > 0:
        return Response(
            {
                "error": "Attendance already marked for selected students or invalid student records",
                "skipped": skipped_students
            },
            status=400
        )

    return Response({
        "message": f"Attendance marked for {created_count} students",
        "count": created_count,
        "skipped": skipped_students,
        "skipped_count": skipped_count
    })


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_attendance_entries(request):
    if not hasattr(request.user, "teacher"):
        return Response({"error": "Only teachers allowed"}, status=403)

    teacher = request.user.teacher
    students = _teacher_student_queryset(teacher)
    student_ids = students.values_list("id", flat=True)

    # Get recent attendance entries
    attendance_entries = Attendance.objects.filter(
        student_id__in=student_ids
    ).order_by("-date")[:100]

    return Response([
        {
            "id": entry.id,
            "student_id": entry.student_id,
            "student_name": f"{entry.student.first_name} {entry.student.last_name or ''}".strip(),
            "student": f"{entry.student.first_name} {entry.student.last_name or ''}".strip(),
            "roll_number": entry.student.roll_number,
            "status": entry.status,
            "date": entry.date,
            "created_at": entry.created_at
        }
        for entry in attendance_entries
    ])


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_grade_entries(request):
    if not hasattr(request.user, "teacher"):
        return Response({"error": "Only teachers allowed"}, status=403)

    teacher = request.user.teacher
    students = _teacher_student_queryset(teacher)
    student_ids = students.values_list("id", flat=True)

    # Get grade entries for this teacher's students (regardless of who created them)
    grade_entries = Result.objects.filter(
        student_id__in=student_ids
    ).order_by("-created_at")

    return Response([
        {
            "id": entry.id,
            "student_id": entry.student_id,
            "student_name": f"{entry.student.first_name} {entry.student.last_name or ''}".strip(),
            "student": f"{entry.student.first_name} {entry.student.last_name or ''}".strip(),
            "roll_number": entry.student.roll_number,
            "grade": entry.grade or "-",
            "remarks": entry.remarks or "",
            "created_at": entry.created_at
        }
        for entry in grade_entries
    ])


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def teacher_students(request):
    teacher = getattr(request.user, "teacher", None)
    if not teacher:
        return Response({"error": "Not a teacher"}, status=403)

    students = _teacher_student_queryset(teacher)
    return Response([
        {
            "id": s.id,
            "name": f"{s.first_name} {s.last_name or ''}".strip(),
            "roll_number": s.roll_number,
        }
        for s in students
    ])

# GET all teachers
@api_view(['GET'])
def teacher_list(request):
    teachers = Teacher.objects.all()
    return Response([
        {
            "id": t.id,
            "name": f"{t.first_name} {t.last_name or ''}".strip(),
            "email": t.email,
        }
        for t in teachers
    ])


# DELETE teacher
@api_view(['DELETE'])
def delete_teacher(request, id):
    try:
        teacher = Teacher.objects.get(id=id)
        teacher.delete()
        return Response({"message": "Teacher deleted"})
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)
    

@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_announcement(request):
    teacher = getattr(request.user, "teacher", None)
    if not teacher:
        return Response({"error": "Not a teacher"}, status=403)

    title = request.data.get("title")
    message = request.data.get("message")

    if not title or not message:
        return Response({"error": "Title and message required"}, status=400)

    announcement = Announcement.objects.create(
        teacher=teacher,
        title=title,
        message=message
    )
    return Response({
        "id": announcement.id,
        "title": announcement.title,
        "message": announcement.message,
        "teacher": str(announcement.teacher),
        "created_at": announcement.created_at
    })


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def list_announcements(request):
    announcements = Announcement.objects.all().order_by("-created_at")
    return Response([
        {
            "id": a.id,
            "title": a.title,
            "message": a.message,
            "teacher": str(a.teacher),
            "created_at": a.created_at
        } for a in announcements
    ])


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def teacher_profile_detail(request):
    teacher = getattr(request.user, "teacher", None)
    if not teacher:
        return Response({"error": "Not a teacher"}, status=403)

    specializations = Specialization.objects.filter(teacher=teacher).select_related("activity")
    activity_names = [
        s.activity.name
        for s in specializations
        if getattr(s, "activity", None) is not None
    ]

    full_name = " ".join(
        part for part in [teacher.first_name, teacher.middle_name, teacher.last_name] if part
    ).strip()

    return Response({
        "name": full_name,
        "email": teacher.email,
        "phone_number": teacher.phone_number or "-",
        "dob": teacher.dob,
        "specialization_list": activity_names,
        "specialization": ", ".join(activity_names) if activity_names else "-",
    })


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def teacher_leaderboard(request):
    """
    Returns a leaderboard of students sorted by attendance percentage (highest to lowest).
    """
    if not hasattr(request.user, "teacher"):
        return Response({"error": "Only teachers allowed"}, status=403)

    leaderboard = []
    
    for student in Student.objects.all():
        # Calculate total attendance
        total_days = Attendance.objects.filter(student=student).count()
        present_days = Attendance.objects.filter(student=student, status="present").count()
        
        # Calculate attendance percentage
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
        
        leaderboard.append({
            "name": f"{student.first_name} {student.last_name or ''}".strip(),
            "roll_number": student.roll_number,
            "attendance": round(attendance_percentage, 2),
            "present_days": present_days,
            "total_days": total_days,
        })
    
    # Sort by attendance percentage (highest to lowest)
    leaderboard.sort(key=lambda item: item["attendance"], reverse=True)

    # Dense ranking: equal attendance gets same rank, next distinct value increments rank by 1.
    current_rank = 0
    last_attendance = None
    for item in leaderboard:
        if last_attendance is None or item["attendance"] != last_attendance:
            current_rank += 1
            last_attendance = item["attendance"]
        item["rank"] = current_rank
    
    return Response(leaderboard)