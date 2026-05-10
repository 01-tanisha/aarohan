# activities/serializers.py

from rest_framework import serializers
from .models import Activity, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Activity
        fields = ['id', 'name', 'description', 'category', 'category_name', 'capacity', 'requirements', 'created_at', 'updated_at']