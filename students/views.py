from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Student, Attendance, StudentActivity
from activities.models import Schedule
from activities.models import Activity
from activities.models import Feedback
from admin_panel.models import Result
from teachers.models import Announcement, Specialization
from .authentication import CsrfExemptSessionAuthentication


def _grade_from_score(score):
    if score is None:
        return "N/A"
    if score >= 90:
        return "A+"
    if score >= 80:
        return "A"
    if score >= 70:
        return "B+"
    if score >= 60:
        return "B"
    if score >= 50:
        return "C"
    if score >= 40:
        return "D"
    return "F"


def _resolve_activity_teacher(student):
    if not student.activity:
        return None

    if student.teacher_id and Specialization.objects.filter(
        teacher=student.teacher,
        activity=student.activity,
    ).exists():
        return student.teacher

    specialization = (
        Specialization.objects.select_related("teacher")
        .filter(activity=student.activity)
        .order_by("teacher_id")
        .first()
    )
    return specialization.teacher if specialization else student.teacher


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def student_attendance_summary(request):
    student = Student.objects.select_related("activity").get(user=request.user)
    qs = Attendance.objects.filter(student=student)
    
    activity_teacher = _resolve_activity_teacher(student)
    activity_name = student.activity.name if student.activity else "No activity selected"
    instructor_name = (
        f"{activity_teacher.first_name} {activity_teacher.last_name or ''}".strip()
        if activity_teacher
        else "Not assigned"
    )

    present_days = qs.filter(status="present").count()
    absent_days = qs.filter(status="absent").count()
    total_days = qs.count()
    attendance_percentage = round((present_days / total_days * 100), 2) if total_days > 0 else 0

    return Response({
        "activity": activity_name,
        "instructor": instructor_name,
        "total_days": total_days,
        "present_days": present_days,
        "absent_days": absent_days,
        "present": present_days,
        "absent": absent_days,
        "attendance_percentage": attendance_percentage,
    })

@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def student_profile_summary(request):
    student = Student.objects.select_related("teacher", "activity").get(user=request.user)

    # Keep backward compatibility: if legacy rows exist only in StudentActivity,
    # sync Student.activity so dashboard/profile show current activity.
    if not student.activity:
        enrollment = StudentActivity.objects.select_related("activity").filter(student=student).first()
        if enrollment and enrollment.activity:
            student.activity = enrollment.activity
            student.save(update_fields=["activity", "updated_at"])

    activity_teacher = _resolve_activity_teacher(student)
    activity_name = student.activity.name if student.activity else "No activity selected"
    instructor_name = (
        f"{activity_teacher.first_name} {activity_teacher.last_name or ''}".strip()
        if activity_teacher
        else "Not assigned"
    )

    schedule_text = "Schedule not set"
    status = "Not Started"
    if student.activity:
        schedule = Schedule.objects.filter(activity=student.activity).first()
        if schedule:
            day_map = [
                ("Mon", schedule.mon),
                ("Wed", schedule.wed),
                ("Thu", schedule.thu),
                ("Fri", schedule.fri),
                ("Sat", schedule.sat),
                ("Sun", schedule.sun),
            ]
            active_days = [label for label, enabled in day_map if enabled]
            if active_days:
                schedule_text = ", ".join(active_days)
                status = "Ongoing"

    return Response({
        "name": f"{student.first_name} {student.last_name or ''}".strip(),
        "activity": {
            "title": activity_name,
            "instructor": instructor_name,
            "schedule": schedule_text,
            "status": status,
        },
    })


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def student_result_detail(request):
    student = Student.objects.select_related("teacher", "activity", "classroom").get(user=request.user)
    activity_teacher = _resolve_activity_teacher(student)
    result = Result.objects.filter(student=student).order_by("-created_at").first()

    score = result.score if result else None
    remarks = result.remarks if result else "No remarks available"
    # Use stored grade first, then compute from score if not set
    if result and result.grade:
        grade = result.grade
    else:
        grade = _grade_from_score(score)

    return Response({
        "name": f"{student.first_name} {student.last_name or ''}".strip(),
        "photo_url": request.build_absolute_uri(student.photo.url) if student.photo else None,
        "class_name": student.classroom.name if student.classroom else "-",
        "roll_number": student.roll_number,
        "email": student.email,
        "father_name": student.father_name,
        "mother_name": student.mother_name,
        "activity": student.activity.name if student.activity else "-",
        "marks": score,
        "grade": grade,
        "remarks": remarks,
        "teacher": f"{activity_teacher.first_name} {activity_teacher.last_name or ''}".strip() if activity_teacher else "-",
    })


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def student_leaderboard(request):
    """
    Returns a leaderboard of students sorted by attendance percentage (highest to lowest).
    """
    leaderboard = []
    
    for student in Student.objects.all():
        # Calculate total attendance
        total_days = Attendance.objects.filter(student=student).count()
        present_days = Attendance.objects.filter(student=student, status="present").count()
        
        # Calculate attendance percentage
        attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0

        # Latest result details
        result = Result.objects.filter(student=student).order_by("-created_at").first()
        grade = None
        if result:
            grade = result.grade or _grade_from_score(result.score)
        
        leaderboard.append({
            "name": f"{student.first_name} {student.last_name or ''}".strip(),
            "roll_number": student.roll_number,
            "attendance": round(attendance_percentage, 2),
            "present_days": present_days,
            "total_days": total_days,
            "grade": grade or "N/A",
        })
    
    # Sort by attendance percentage (highest to lowest)
    leaderboard.sort(key=lambda item: item["attendance"], reverse=True)

    # Dense ranking: equal attendance gets same rank, next distinct value is next rank.
    current_rank = 0
    last_attendance = None
    for item in leaderboard:
        if last_attendance is None or item["attendance"] != last_attendance:
            current_rank += 1
            last_attendance = item["attendance"]
        item["rank"] = current_rank

    return Response(leaderboard)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def submit_feedback(request):
    student = Student.objects.select_related("activity").filter(user=request.user).first()
    if not student:
        return Response({"error": "Student profile not found"}, status=404)

    if not student.activity:
        return Response({"error": "Please enroll in an activity before submitting feedback"}, status=400)

    # Check if feedback already submitted
    if Feedback.objects.filter(student=student, activity=student.activity).exists():
        return Response({"error": "Feedback already submitted for this activity"}, status=400)

    try:
        rating = int(request.data.get("rating"))
    except (TypeError, ValueError):
        return Response({"error": "Rating is required"}, status=400)

    if rating < 1 or rating > 5:
        return Response({"error": "Rating must be between 1 and 5"}, status=400)

    comments = (request.data.get("comments") or "").strip()

    feedback = Feedback.objects.create(
        student=student,
        activity=student.activity,
        rating=rating,
        comments=comments,
    )

    return Response({
        "message": "Feedback submitted successfully",
        "id": feedback.id,
    }, status=201)


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def feedback_status(request):
    student = Student.objects.select_related("activity").filter(user=request.user).first()
    if not student or not student.activity:
        return Response({"submitted": False})

    submitted = Feedback.objects.filter(student=student, activity=student.activity).exists()
    return Response({"submitted": submitted})


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def student_profile_detail(request):
    student = Student.objects.select_related("classroom", "hostel", "activity").get(user=request.user)

    full_name = " ".join(
        part for part in [student.first_name, student.middle_name, student.last_name] if part
    ).strip()

    return Response({
        "name": full_name,
        "photo_url": request.build_absolute_uri(student.photo.url) if student.photo else None,
        "class_name": student.classroom.name if student.classroom else "-",
        "roll_number": student.roll_number,
        "semester": student.semester,
        "email": student.email,
        "phone_number": student.phone_number,
        "dob": student.dob,
        "father_name": student.father_name,
        "mother_name": student.mother_name,
        "hostel": student.hostel.name if student.hostel else "-",
        "activity": student.activity.name if student.activity else "-",
    })


