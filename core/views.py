from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils.html import escape
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from django.db import transaction
import random
import re

from students.models import Student
from teachers.models import Teacher, Specialization
from activities.models import Activity
from admin_panel.models import Hostel, Classroom
from students.authentication import CsrfExemptSessionAuthentication


BANASTHALI_EMAIL_DOMAINS = {"banasthali.in", "banasthali.ac.in"}
OTP_TTL_SECONDS = 600


def _email_domain(email):
    if not email or "@" not in email:
        return ""
    return email.split("@", 1)[1].lower().strip()


def _requires_registration_otp(email):
    return _email_domain(email) in BANASTHALI_EMAIL_DOMAINS


def _generate_otp():
    return f"{random.randint(100000, 999999)}"


def _otp_cache_key(session_id):
    return f"registration_otp:{session_id}"


# =========================
# AUTH
# =========================

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication])
def request_registration_otp(request):
    role = (request.data.get("role") or "").strip().lower()
    email = (request.data.get("email") or "").strip().lower()
    username = (request.data.get("username") or "").strip()

    if role not in {"student", "teacher"}:
        return Response({"error": "Invalid role"}, status=400)

    if not email:
        return Response({"error": "Email is required"}, status=400)

    if not username:
        return Response({"error": "Username is required"}, status=400)

    if not _requires_registration_otp(email):
        return Response(
            {"error": "OTP verification is only available for banasthali email addresses."},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    if not getattr(settings, "EMAIL_HOST_USER", "") or not getattr(settings, "EMAIL_HOST_PASSWORD", ""):
        return Response(
            {"error": "Email service is not configured correctly. Please contact admin."},
            status=500,
        )

    otp = _generate_otp()
    otp_session_id = _generate_otp() + _generate_otp()

    cache.set(
        _otp_cache_key(otp_session_id),
        {
            "email": email,
            "role": role,
            "username": username,
            "otp": otp,
        },
        timeout=OTP_TTL_SECONDS,
    )

    try:
        send_mail(
            subject="AAROHAN Registration OTP",
            message=(
                f"Your OTP for AAROHAN {role} registration is: {otp}\n\n"
                f"This OTP is valid for {OTP_TTL_SECONDS // 60} minutes."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception:
        return Response(
            {"error": "Failed to send OTP email. Please try again."},
            status=500,
        )

    return Response({"message": "OTP sent successfully", "otp_session_id": otp_session_id})


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication])
def verify_registration_otp(request):
    role = (request.data.get("role") or "").strip().lower()
    email = (request.data.get("email") or "").strip().lower()
    username = (request.data.get("username") or "").strip()
    otp = (request.data.get("otp") or "").strip()
    otp_session_id = (request.data.get("otp_session_id") or "").strip()

    if not otp or not otp_session_id:
        return Response({"error": "OTP and session are required."}, status=400)

    cached_data = cache.get(_otp_cache_key(otp_session_id))
    if not cached_data:
        return Response({"error": "OTP expired. Please request a new OTP."}, status=400)

    if cached_data.get("email") != email or cached_data.get("role") != role or cached_data.get("username") != username:
        return Response({"error": "OTP details do not match this registration."}, status=400)

    if cached_data.get("otp") != otp:
        return Response({"error": "Invalid OTP"}, status=400)

    cached_data["verified"] = True
    cache.set(_otp_cache_key(otp_session_id), cached_data, timeout=OTP_TTL_SECONDS)
    return Response({"message": "OTP verified successfully"})

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication])
def login_view(request):

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    # django.contrib.auth.login expects a Django HttpRequest, not DRF Request
    login(request._request, user)
    return Response({"success": True})


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication])
def register(request):

    def _split_name(full_name):
        parts = [part for part in (full_name or "").strip().split() if part]
        if not parts:
            return "", "", ""
        if len(parts) == 1:
            return parts[0], "", ""
        if len(parts) == 2:
            return parts[0], "", parts[1]
        return parts[0], " ".join(parts[1:-1]), parts[-1]

    role = request.data.get('role')
    username = (request.data.get('username') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password')

    if not username or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if _requires_registration_otp(email):
        otp_session_id = (request.data.get("otp_session_id") or "").strip()

        if not otp_session_id:
            return Response({"error": "OTP verification is required for this email."}, status=400)

        cached_data = cache.get(_otp_cache_key(otp_session_id))
        if not cached_data:
            return Response({"error": "OTP expired. Please request a new OTP."}, status=400)

        if cached_data.get("email") != email or cached_data.get("role") != role or cached_data.get("username") != username:
            return Response({"error": "OTP details do not match this registration."}, status=400)

        if not cached_data.get("verified"):
            return Response({"error": "Please verify OTP first."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )

            if role == 'student':
                full_name = request.data.get('studentName')
                first_name = request.data.get('firstName')
                middle_name = request.data.get('middleName')
                last_name = request.data.get('lastName')
                smart_card_id = (request.data.get('smartCardId') or '').strip().upper()

                if not re.fullmatch(r'[A-Z]{5}\d{5}', smart_card_id):
                    return Response(
                        {"error": "Smart Card ID must be in format XXXXX12345 (5 uppercase letters + 5 digits)."},
                        status=400,
                    )

                if Student.objects.filter(smart_card_id__iexact=smart_card_id).exists():
                    return Response({"error": "Smart Card ID already exists"}, status=400)

                if full_name and not (first_name or last_name):
                    parsed_first, parsed_middle, parsed_last = _split_name(full_name)
                    first_name = first_name or parsed_first
                    middle_name = middle_name or parsed_middle
                    last_name = last_name or parsed_last

                semester = request.data.get('semester')
                try:
                    semester = int(semester)
                except (TypeError, ValueError):
                    return Response({"error": "Valid semester is required"}, status=400)

                classroom_id = request.data.get('classroom')
                hostel_id = request.data.get('hostel')

                classroom = Classroom.objects.filter(id=classroom_id).first() if classroom_id else None
                hostel = Hostel.objects.filter(id=hostel_id).first() if hostel_id else None

                if classroom_id and not classroom:
                    return Response({"error": "Invalid classroom selected"}, status=400)
                if hostel_id and not hostel:
                    return Response({"error": "Invalid hostel selected"}, status=400)

                Student.objects.create(
                    user=user,
                    first_name=(first_name or username).strip(),
                    middle_name=(middle_name or '').strip() or None,
                    last_name=(last_name or '').strip() or None,
                    smart_card_id=smart_card_id,
                    roll_number=request.data.get('rollNo'),
                    email=email,
                    semester=semester,
                    phone_number=request.data.get('studentMobNo') or request.data.get('mobileNo'),
                    dob=request.data.get('dob') or '2000-01-01',
                    father_name=request.data.get('fathersName') or request.data.get('fatherName') or '',
                    mother_name=request.data.get('mothersName') or request.data.get('motherName') or '',
                    classroom=classroom,
                    hostel=hostel,
                    photo=request.FILES.get('photo') or 'images/default.png'
                )

            elif role == 'teacher':
                full_name = request.data.get('teacherName') or username
                first_name, middle_name, last_name = _split_name(full_name)
                specialization_id = request.data.get('specialization')

                if not specialization_id:
                    return Response({"error": "Specialization is required"}, status=400)

                try:
                    activity = Activity.objects.get(id=int(specialization_id))
                except (TypeError, ValueError, Activity.DoesNotExist):
                    return Response({"error": "Invalid specialization selected"}, status=400)

                teacher = Teacher.objects.create(
                    user=user,
                    first_name=first_name or username,
                    middle_name=middle_name or None,
                    last_name=last_name or None,
                    email=email,
                    phone_number=request.data.get('teacherMobNo') or request.data.get('mobileNo'),
                    dob=request.data.get('dob') or '2000-01-01'
                )

                Specialization.objects.create(
                    teacher=teacher,
                    activity=activity,
                )

            else:
                return Response({"error": "Invalid role"}, status=400)
    except Exception as exc:
        return Response({"error": f"Registration failed: {str(exc)}"}, status=400)

    if _requires_registration_otp(email):
        cache.delete(_otp_cache_key(otp_session_id))

    return Response({"message": "Registration successful"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CsrfExemptSessionAuthentication])
def me(request):

    user = request.user
    profile_id = None

    if user.is_superuser:
        role = "admin"
    elif hasattr(user, 'student'):
        role = "student"
        profile_id = user.student.id
    elif hasattr(user, 'teacher'):
        role = "teacher"
        profile_id = user.teacher.id
    else:
        role = "user"

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role,
        "profile_id": profile_id
    })


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # django.contrib.auth.logout expects a Django HttpRequest, not DRF Request
    logout(request._request)
    return Response({"message": "Logged out successfully"})


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication])
def forgot_password(request):
    identifier = (request.data.get("email") or request.data.get("phone") or request.data.get("identifier") or "").strip()

    if not identifier:
        return Response({"error": "Email or phone number is required"}, status=400)

    # Return a generic message to avoid exposing whether an account exists.
    generic_message = {
        "message": "If an account with that email or phone number exists, a password reset link has been sent."
    }

    normalized_phone = re.sub(r"\D", "", identifier)
    user = User.objects.filter(email__iexact=identifier.lower()).first()

    if not user and normalized_phone:
        student = Student.objects.filter(phone_number=normalized_phone).select_related("user").first()
        teacher = Teacher.objects.filter(phone_number=normalized_phone).select_related("user").first()
        related_profile = student or teacher
        if related_profile and related_profile.user:
            user = related_profile.user

    if not user:
        return Response(generic_message)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = request.build_absolute_uri(f"/reset-password/{uid}/{token}/")

    missing_settings = []
    if not getattr(settings, "EMAIL_HOST_USER", ""):
        missing_settings.append("EMAIL_HOST_USER")
    if not getattr(settings, "EMAIL_HOST_PASSWORD", ""):
        missing_settings.append("EMAIL_HOST_PASSWORD")

    if missing_settings:
        return Response(
            {"error": "Email service is not configured correctly. Please contact admin."},
            status=500,
        )

    try:
        email_subject = "AAROHAN Password Reset"
        email_message = (
            "You requested to reset your AAROHAN account password.\n\n"
            f"Click this link to reset your password:\n{reset_link}\n\n"
            "If you did not request this, you can ignore this email."
        )
        email_html = (
            "<p>You requested to reset your AAROHAN account password.</p>"
            f"<p><a href='{reset_link}'>Click here to reset your password</a></p>"
            f"<p>If the button does not open, copy and paste this link into your browser:<br>{reset_link}</p>"
            "<p>If you did not request this, you can ignore this email.</p>"
        )

        send_mail(
            subject=email_subject,
            message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            html_message=email_html,
        )
    except Exception as exc:
        return Response(
            {"error": "Email service is not configured correctly. Please contact admin."},
            status=500,
        )

    return Response(generic_message)


