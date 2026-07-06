from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'login', 'first_name', 'last_name', 'patronymic',
            'email', 'phone', 'rank', 'position', 'unit', 'role',
            'voevoda_index', 'avatar', 'cover'
        ]
        read_only_fields = ['id', 'login', 'voevoda_index']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'patronymic',
            'email', 'phone', 'rank', 'position', 'unit',
            'avatar', 'cover'
        ]

class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar']