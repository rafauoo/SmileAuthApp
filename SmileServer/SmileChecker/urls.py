from django.urls import path
from .views import upload, display_uploaded_photo

urlpatterns = [
    path('upload/', upload, name='upload'),
    path('display_uploaded_photo/', display_uploaded_photo, name='display_uploaded_photo'),
]