@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def student_announcements(request):
    student = Student.objects.select_related("teacher").get(user=request.user)

    announcements = Announcement.objects.select_related("teacher")
    if student.teacher_id:
        announcements = announcements.filter(teacher=student.teacher)

    announcements = announcements.order_by("-created_at")

    return Response([
        {
            "id": announcement.id,
            "title": announcement.title,
            "message": announcement.message,
            "teacher": str(announcement.teacher),
            "created_at": announcement.created_at,
            "date": announcement.created_at,
        }
        for announcement in announcements
    ])


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def pick_activity(request):
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({
            "error": "You don't have a student profile. Please contact your administrator.",
            "details": "Student profile not found for this user"
        }, status=404)
    except Exception as e:
        return Response({
            "error": f"Error accessing student profile: {str(e)}"
        }, status=500)

    activity_id = request.data.get("activity_id")
    
    if not activity_id:
        return Response({"error": "Activity ID is required"}, status=400)

    try:
        activity = Activity.objects.get(id=activity_id)
    except Activity.DoesNotExist:
        return Response({"error": "Activity not found"}, status=404)
    except Exception as e:
        return Response({"error": f"Error fetching activity: {str(e)}"}, status=500)

    # Check if already enrolled in this activity
    try:
        if StudentActivity.objects.filter(student=student, activity=activity).exists():
            return Response({"error": "Already enrolled in this activity"}, status=400)
    except Exception as e:
        return Response({"error": f"Error checking enrollment: {str(e)}"}, status=500)

    # Check if student is already enrolled in another activity
    try:
        existing_activity = StudentActivity.objects.filter(student=student).first()
        if existing_activity:
            if student.activity_id != existing_activity.activity_id:
                student.activity = existing_activity.activity
                student.save(update_fields=["activity", "updated_at"])
            return Response({
                "error": f"You are already enrolled in {existing_activity.activity.name}. You can only enroll in one activity. Please unenroll first."
            }, status=400)
    except Exception as e:
        return Response({"error": f"Error checking existing enrollment: {str(e)}"}, status=500)

    try:
        enrollment = StudentActivity.objects.create(student=student, activity=activity)
        student.activity = activity

        teacher = (
            Specialization.objects.select_related("teacher")
            .filter(activity=activity)
            .order_by("teacher_id")
            .first()
        )

        if teacher:
            student.teacher = teacher.teacher

        student.save(update_fields=["activity", "teacher", "updated_at"])
        return Response({
            "message": "Activity enrolled successfully",
            "enrollment_id": enrollment.id,
            "activity_name": activity.name
        }, status=201)
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        return Response({
            "error": f"Error enrolling in activity: {str(e)}",
            "details": error_msg
        }, status=500)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def unenroll_activity(request):
    """Unenroll student from their current activity"""
    try:
        student = Student.objects.get(user=request.user)
    except Student.DoesNotExist:
        return Response({"error": "Student profile not found"}, status=404)
    except Exception as e:
        return Response({"error": f"Error accessing student profile: {str(e)}"}, status=500)
    
    try:
        student_activity = StudentActivity.objects.filter(student=student).first()
        if not student_activity:
            return Response({"error": "You are not enrolled in any activity"}, status=400)
        
        activity_name = student_activity.activity.name
        student_activity.delete()
        student.activity = None
        student.teacher = None
        student.save(update_fields=["activity", "teacher", "updated_at"])
        
        return Response({"message": f"Successfully unenrolled from {activity_name}"})
    except Exception as e:
        return Response({"error": f"Error unenrolling: {str(e)}"}, status=500)