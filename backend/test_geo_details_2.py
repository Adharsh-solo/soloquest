import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.conf import settings

url = "https://api.geoapify.com/v2/places"
params = {
    'categories': 'tourism,tourism.attraction,historic',
    'filter': f'circle:76.2421901,9.967569,5000',
    'limit': 5,
    'apiKey': settings.GEOAPIFY_API_KEY
}
res = requests.get(url, params=params)
data = res.json()
if 'features' in data and data['features']:
    for f in data['features']:
        props = f['properties']
        print(f"Name: {props.get('name')}")
        print(f"Wiki: {props.get('wiki_and_media')}")
        print(f"Details: {props.get('details')}")
        print("---")
else:
    print("No features:", data)
