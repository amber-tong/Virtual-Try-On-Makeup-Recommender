from django.db import models
from django.db.models import JSONField  # If you're using PostgreSQL

class Product(models.Model):
    api_featured_image = models.URLField(max_length=200, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    currency = models.CharField(max_length=5, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    product_id = models.IntegerField(unique=True, blank=True, null=True)  # Assuming 'id' is the unique identifier
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    price_sign = models.CharField(max_length=5, blank=True, null=True)
    product_api_url = models.URLField(max_length=200, blank=True, null=True)
    product_link = models.URLField(max_length=200, blank=True, null=True)
    product_type = models.CharField(max_length=100, blank=True, null=True)
    website_link = models.URLField(max_length=200, blank=True, null=True)
    
    # JSONField can store a list of colors with their names and hex values.
    # For PostgreSQL: JSONField(blank=True, null=True)
    # For other databases: models.TextField(blank=True, null=True) and serialize to JSON manually
    #product_colors = JSONField(blank=True, null=True)  # Use django.contrib.postgres.fields.JSONField
    #product_colors = models.JSONField()
    product_colors = models.JSONField(default=list)

    # Boolean fields for product properties, assuming CSV provides 'true'/'false' or similar values
    no_talc = models.BooleanField(default=False)
    sugar_free = models.BooleanField(default=False)
    peanut_free_product = models.BooleanField(default=False)
    cruelty_free = models.BooleanField(default=False)
    silicone_free = models.BooleanField(default=False)
    gluten_free = models.BooleanField(default=False)
    chemical_free = models.BooleanField(default=False)
    dairy_free = models.BooleanField(default=False)
    water_free = models.BooleanField(default=False)
    hypoallergenic = models.BooleanField(default=False)
    vegan = models.BooleanField(default=False)
    ecocert = models.BooleanField(default=False)
    purpicks = models.BooleanField(default=False)
    non_gmo = models.BooleanField(default=False)
    certclean = models.BooleanField(default=False)
    ewg_verified = models.BooleanField(default=False)
    oil_free = models.BooleanField(default=False)
    alcohol_free = models.BooleanField(default=False)
    canadian = models.BooleanField(default=False)
    organic = models.BooleanField(default=False)
    usda_organic = models.BooleanField(default=False)
    fair_trade = models.BooleanField(default=False)
    natural = models.BooleanField(default=False)

    ingredients = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} by {self.brand}"
