from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/ping/', lambda request: HttpResponse('pong')),
    path('api/', include('places.urls')),
]
