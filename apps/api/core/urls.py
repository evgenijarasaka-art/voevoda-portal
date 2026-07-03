"""
Главный файл маршрутизации (URLconf) проекта.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Админка Django
    path('admin/', admin.site.urls),
    
    # Swagger документация API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API версии 1 (будем добавлять позже)
    path('api/v1/', include('users.urls')),
    path('api/v1/payments/', include('payments.urls')),
]

# Для разработки: раздача медиафайлов
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)  
