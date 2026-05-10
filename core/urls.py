from django.urls import path
from .views import (
    login_view,
    register,
    me,
    logout_view,
    chatbot_response,
    forgot_password,
    request_registration_otp,
    verify_registration_otp,
    reset_password,
    password_reset_page,
)

urlpatterns = [
    path("login/", login_view),
    path("register/", register),
    path("me/", me),
    path("logout/", logout_view),
    path("register/request-otp/", request_registration_otp),
    path("register/verify-otp/", verify_registration_otp),
    path("forgot-password/", forgot_password),
    path("reset-password/<str:uidb64>/<str:token>/", password_reset_page),
    path("reset-password/", reset_password),
    path("chatbot/", chatbot_response),
]