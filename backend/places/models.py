from django.db import models
from django.contrib.auth.models import User

class Place(models.Model):
    CATEGORY_CHOICES = (
        ('nature', 'Nature'),
        ('historic', 'Historic'),
        ('beach', 'Beach'),
        ('religious', 'Religious'),
        ('museum', 'Museum'),
        ('hillstation', 'Hill Station'),
        ('other', 'Other'),
    )
    
    SOURCE_CHOICES = (
        ('curated', 'Curated'),
        ('geoapify', 'Geoapify'),
    )

    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='curated')
    geoapify_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'place')

    def __str__(self):
        return f"{self.user.username} - {self.place.name}"
