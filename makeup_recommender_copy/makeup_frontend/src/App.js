import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import './App.css';
import axios from 'axios';

function App() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedShade, setSelectedShade] = useState('');
    const [selectedProductImage, setSelectedProductImage] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [selectedShadeHex, setSelectedShadeHex] = useState(''); // Add this state to store the hex value

    // This function is called from the SearchBar when a product is selected
    const handleProductSelect = (product) => {
        // Parse the JSON string into an array if it's a string
        const productColors = typeof product.product_colors === 'string' 
        ? JSON.parse(product.product_colors) 
        : product.product_colors;

        // Set the selected product with parsed colors
        setSelectedProduct({ ...product, product_colors: productColors });
        setSelectedShade(null); // Reset shade when a new product is selected
        setSelectedProductImage(null); //Reset image since we don't have a selected shade yet
    };

    // This function is called from the SearchBar when a shade is selected
    const handleShadeSelect = (shadeName) => {
        let shadeHex = ''; // Default to an empty string if no color is found

        // Find the hex value from the selected product's colors
        console.log("product_colors", selectedProduct.product_colors);
        // Make sure selectedProduct is defined and product_colors is an array
        if (selectedProduct && Array.isArray(selectedProduct.product_colors)) {
            const shadeData = selectedProduct.product_colors.find(color => color.colour_name === shadeName);
            if (shadeData) {
            shadeHex = shadeData.hex_value;
            }
        } else {
            console.error('Selected product is not defined or product_colors is not an array');
        }

        setSelectedShade(shadeName);
        setSelectedShadeHex(shadeHex); // Set the hex value in state

        if (selectedProduct && shadeName) {
            setSelectedProductImage(selectedProduct.api_featured_image);
            fetchRecommendedProducts(selectedProduct.id, shadeHex); // Pass the hex value
        }
    };

    // Fetch recommended products based on the selected product and shade
    const fetchRecommendedProducts = async (productId, selectedShadeHex) => {
        try {
            // Make sure to adjust the API endpoint and parameters according to your backend setup
            const response = await axios.get(`http://localhost:8000/api/recommend_products/`, {
                params: { product_id: productId, shade_hex: selectedShadeHex },
        });
            console.log("NEW", response.data);  // Log the response data
            setRecommendedProducts(response.data);
        } catch (error) {
            console.error('Error fetching recommended products:', error);
            setRecommendedProducts([]);
        }
    };

    return (
        <div className="App">
          <header className="App-header">
            <h1>Makeup Recommender</h1>
            <SearchBar onProductSelect={handleProductSelect} onColorSelect={handleShadeSelect} />

            {selectedProduct && selectedShade && (
              <div className="selected-product-container">
                <img src={selectedProduct.api_featured_image} alt={selectedProduct.name} />
                    <div className="selected-product-details">
                        <p><b>Selected Product:</b> {selectedProduct.name}</p>
                        <p><b>Selected Shade:</b> {selectedShade}</p>
                    </div>
              </div>
            )}

            {recommendedProducts.length > 0 && (
              <div>
                <h3>Recommended Products:</h3>
                <div className="recommendations">
                  {recommendedProducts.map((product, index) => (
                    <div key={index} className="recommendation-item">
                        <img src={product.image_url} alt={product.name} className="product-image" />
                        <div className="product-info">
                            <p><b>{product.name}</b></p>
                            <p>Brand: {product.brand}</p>
                            <p>Shade: {product.closest_shade_name}</p>
                            <p>Match Score: {product.match_score.toFixed(2)}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </header>
        </div>
      );
}

export default App;
