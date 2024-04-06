from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_colors = serializers.JSONField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'category', 'currency', 'description', 
            'product_id', 'price', 'price_sign', 'product_api_url', 'product_link', 
            'product_type', 'website_link', 'product_colors', 'image_url', 
            'no_talc', 'sugar_free', 'peanut_free_product', 'cruelty_free', 
            'silicone_free', 'gluten_free', 'chemical_free', 'dairy_free', 
            'water_free', 'hypoallergenic', 'vegan', 'ecocert', 'purpicks', 
            'non_gmo', 'certclean', 'ewg_verified', 'oil_free', 'alcohol_free', 
            'canadian', 'organic', 'usda_organic', 'fair_trade', 'natural', 'api_featured_image', 'ingredients'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.api_featured_image and hasattr(obj.api_featured_image, 'url'):
            return request.build_absolute_uri(obj.api_featured_image.url)
        return None
