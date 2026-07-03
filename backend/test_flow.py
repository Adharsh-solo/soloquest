import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from places.views import get_geoapify_places
import requests

print("Testing Nominatim...")
headers = {'User-Agent': 'KeralaTouristFinderApp/1.0 (contact@example.com)'}
params = {'q': 'fort kochi Kerala', 'format': 'json', 'limit': 5}
res = requests.get('https://nominatim.openstreetmap.org/search', params=params, headers=headers)
print("Nominatim Status:", res.status_code)
data = res.json()
if not data:
    print("No data from Nominatim")
else:
    lat, lon = data[0]['lat'], data[0]['lon']
    print(f"Got lat={lat}, lon={lon}")

    print("Testing Geoapify...")
    geo = get_geoapify_places(float(lat), float(lon), 50)
    print("Geoapify returned", len(geo), "features")
    if geo:
        print(geo[0])
