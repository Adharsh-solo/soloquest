from rest_framework import serializers
from .models import Place, Favorite

class PlaceSerializer(serializers.ModelSerializer):
    distance_km = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Place
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    place = PlaceSerializer(read_only=True)
    place_id = serializers.PrimaryKeyRelatedField(
        queryset=Place.objects.all(), source='place', write_only=True
    )

    class Meta:
        model = Favorite
        fields = ('id', 'place', 'place_id', 'created_at')
