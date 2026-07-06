from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    """
    Кастомный менеджер для модели User.
    Позволяет создавать пользователей и суперпользователей.
    """
    
    def create_user(self, login, password=None, **extra_fields):
        """
        Создание обычного пользователя.
        """
        if not login:
            raise ValueError('Поле "login" обязательно')
        
        user = self.model(login=login, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, login, password=None, **extra_fields):
        """
        Создание суперпользователя (админа).
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True')
        
        return self.create_user(login, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Кастомная модель пользователя.
    Соответствует требованиям задачи 1-1:
    - Позывной, телефон, email, звание, должность, подразделение
    - Фото и обложка
    - Роли (курсант, командир, инструктор, QA, admin, куратор)
    """
    
    # Роли (RBAC)
    ROLE_CHOICES = [
        ('cadet', 'Курсант'),
        ('commander', 'Командир'),
        ('instructor', 'Инструктор'),
        ('qa', 'QA'),
        ('admin', 'Admin'),
        ('curator', 'Куратор'),
    ]
    
    # Основные поля
    login = models.CharField(
        max_length=50, 
        unique=True,
        verbose_name='Логин (позывной)',
        help_text='Уникальный позывной, используется для входа'
    )
    first_name = models.CharField(
        max_length=50,
        verbose_name='Имя'
    )
    last_name = models.CharField(
        max_length=50,
        verbose_name='Фамилия'
    )
    patronymic = models.CharField(
        max_length=50, 
        blank=True,
        verbose_name='Отчество'
    )
    
    # Контактные данные
    email = models.EmailField(
        blank=True,
        verbose_name='Email'
    )
    phone = models.CharField(
        max_length=20, 
        unique=True,
        verbose_name='Телефон',
        help_text='Номер в формате +7XXXXXXXXXX'
    )
    
    # Воинские данные
    rank = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='Звание'
    )
    position = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='Должность'
    )
    unit = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name='Подразделение'
    )
    
    # Роль (RBAC)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='cadet',
        verbose_name='Роль'
    )
    
    # Индекс Воеводы (будет рассчитываться отдельно)
    voevoda_index = models.FloatField(
        default=0.0,
        verbose_name='Индекс Воеводы'
    )
    
    # Медиафайлы (через Pillow)
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='Аватар'
    )
    cover = models.ImageField(
        upload_to='covers/',
        blank=True,
        null=True,
        verbose_name='Обложка'
    )
    
    # Системные поля
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен'
    )
    is_staff = models.BooleanField(
        default=False,
        verbose_name='Персонал (доступ в админку)'
    )
    date_joined = models.DateTimeField(
        default=timezone.now,
        verbose_name='Дата регистрации'
    )
    
    # Указываем поле для аутентификации (вместо стандартного username)
    USERNAME_FIELD = 'login'
    
    # Поля, обязательные при создании суперпользователя
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone']
    
    objects = UserManager()
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['login']),
            models.Index(fields=['phone']),
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        """Строковое представление пользователя"""
        return f"{self.last_name} {self.first_name} (@{self.login})"
    
    def get_full_name(self):
        """Полное имя пользователя"""
        return f"{self.last_name} {self.first_name}".strip()
    
    def get_short_name(self):
        """Краткое имя (для отображения)"""
        return self.first_name
    
    def has_role(self, role_name):
        """Проверка наличия роли"""
        return self.role == role_name
    
    @property
    def is_curator(self):
        """Проверка, является ли пользователь куратором"""
        return self.role == 'curator'
    
    @property
    def is_commander(self):
        """Проверка, является ли пользователь командиром"""
        return self.role == 'commander'
    
    @property
    def is_instructor(self):
        """Проверка, является ли пользователь инструктором"""
        return self.role == 'instructor'
    
    @property
    def is_cadet(self):
        """Проверка, является ли пользователь курсантом"""
        return self.role == 'cadet'