from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student


class StudentRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    class Meta:
        model = Student
        fields = [
            'username',
            'password',
            'email',
            'first_name',
            'middle_name',
            'last_name',
            'smart_card_id',
            'roll_number',
            'phone_number',
            'semester',
            'dob',
            'father_name',
            'mother_name',
            'photo',
        ]

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        student = Student.objects.create(
            user=user,
            email=email,
            **validated_data
        )

        return student