def _render_reset_page(uidb64, token, error_message="", success_message=""):
    error_html = f"<div class='alert error'>{escape(error_message)}</div>" if error_message else ""
    success_html = f"<div class='alert success'>{escape(success_message)}</div>" if success_message else ""

    return f"""<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>AAROHAN Reset Password</title>
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 24px; color: #1f2937; }}
    .card {{ max-width: 480px; margin: 48px auto; background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); }}
    h1 {{ margin-top: 0; font-size: 24px; }}
    label {{ display: block; margin: 14px 0 6px; font-weight: 600; }}
    input {{ width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 16px; box-sizing: border-box; }}
    button {{ width: 100%; margin-top: 18px; padding: 12px 14px; border: 0; border-radius: 10px; background: #1e40af; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; }}
    .alert {{ padding: 12px 14px; border-radius: 10px; margin-bottom: 14px; }}
    .error {{ background: #fee2e2; color: #991b1b; }}
    .success {{ background: #dcfce7; color: #166534; }}
    .help {{ font-size: 13px; color: #64748b; margin-top: 10px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class='card'>
    <h1>Reset Password</h1>
    <p>Set a new password for your AAROHAN account.</p>
    {error_html}
    {success_html}
    <form method='post' action='/reset-password/{escape(uidb64)}/{escape(token)}/'>
      <label for='new_password'>New Password</label>
      <input id='new_password' type='password' name='new_password' minlength='6' required>
      <label for='confirm_password'>Confirm Password</label>
      <input id='confirm_password' type='password' name='confirm_password' minlength='6' required>
      <button type='submit'>Reset Password</button>
    </form>
    <div class='help'>If this page does not load, copy the link into your browser. The reset link expires after a short time.</div>
  </div>
</body>
</html>"""


