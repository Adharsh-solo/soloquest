from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NearbyPlacesView, LocationSearchView, FavoriteViewSet

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('places/nearby/', NearbyPlacesView.as_view(), name='places-nearby'),
    path('places/search/', LocationSearchView.as_view(), name='places-search'),
    path('', include(router.urls)),
]
