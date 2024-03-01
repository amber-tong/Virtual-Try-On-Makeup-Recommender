from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.product_search, name='product_search'),
    path('shades/', views.fetch_shades, name='fetch_shades'),
    path('recommendations/', views.recommend_products, name='recommend_products'),
]