def _reset_password_with_token(uidb64, token, new_password):
    if len(new_password) < 6:
        return "Password must be at least 6 characters"

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return "Invalid or expired reset link"

    if not default_token_generator.check_token(user, token):
        return "Invalid or expired reset link"

    user.set_password(new_password)
    user.save()
    return None


@csrf_exempt
def password_reset_page(request, uidb64, token):
    if request.method == "POST":
        new_password = (request.POST.get("new_password") or "").strip()
        confirm_password = (request.POST.get("confirm_password") or "").strip()

        if new_password != confirm_password:
            return HttpResponse(_render_reset_page(uidb64, token, error_message="Passwords do not match"))

        error_message = _reset_password_with_token(uidb64, token, new_password)
        if error_message:
            return HttpResponse(_render_reset_page(uidb64, token, error_message=error_message))

        return HttpResponse(_render_reset_page(uidb64, token, success_message="Password reset successful. You can now return to the app and log in."))

    return HttpResponse(_render_reset_page(uidb64, token))


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([CsrfExemptSessionAuthentication])
def reset_password(request):
    uidb64 = re.sub(r"\s+", "", (request.data.get("uid") or "").strip())
    token = re.sub(r"\s+", "", (request.data.get("token") or "").strip())
    new_password = (request.data.get("new_password") or "").strip()

    if not uidb64 or not token or not new_password:
        return Response({"error": "Invalid reset request"}, status=400)

    if len(new_password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({"error": "Invalid or expired reset link"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired reset link"}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password reset successful. Please login with your new password."})


# =========================
# CHATBOT
# =========================

@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_response(request):

    user_message = request.data.get("message", "").lower().strip()
    normalized_message = re.sub(r"[^a-z0-9\s]", "", user_message)

    responses = {
        "how is attendance of a student calculated": "It is based on total classes attended.",
        "what is the minimum percentage of attendance required to appear for the exams": "As per Vidyapith's rules and regulations, a minimum of 50 percent is required in the five fold activity to appear for the exams. Students who fail to meet this criteria may not be allowed to qualify or may be required to repeat the activities as per university rules.",
        "is participation in five fold activities compulsory": "Yes, participation in Five-Fold activities is mandatory for all students as it is a core part of Banasthali’s educational system.",
        "who should i contact for errors regarding my attendance": "Please contact your class teacher or admin for any errors or discrepancies.",
        "are five fold activities graded": "Yes, the five fold activities are graded. Some activities are evaluated for participation, discipline, and performance as part of the overall assessment.",
        "can i change my allotted activity": "Yes, in certain cases, students may request a change, but it depends on availability and approval from the administration.",
        "do five fold activities impact final results": "Yes, grades of five fold activities do affect the overall cgpa of the student. Performance and attendance in these activities contribute to overall assessment and eligibility.",
        "hello": "Hello! Welcome to AAROHAN 👋",
        "hi": "Hi there! Ask me anything about activities, attendance, registration, or results 😊",
        "activities": "You can view and enroll in activities from the Activities page.",
        "attendance": "Attendance is calculated from total classes attended, and at least 50 percent is required in the five fold activity to appear for exams.",
        "register": "Go to the register page and fill in your details.",
        "login": "Enter your username and password to login.",
        "dashboard": "Dashboard shows attendance, activities, announcements, and results.",
        "result": "Results are available in your dashboard.",
        "bye": "Goodbye! 👋"
    }

    for keyword, response in responses.items():
        if keyword in normalized_message or keyword in user_message:
            return Response({"response": response})

    return Response({
        "response": "Ask me about attendance, five-fold activities, registration, results, or announcements 😊"
    })