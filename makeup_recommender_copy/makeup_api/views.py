from django.shortcuts import render
import logging

# Configure logging at the top of your views.py file
logging.basicConfig(level=logging.INFO)



from django.http import Http404, JsonResponse
from .models import Product
from django.db.models import Q

from django.db.models import Count

import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download('punkt')  # Download necessary NLTK data

from nltk.tokenize import word_tokenize
from collections import defaultdict

# Create your views here.

def index(request):
    return render(request, 'build/index.html')


def product_search(request):
    query = request.GET.get('q', '')
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(shade_name__icontains=query) | Q(brand__icontains=query)
        )[:10]  # Limiting the results to 10
        results = [{'name': product.name, 'pk': product.pk, 'shade_name': product.shade_name} for product in products]
    else:
        results = []

    return JsonResponse(results, safe=False)

def fetch_shades(request):
    product_name = request.GET.get('product', '')
    if product_name:
        shades = Product.objects.filter(name=product_name).values_list('shade_name', flat=True).distinct()
        results = [{'name': shade} for shade in shades]
    else:
        results = []

    return JsonResponse(results, safe=False)

ingredient_aliases = defaultdict(lambda: None, {
    "aqua": "water",
    "beta-hydroxy acid": "salicylic acid",
    "BHA": "salicylic acid",
    "tocopherol": "vitamin E",
    "ascorbic acid": "vitamin C",
    "retinol": "vitamin A",
    "niacinamide": "vitamin B3",
    "panthenol": "provitamin B5",
    "hyaluronan": "hyaluronic acid",
    "sodium chloride": "salt",
    "ethylhexyl methoxycinnamate": "octinoxate",
    "octyl methoxycinnamate": "octinoxate",
    "butyl methoxydibenzoylmethane": "avobenzone",
    "ethylhexyl salicylate": "octisalate",
    "octyl salicylate": "octisalate",
    "zinc oxide": "CI 77947",
    "titanium dioxide": "CI 77891",
    "aloe barbadensis": "aloe vera",
    "argania spinosa": "argan oil",
    "melaleuca alternifolia": "tea tree oil",
    "cocos nucifera": "coconut oil",
    "olea europaea": "olive oil",
    "butyrospermum parkii": "shea butter",
    "tocopheryl acetate": "vitamin E acetate",
    "sodium laureth sulfate": "SLES",
    "sodium lauryl sulfate": "SLS",
    "DMDM hydantoin": "dimethylol dimethyl hydantoin",
    "ethylparaben": "ethyl p-hydroxybenzoate",
    "propylene glycol": "1,2-propanediol",
    "vegetable glycerin": "glycerol"
})


def standardize_ingredients(ingredient_list):
    standardized_list = []
    for ingredient in ingredient_list:
        alias = ingredient_aliases.get(ingredient.lower())
        if alias:
            standardized_list.append(alias)
        else:
            standardized_list.append(ingredient.lower())
    return standardized_list


def recommend_products(request):
    product_id = request.GET.get('product_id')
    try:
        selected_product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        raise Http404("Product does not exist")

    # Standardize ingredients for the selected product
    standardized_selected_ingredients = ' '.join(standardize_ingredients(selected_product.ingredients))

    selected_product_type = selected_product.type

    # Get all other products and standardize their ingredients
    all_products = Product.objects.all().exclude(pk=product_id)
    all_products = all_products.filter(type=selected_product_type)
    standardized_corpus = [' '.join(standardize_ingredients(p.ingredients)) for p in all_products]
    
    logging.info(f"standardized_corpus: {standardized_corpus}")

    # Initialize the vectorizer and transform the corpus into TF-IDF matrix
    vectorizer = TfidfVectorizer(tokenizer=word_tokenize)  # Tokenize the ingredients
    tfidf_matrix = vectorizer.fit_transform([standardized_selected_ingredients] + standardized_corpus)

    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Debugging: print or log the cosine similarities
    logging.info(f"Cosine Similarities: {cosine_similarities}")

    similar_indices = cosine_similarities.argsort()[-3:][::-1]
    similar_products = [all_products[int(i)] for i in similar_indices]

    # Debugging: print or log the similar products
    for i, product in zip(similar_indices, similar_products):
        logging.info(f"Product: {product.name}, Similarity: {cosine_similarities[i]}")

    product_data = [{
        'name': product.name,
        'brand': product.brand,
        'shade': product.shade_name,
        'image_url': request.build_absolute_uri(product.image.url), 
        'match_score': cosine_similarities[i]
    } for i, product in zip(similar_indices, similar_products)]

    return JsonResponse(product_data, safe=False)