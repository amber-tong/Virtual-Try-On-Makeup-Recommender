from django.db import models

# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    shade_name = models.CharField(max_length=100)
    type = models.CharField(max_length=100, null=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    ingredients = models.JSONField()  # Update this line to use JSONField
    user_reviews = models.TextField()
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)

    def __str__(self):
        return self.name
    