from django.shortcuts import render

# Create your views here.
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from activities.models import Activity
from students.models import Student
from teachers.models import Teacher, Specialization
from admin_panel.models import Hostel, Classroom, Result
from activities.models import Feedback
from .serializers import HostelSerializer, ClassroomSerializer
from students.authentication import CsrfExemptSessionAuthentication


@api_view(['GET'])
@permission_classes([AllowAny])
def hostel_list(request):
    return Response(HostelSerializer(Hostel.objects.all(), many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def classroom_list(request):
    return Response(ClassroomSerializer(Classroom.objects.all(), many=True).data)


@api_view(["GET"])
def all_users(request):

    students = Student.objects.all()
    teachers = Teacher.objects.all()

    return Response([
        *[{"id": s.id, "type": "student", "name": s.first_name} for s in students],
        *[{"id": t.id, "type": "teacher", "name": t.first_name} for t in teachers]
    ])


@api_view(["GET"])
def all_results(request):
    if not _is_admin(request.user):
        return Response({"error": "Admin access required"}, status=403)

    results = Result.objects.select_related("student").order_by("-created_at")

    return Response([
        {
            "id": r.id,
            "name": " ".join(part for part in [r.student.first_name, r.student.last_name or ""] if part).strip(),
            "roll_number": r.student.roll_number,
            "grade": r.grade or "N/A",
            "remarks": r.remarks or "N/A",
            "created_at": r.created_at,
        }
        for r in results
    ])


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def all_feedback(request):
    if not _is_admin(request.user):
        return Response({"error": "Admin access required"}, status=403)

    feedbacks = Feedback.objects.select_related("student", "activity").order_by("-created_at")

    return Response([
        {
            "id": item.id,
            "student_name": " ".join(part for part in [item.student.first_name, item.student.last_name or ""] if part).strip() if item.student else "-",
            "roll_number": item.student.roll_number if item.student else "-",
            "activity": item.activity.name if item.activity else "-",
            "rating": item.rating,
            "comments": item.comments or "-",
            "created_at": item.created_at,
        }
        for item in feedbacks
    ])


def _is_admin(user):
    return bool(user and (user.is_superuser or user.is_staff))


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_supervise_users(request):
    if not _is_admin(request.user):
        return Response({"error": "Admin access required"}, status=403)

    students = Student.objects.select_related("hostel", "classroom").all()
    teachers = Teacher.objects.all()

    data = [
        {
            "id": s.id,
            "type": "student",
            "name": " ".join(part for part in [s.first_name, s.middle_name or "", s.last_name or ""] if part).strip(),
            "roll_number": s.roll_number,
            "email": s.email,
            "semester": s.semester,
            "hostel": s.hostel.name if s.hostel else "-",
            "course": s.classroom.name if s.classroom else "-",
            "phone_number": s.phone_number or "",
            "father_name": s.father_name,
            "mother_name": s.mother_name,
            "first_name": s.first_name,
            "middle_name": s.middle_name or "",
            "last_name": s.last_name or "",
        }
        for s in students
    ]

    data.extend([
        {
            "id": t.id,
            "type": "teacher",
            "name": " ".join(part for part in [t.first_name, t.middle_name or "", t.last_name or ""] if part).strip(),
            "email": t.email,
            "semester": "-",
            "hostel": "-",
            "course": "-",
            "specialization": ", ".join(
                Specialization.objects.filter(teacher=t).select_related("activity").values_list("activity__name", flat=True)
            ) or "-",
            "phone_number": t.phone_number or "",
            "first_name": t.first_name,
            "middle_name": t.middle_name or "",
            "last_name": t.last_name or "",
        }
        for t in teachers
    ])

    return Response(data)


@api_view(["PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_supervise_update(request, user_type, id):
    if not _is_admin(request.user):
        return Response({"error": "Admin access required"}, status=403)

    payload = request.data

    if user_type == "student":
        try:
            obj = Student.objects.get(id=id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

        obj.first_name = payload.get("first_name", obj.first_name)
        obj.middle_name = payload.get("middle_name", obj.middle_name)
        obj.last_name = payload.get("last_name", obj.last_name)
        obj.email = payload.get("email", obj.email)
        obj.phone_number = payload.get("phone_number", obj.phone_number)
        obj.father_name = payload.get("father_name", obj.father_name)
        obj.mother_name = payload.get("mother_name", obj.mother_name)
        obj.roll_number = payload.get("roll_number", obj.roll_number)
        obj.semester = payload.get("semester", obj.semester)
        obj.save()
        return Response({"message": "Student updated successfully"})

    if user_type == "teacher":
        try:
            obj = Teacher.objects.get(id=id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=404)

        obj.first_name = payload.get("first_name", obj.first_name)
        obj.middle_name = payload.get("middle_name", obj.middle_name)
        obj.last_name = payload.get("last_name", obj.last_name)
        obj.email = payload.get("email", obj.email)
        obj.phone_number = payload.get("phone_number", obj.phone_number)
        obj.save()
        return Response({"message": "Teacher updated successfully"})

    return Response({"error": "Invalid user type"}, status=400)


@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_supervise_delete(request, user_type, id):
    if not _is_admin(request.user):
        return Response({"error": "Admin access required"}, status=403)

    if user_type == "student":
        try:
            Student.objects.get(id=id).delete()
            return Response({"message": "Student deleted successfully"})
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)

    if user_type == "teacher":
        try:
            Teacher.objects.get(id=id).delete()
            return Response({"message": "Teacher deleted successfully"})
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=404)

    return Response({"error": "Invalid user type"}, status=400)


def _normalize_category_name(raw_name):
    name = (raw_name or "").strip().lower()
    if "physical" in name:
        return "physical"
    if "asth" in name or "aesth" in name or "esthetic" in name:
        return "asthetic"
    if "practical" in name:
        return "practical"
    if "moral" in name:
        return "moral"
    return None

@api_view(["GET"])
def dashboard_data(request):
    total_students = Student.objects.count()
    total_teachers_enrolled = Specialization.objects.values("teacher_id").distinct().count()
    total_activities = Activity.objects.count()

    category_counts = {
        "physical": 0,
        "asthetic": 0,
        "practical": 0,
        "moral": 0,
    }

    grouped_counts = (
        Student.objects.filter(activity__category__isnull=False)
        .values("activity__category__name")
        .annotate(count=Count("id"))
    )

    for item in grouped_counts:
        normalized_name = _normalize_category_name(item["activity__category__name"])
        if normalized_name:
            category_counts[normalized_name] += item["count"]

    categories = [
        {"name": "Physical", "count": category_counts["physical"]},
        {"name": "Asthetic", "count": category_counts["asthetic"]},
        {"name": "Practical", "count": category_counts["practical"]},
        {"name": "Moral", "count": category_counts["moral"]},
    ]

    activity_counts = (
        Student.objects.filter(activity__isnull=False)
        .values("activity_id", "activity__name")
        .annotate(count=Count("id"))
        .order_by("activity__name")
    )

    activities = [
        {"name": item["activity__name"], "count": item["count"]}
        for item in activity_counts
    ]

    return Response({
        "totalStudents": total_students,
        "totalTeachersEnrolled": total_teachers_enrolled,
        "totalActivities": total_activities,
        "categories": categories,
        "activities": activities,
    })