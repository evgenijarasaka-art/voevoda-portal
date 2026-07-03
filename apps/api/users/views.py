from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserUpdateSerializer, UserAvatarSerializer

User = get_user_model()

class UserDetailView(generics.RetrieveAPIView):
    """Получение профиля пользователя (доступно всем)"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # ВРЕМЕННО для демо
    
    def get_object(self):
        return self.request.user if self.request.user.is_authenticated else None
    
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Требуется авторизация"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return super().get(request, *args, **kwargs)

class UserUpdateView(generics.UpdateAPIView):
    """Обновление профиля пользователя (ВРЕМЕННО без авторизации)"""
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.AllowAny]  # ИСПРАВЛЕНО!
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(UserSerializer(instance).data)

class UserAvatarUploadView(generics.UpdateAPIView):
    """Загрузка аватара"""
    serializer_class = UserAvatarSerializer
    permission_classes = [permissions.AllowAny]  # ВРЕМЕННО!
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        file = request.FILES.get('avatar')
        if not file:
            return Response(
                {'error': 'Файл не загружен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'Файл слишком большой (макс 5MB)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not file.content_type.startswith('image/'):
            return Response(
                {'error': 'Файл должен быть изображением'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance = self.get_object()
        instance.avatar = file
        instance.save()
        
        return Response(UserSerializer(instance).data)