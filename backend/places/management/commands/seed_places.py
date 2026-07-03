from django.core.management.base import BaseCommand
from places.models import Place

class Command(BaseCommand):
    help = 'Seeds the database with Kerala tourist places'

    def handle(self, *args, **kwargs):
        places = [
            {"name": "Munnar", "lat": 10.0892, "lng": 77.0595, "cat": "hillstation", "desc": "Famous for tea estates."},
            {"name": "Alleppey Backwaters", "lat": 9.4981, "lng": 76.3388, "cat": "nature", "desc": "Known for houseboat cruises."},
            {"name": "Kovalam Beach", "lat": 8.4004, "lng": 76.9787, "cat": "beach", "desc": "Internationally renowned beach."},
            {"name": "Wayanad", "lat": 11.6854, "lng": 76.1320, "cat": "hillstation", "desc": "Famous for spice plantations and wildlife."},
            {"name": "Athirappilly Falls", "lat": 10.2851, "lng": 76.5694, "cat": "nature", "desc": "The largest waterfall in Kerala."},
            {"name": "Fort Kochi", "lat": 9.9658, "lng": 76.2421, "cat": "historic", "desc": "Known for colonial architecture and Chinese fishing nets."},
            {"name": "Bekal Fort", "lat": 12.3969, "lng": 75.0343, "cat": "historic", "desc": "Largest fort in Kerala."},
            {"name": "Periyar Wildlife Sanctuary", "lat": 9.4679, "lng": 77.1433, "cat": "nature", "desc": "Famous elephant and tiger reserve."},
            {"name": "Varkala Beach", "lat": 8.7379, "lng": 76.7163, "cat": "beach", "desc": "Famous for its cliffs adjacent to the Arabian Sea."},
            {"name": "Padmanabhaswamy Temple", "lat": 8.4828, "lng": 76.9436, "cat": "religious", "desc": "Historic Hindu temple in Thiruvananthapuram."},
            {"name": "Silent Valley National Park", "lat": 11.1301, "lng": 76.4308, "cat": "nature", "desc": "Pristine tropical evergreen forest."},
            {"name": "Kumarakom Bird Sanctuary", "lat": 9.6262, "lng": 76.4251, "cat": "nature", "desc": "A popular bird watching spot."},
            {"name": "Edakkal Caves", "lat": 11.6272, "lng": 76.2343, "cat": "historic", "desc": "Two natural caves containing ancient petroglyphs."},
            {"name": "Napier Museum", "lat": 8.5088, "lng": 76.9554, "cat": "museum", "desc": "Art and natural history museum."},
            {"name": "Chembra Peak", "lat": 11.5126, "lng": 76.0864, "cat": "nature", "desc": "Highest peak in Wayanad."},
            {"name": "Guruvayur Temple", "lat": 10.5947, "lng": 76.0375, "cat": "religious", "desc": "One of the most important places of worship for Hindus."},
            {"name": "Marari Beach", "lat": 9.5986, "lng": 76.2981, "cat": "beach", "desc": "Beautiful, pristine beach in Alappuzha."},
            {"name": "Ponmudi", "lat": 8.7599, "lng": 77.1169, "cat": "hillstation", "desc": "Hill station in the Thiruvananthapuram district."},
            {"name": "Agasthyakoodam", "lat": 8.6171, "lng": 77.2472, "cat": "nature", "desc": "One of the highest peaks in Kerala."},
            {"name": "Vembanad Lake", "lat": 9.6015, "lng": 76.3860, "cat": "nature", "desc": "Longest lake in India."},
            {"name": "Mattupetty Dam", "lat": 10.1065, "lng": 77.1235, "cat": "nature", "desc": "Concrete gravity dam in Munnar."},
            {"name": "Eravikulam National Park", "lat": 10.2016, "lng": 77.0524, "cat": "nature", "desc": "Home to the endangered Nilgiri Tahr."},
            {"name": "Kozhikode Beach", "lat": 11.2612, "lng": 75.7686, "cat": "beach", "desc": "Historic beach, Vasco da Gama landed near here."},
            {"name": "Thrissur Vadakkunnathan Temple", "lat": 10.5244, "lng": 76.2139, "cat": "religious", "desc": "Ancient Shiva temple with classic Kerala architecture."},
            {"name": "Malampuzha Dam", "lat": 10.8315, "lng": 76.6826, "cat": "nature", "desc": "Largest reservoir in Kerala."}
        ]

        Place.objects.all().delete()
        
        for p in places:
            Place.objects.create(
                name=p['name'],
                latitude=p['lat'],
                longitude=p['lng'],
                category=p['cat'],
                description=p['desc'],
                source='curated'
            )
            
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(places)} places!"))
