from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # Assuming you have an index view
    path('search/', views.ProductSearchView.as_view(), name='product_search'),
    path('fetch_shades/', views.FetchShadesView.as_view(), name='fetch_shades'),
    path('recommend_products/', views.RecommendProductsView.as_view(), name='recommend_products'),
]