import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.conf import settings

url = "https://api.geoapify.com/v2/places"
params = {
    'categories': 'tourism,tourism.attraction',
    'filter': f'circle:76.2421901,9.967569,5000',
    'limit': 1,
    'apiKey': settings.GEOAPIFY_API_KEY
}
res = requests.get(url, params=params)
data = res.json()
if 'features' in data and data['features']:
    props = data['features'][0]['properties']
    print("Keys:", list(props.keys()))
    print("Formatted:", props.get('formatted'))
    print("Details:", props.get('details'))
    print("Wiki:", props.get('wiki_and_media'))
else:
    print("No features:", data)
