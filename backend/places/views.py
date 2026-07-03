import math
import requests
import json
from django.conf import settings
from django.core.cache import cache
from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Place, Favorite
from .serializers import PlaceSerializer, FavoriteSerializer

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_geoapify_places(lat, lng, radius_km):
    if not settings.GEOAPIFY_API_KEY:
        return []
        
    url = f"https://api.geoapify.com/v2/places"
    params = {
        'categories': 'tourism',
        'filter': f"circle:{lng},{lat},{int(radius_km * 1000)}",
        'limit': 20,
        'apiKey': settings.GEOAPIFY_API_KEY
    }
    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get('features', [])
    except Exception as e:
        print(f"Geoapify error: {e}")
    return []

class NearbyPlacesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        lat_str = request.query_params.get('lat')
        lng_str = request.query_params.get('lng')
        radius_str = request.query_params.get('radius', 10)

        if not lat_str or not lng_str:
            return Response({"error": "Please provide lat and lng"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat_str)
            lng = float(lng_str)
            radius = float(radius_str)
        except ValueError:
            return Response({"error": "Invalid coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        # Cache key based on rounded lat/lng
        cache_key = f"nearby_places_{round(lat, 3)}_{round(lng, 3)}_{radius}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(json.loads(cached_result))

        # 1. Get curated places from DB
        places = Place.objects.all()
        curated_results = []
        for place in places:
            dist = haversine(lat, lng, place.latitude, place.longitude)
            if dist <= radius:
                place.distance_km = round(dist, 2)
                curated_results.append(place)
        
        curated_results.sort(key=lambda x: x.distance_km)
        serialized_curated = PlaceSerializer(curated_results, many=True).data

        # 2. Get Geoapify places
        geoapify_data = get_geoapify_places(lat, lng, radius)
        geoapify_results = []
        
        for feature in geoapify_data:
            item = feature.get('properties', {})
            # Check for proximity to dedupe (skip if curated place within 200m)
            item_lat = item.get('lat')
            item_lon = item.get('lon')
            
            if item_lat is None or item_lon is None:
                continue
                
            dist = haversine(lat, lng, item_lat, item_lon)
            
            is_duplicate = False
            for curated in curated_results:
                cur_dist = haversine(item_lat, item_lon, curated.latitude, curated.longitude)
                if cur_dist < 0.2:
                    is_duplicate = True
                    break
            
            if not is_duplicate and item.get('name'):
                geo_cats = item.get('categories', [])
                cat_string = " ".join(geo_cats).lower()
                mapped_category = 'other'
                if 'historic' in cat_string or 'heritage' in cat_string or 'castle' in cat_string or 'monument' in cat_string:
                    mapped_category = 'historic'
                elif 'beach' in cat_string:
                    mapped_category = 'beach'
                elif 'religion' in cat_string or 'worship' in cat_string:
                    mapped_category = 'religious'
                elif 'museum' in cat_string:
                    mapped_category = 'museum'
                elif 'mountain' in cat_string or 'peak' in cat_string or 'viewpoint' in cat_string:
                    mapped_category = 'hillstation'
                elif 'natural' in cat_string or 'forest' in cat_string or 'park' in cat_string:
                    mapped_category = 'nature'
                    
                address = item.get('address_line2') or item.get('formatted')
                desc = f"Located in {address}" if address else f"A popular {mapped_category} destination."

                geoapify_results.append({
                    'id': f"geoapify_{item.get('place_id')}",
                    'name': item['name'],
                    'latitude': item_lat,
                    'longitude': item_lon,
                    'category': mapped_category,
                    'description': desc,
                    'image_url': None,
                    'distance_km': round(dist, 2),
                    'source': 'geoapify'
                })

        geoapify_results.sort(key=lambda x: x['distance_km'])
        
        final_results = serialized_curated + geoapify_results
        # Re-sort combined
        final_results.sort(key=lambda x: x['distance_km'])

        # Cache for 1 hour
        cache.set(cache_key, json.dumps(final_results), 3600)

        return Response(final_results)

class LocationSearchView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        query = request.query_params.get('q')
        if not query:
            return Response({"error": "Please provide a search query"}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"geoapify_search_{query.lower()}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(json.loads(cached_result))

        if not settings.GEOAPIFY_API_KEY:
            return Response({"error": "API Key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        url = 'https://api.geoapify.com/v1/geocode/search'
        params = {
            'text': query,
            'limit': 5,
            'apiKey': settings.GEOAPIFY_API_KEY
        }
        try:
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                features = data.get('features', [])
                results = []
                for f in features:
                    props = f.get('properties', {})
                    if 'lat' in props and 'lon' in props:
                        results.append({'lat': str(props['lat']), 'lon': str(props['lon'])})
                
                cache.set(cache_key, json.dumps(results), 86400) # Cache for 1 day
                return Response(results)
        except Exception as e:
            return Response({"error": "Search service unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response([])

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        place_data = request.data.get('place')
        place_id = request.data.get('place_id')
        
        if place_data:
            pid = str(place_data.get('id', ''))
            if pid.startswith('geoapify_'):
                place, _ = Place.objects.get_or_create(
                    geoapify_id=pid,
                    defaults={
                        'name': place_data.get('name', 'Unknown'),
                        'latitude': place_data.get('latitude', 0.0),
                        'longitude': place_data.get('longitude', 0.0),
                        'category': place_data.get('category', 'other'),
                        'description': place_data.get('description', ''),
                        'source': 'geoapify'
                    }
                )
            else:
                try:
                    place = Place.objects.get(id=pid)
                except Place.DoesNotExist:
                    return Response({"error": "Place not found"}, status=status.HTTP_404_NOT_FOUND)
                    
            fav, created = Favorite.objects.get_or_create(user=request.user, place=place)
            serializer = self.get_serializer(fav)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        elif place_id:
            return super().create(request, *args, **kwargs)
            
        return Response({"error": "place or place_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
