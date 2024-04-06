from django.contrib import admin
from .models import Product

class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'brand', 'category', 'price', 'product_id',
        'price_sign', 'product_type', 'product_colors',
        'no_talc', 'sugar_free', 'peanut_free_product', 
        'cruelty_free', 'silicone_free', 'gluten_free', 
        'chemical_free', 'dairy_free', 'water_free', 
        'hypoallergenic', 'vegan', 'ecocert', 
        'purpicks', 'non_gmo', 'certclean', 
        'ewg_verified', 'oil_free', 'alcohol_free', 
        'canadian', 'organic', 'usda_organic', 
        'fair_trade', 'natural', 'ingredients'
    )
    search_fields = ['name', 'brand', 'category']
    list_filter = (
        'brand', 'category', 'price_sign', 'product_type',
        'cruelty_free', 'vegan', 'organic'
    )

# Register your models here.
admin.site.register(Product, ProductAdmin)