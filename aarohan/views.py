from django.http import HttpResponse, JsonResponse
from django.shortcuts import render


def home(request):
    return render(request, "index.html")