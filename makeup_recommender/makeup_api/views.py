import os
from django.shortcuts import render
import logging
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from collections import defaultdict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
from django.db.models import Q
from django.shortcuts import get_object_or_404
import json
from django.conf import settings
from django.http import JsonResponse
import math



# Configure logging 
logging.basicConfig(level=logging.INFO)

nltk.download('punkt')  # Download necessary NLTK data

def load_ingredient_aliases():
    file_path = os.path.join(settings.BASE_DIR, '/Users/ambertong/Documents/GitHub/Dissertation/makeup_recommender/makeup_api/data/updated_cleaned_ingredient_aliases.json')
    with open(file_path, 'r') as file:
        return json.load(file)

ingredient_aliases_dict = load_ingredient_aliases()
ingredient_aliases = defaultdict(lambda: None, ingredient_aliases_dict)

# Standardize ingredients function
def standardize_ingredients(ingredient_list):
    if ingredient_list is None:
        return []  # Return an empty list if ingredient_list is None
    standardized_list = []
    for ingredient in ingredient_list:
        alias = ingredient_aliases.get(ingredient.lower())
        if alias:
            standardized_list.append(alias)
        else:
            standardized_list.append(ingredient.lower())
    return standardized_list

def index(request):
    return render(request, 'build/index.html')

class ProductSearchView(APIView):
    def get(self, request, format=None):
        query = request.query_params.get('q', '')
        if query:
            products = Product.objects.filter(
                Q(name__icontains=query) | Q(brand__icontains=query),
                product_colors__isnull=False,  # Ensure product_colors is not null
                ingredients__isnull=False  # Ensure ingredients is not null
            ).exclude(
                product_colors='[]'  # Exclude products with empty product_colors list
            )[:1048]
            serializer = ProductSerializer(products, many=True, context={'request': request})
            return Response(serializer.data)
        return Response([], status=status.HTTP_404_NOT_FOUND)

class FetchShadesView(APIView):
    def get(self, request, format=None):
        product_name = request.query_params.get('product', '')
        if product_name:
            shades = Product.objects.filter(name=product_name).values_list('shade_name', flat=True).distinct()
            results = [{'name': shade} for shade in shades]
            return Response(results)
        return Response([], status=status.HTTP_404_NOT_FOUND)
    
# Additional functions for hex color comparison
def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    lv = len(hex_color)
    return tuple(int(hex_color[i:i + lv // 3], 16) for i in range(0, lv, lv // 3))

def color_distance(hex_color1, hex_color2):
    rgb1 = hex_to_rgb(hex_color1)
    rgb2 = hex_to_rgb(hex_color2)
    return math.sqrt(sum((c1 - c2) ** 2 for c1, c2 in zip(rgb1, rgb2)))

class RecommendProductsView(APIView):
    def get(self, request, format=None):
        product_id = request.query_params.get('product_id', None)
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            selected_product = Product.objects.get(pk=product_id)
            # Print the ingredients using logging
            logging.info(f"Selected Product Ingredients: {selected_product.ingredients}")
        except Product.DoesNotExist:
            return Response({'error': 'Product does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        # Standardize ingredients for the selected product
        standardized_selected_ingredients = ' '.join(standardize_ingredients(selected_product.ingredients))

        selected_product_type = selected_product.product_type

        # Get all other products and standardize their ingredients
        # Filter to exclude products with null or empty product_colors and ingredients
        all_products = Product.objects.exclude(
            pk=product_id
        ).filter(
            product_type=selected_product_type,
            product_colors__isnull=False,
            ingredients__isnull=False
        ).exclude(
            product_colors='[]'  # Exclude products with empty product_colors list
        )
        standardized_corpus = [
            ' '.join(standardize_ingredients(p.ingredients or []))  # Use an empty list if ingredients is None
            for p in all_products
        ]

        logging.info(f"standardized_corpus: {standardized_corpus}")

        # Initialize the vectorizer and transform the corpus into TF-IDF matrix
        vectorizer = TfidfVectorizer(tokenizer=word_tokenize)  # Tokenize the ingredients
        tfidf_matrix = vectorizer.fit_transform([standardized_selected_ingredients] + standardized_corpus)

        cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        # Debugging: print cosine similarities
        logging.info(f"Cosine Similarities: {cosine_similarities}")

        similar_indices = cosine_similarities.argsort()[-3:][::-1]
        similar_products = [all_products[int(i)] for i in similar_indices]

        # Assume the maximum color distance possible is the distance between pure black and pure white in RGB
        MAX_COLOR_DISTANCE = math.sqrt(3 * (255 ** 2))

        #serializer = ProductSerializer(similar_products, many=True, context={'request': request})

        # Debugging: print similar products
        for i, product in zip(similar_indices, similar_products):
            logging.info(f"Product: {product.name}, Similarity: {cosine_similarities[i]}")

        selected_shade_hex = request.query_params.get('shade_hex', None)
        logging.info(f"SELECTED SHADE HEX: {selected_shade_hex}")  # Check the parsed data

        product_data = []
        for i, product in zip(similar_indices, similar_products):
            # Only include products that have non-empty product_colors
            if product.product_colors and product.ingredients != '[]':
            #if product.product_colors and product.ingredients:
                logging.info(f"Product Colors Raw: {product.product_colors}")  # Check the raw JSON string
                product_colors = json.loads(product.product_colors) if product.product_colors else []
                logging.info(f"Product Colors Parsed: {product_colors}")  # Check the parsed data

                if selected_shade_hex and product_colors:
                    closest_shade = min(
                        product_colors, 
                        key=lambda color: color_distance(color['hex_value'], selected_shade_hex)
                    )
                    closest_shade_distance = color_distance(closest_shade['hex_value'], selected_shade_hex)
                    color_match_score = 1 - (closest_shade_distance / MAX_COLOR_DISTANCE) 
                else:
                    closest_shade = {'colour_name': None, 'hex_value': None}
                    color_match_score = None

                product_info = {
                    'name': product.name,
                    'brand': product.brand,
                    'closest_shade_name': closest_shade['colour_name'],
                    'closest_shade_hex': closest_shade['hex_value'],
                    'color_match_score': color_match_score,
                    'image_url': request.build_absolute_uri(product.api_featured_image), 
                    'match_score': cosine_similarities[i],
                    'id': product.product_id,
                    'type': product.product_type,
                    'description': product.description,

                    'no_talc': product.no_talc,
                    'sugar_free': product.sugar_free,
                    'peanut_free_product': product.peanut_free_product,
                    'cruelty_free': product.cruelty_free,
                    'silicone_free': product.silicone_free,
                    'gluten_free': product.gluten_free,
                    'chemical_free': product.chemical_free,
                    'dairy_free': product.dairy_free,
                    'water_free': product.water_free,
                    'hypoallergenic': product.hypoallergenic,
                    'vegan': product.vegan,
                    'non_gmo': product.non_gmo,
                    'ewg_verified': product.ewg_verified,
                    'oil_free': product.oil_free,
                    'alcohol_free': product.alcohol_free,
                    'organic': product.organic,
                    'fair_trade': product.fair_trade,
                    'natural': product.natural
                }
                product_data.append(product_info)

        return JsonResponse(product_data, safe=False)

        #return Response(serializer.data)
    
class ProductDetailView(APIView):
    def get(self, request, product_id, format=None):
        product = get_object_or_404(Product, product_id=product_id)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

def index(request):
    return render(request, 'build/index.html')

