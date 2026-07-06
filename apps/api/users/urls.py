from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserDetailView.as_view(), name='user-detail'),
    path('profile/update/', views.UserUpdateView.as_view(), name='user-update'),
    path('profile/avatar/', views.UserAvatarUploadView.as_view(), name='user-avatar'),
]