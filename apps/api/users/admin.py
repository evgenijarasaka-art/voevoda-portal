# apps/api/users/admin.py
from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('login', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('login', 'first_name', 'last_name')
    fieldsets = (
        ('Основное', {
            'fields': ('login', 'first_name', 'last_name', 'phone', 'email')
        }),
        ('Воинские данные', {
            'fields': ('rank', 'position', 'unit', 'role')
        }),
        ('Медиа', {
            'fields': ('avatar', 'cover'),
            'classes': ('collapse',)
        }),
    )