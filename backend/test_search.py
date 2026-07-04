import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from places.views import LocationSearchView, NearbyPlacesView
from django.contrib.auth.models import User

# Create a request factory
factory = RequestFactory()

# Create or get user
user, _ = User.objects.get_or_create(username='testuser')

# Test LocationSearch
request = factory.get('/api/places/search/', {'q': 'munnar Kerala'})
request.user = user

view = LocationSearchView.as_view()
response = view(request)
print("LocationSearch Status:", response.status_code)
print("LocationSearch Data:", response.data)

if response.status_code == 200 and response.data:
    lat = response.data[0]['lat']
    lon = response.data[0]['lon']
    print(f"\nFetching nearby places for {lat}, {lon}")
    
    # Test NearbyPlaces
    nearby_request = factory.get('/api/places/nearby/', {'lat': lat, 'lng': lon, 'radius': 50})
    nearby_request.user = user
    nearby_view = NearbyPlacesView.as_view()
    nearby_response = nearby_view(nearby_request)
    print("NearbyPlaces Status:", nearby_response.status_code)
    
    if nearby_response.status_code == 200:
        places = nearby_response.data
        print(f"NearbyPlaces Count: {len(places)}")
        if places:
            print("First place:", places[0])
    else:
        print("NearbyPlaces Data:", nearby_response.data)
