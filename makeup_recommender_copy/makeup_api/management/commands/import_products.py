from django.core.management.base import BaseCommand
from makeup_api.models import Product
import csv
import json
from decimal import Decimal, InvalidOperation

# Helper function to convert 'Yes'/'No' strings to boolean
def str_to_bool(s):
    return s.lower() in ['yes', 'true', '1']

class Command(BaseCommand):
    help = 'Import products from a CSV file into the Product model'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The CSV file path')

    def handle(self, *args, **kwargs):
        csv_file_path = kwargs['csv_file']
        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Parse the 'product_colors' field
                color_names = row['product_colors/colour_name'].split(';') if row['product_colors/colour_name'] else []
                hex_values = row['product_colors/hex_value'].split(';') if row['product_colors/hex_value'] else []
                product_colors = [{'colour_name': name.strip(), 'hex_value': hex_value.strip()}
                                  for name, hex_value in zip(color_names, hex_values) if name and hex_value]
                # Make sure that product_colors is set to an empty list rather than None when no colors are available
                product_colors_json = json.dumps(product_colors) if product_colors else '[]'

                try:
                    price = Decimal(row['price']) if row['price'] else None
                except InvalidOperation:
                    price = None
                    
                product_id = int(row['id'])  # This converts the 'id' from the CSV into an integer
                #print(f"Importing product with ID: {product_id}")  # Add this to check the ID
                
                # Now product_colors should be a list of dictionaries in the desired format
                # Create or update the product instance
                product, created = Product.objects.update_or_create(
                    #product_id=row['id'],  # Corrected line: use the column name as it appears in the CSV\
                    product_id = product_id,
                    defaults={
                        'api_featured_image': row['api_featured_image'],
                        'brand': row['brand'],
                        'category': row['category'],
                        'currency': row['currency'],
                        'description': row['description'],
                        'name': row['name'],
                        'price': price,
                        'price_sign': row['price_sign'],
                        'product_api_url': row['product_api_url'],
                        'product_link': row['product_link'],
                        'product_type': row['product_type'],
                        'website_link': row['website_link'],
                        #'product_colors': json.dumps(product_colors) if product_colors else None,
                        'product_colors': product_colors_json,
                        # Boolean fields as True/False based on CSV values
                        # Convert 'Yes'/'No' strings to boolean
                        'no_talc': str_to_bool(row['no_talc']),
                        'sugar_free': str_to_bool(row['sugar_free']),
                        'peanut_free_product': str_to_bool(row['peanut_free_product']),
                        'cruelty_free': str_to_bool(row['cruelty_free']),
                        'silicone_free': str_to_bool(row['silicone_free']),
                        'gluten_free': str_to_bool(row['gluten_free']),
                        'chemical_free': str_to_bool(row['chemical_free']),
                        'dairy_free': str_to_bool(row['dairy_free']),
                        'water_free': str_to_bool(row['water_free']),
                        'hypoallergenic': str_to_bool(row['hypoallergenic']),
                        'vegan': str_to_bool(row['vegan']),
                        'ecocert': str_to_bool(row['ecocert']),
                        'purpicks': str_to_bool(row['purpicks']),
                        'non_gmo': str_to_bool(row['non_gmo']),
                        'certclean': str_to_bool(row['certclean']),
                        'ewg_verified': str_to_bool(row['ewg_verified']),
                        'oil_free': str_to_bool(row['oil_free']),
                        'alcohol_free': str_to_bool(row['alcohol_free']),
                        'canadian': str_to_bool(row['canadian']),
                        'organic': str_to_bool(row['organic']),
                        'usda_organic': str_to_bool(row['usda_organic']),
                        'fair_trade': str_to_bool(row['fair_trade']),
                        'natural': str_to_bool(row['natural']),
                        'ingredients': row.get('ingredients', ''),
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Product {product.name} created successfully.'))
                else:
                    self.stdout.write(self.style.WARNING(f'Product {product.name} updated.'))

            self.stdout.write(self.style.SUCCESS('Import completed successfully.'))