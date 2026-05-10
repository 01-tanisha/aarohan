from huggingface_hub import User
from rest_framework import serializers
from .models import TeacherAnnouncement


class TeacherAnnouncementSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherAnnouncement
        fields = ['id', 'title', 'message', 'created_at', 'teacher_name']

    def get_teacher_name(self, obj):
        return f"{obj.teacher.first_name} {obj.teacher.last_name or ''}".strip()
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'role']

    def validate_email(self, value):
        if not value.endswith("@banasthali.in"):
            raise serializers.ValidationError(
                "Only @banasthali.in email IDs are allowed."
            )
        return value