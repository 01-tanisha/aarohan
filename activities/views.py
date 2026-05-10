from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Activity, Category
from .serializers import ActivitySerializer, CategorySerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def activity_list(request):
    return Response(ActivitySerializer(Activity.objects.all(), many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    return Response(CategorySerializer(Category.objects.all(), many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_activity(request):

    if not request.user.is_superuser:
        return Response({"error": "Admin only"}, status=403)

    serializer = ActivitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_activity(request, id):

    activity = Activity.objects.get(id=id)

    serializer = ActivitySerializer(activity, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_activity(request, id):

    Activity.objects.get(id=id).delete()
    return Response({"message": "Deleted"})