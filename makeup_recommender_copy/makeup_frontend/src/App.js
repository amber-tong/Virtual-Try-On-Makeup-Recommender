import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import './App.css';
import axios from 'axios';


function App() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedShade, setSelectedShade] = useState('');
    const [recommendedProducts, setRecommendedProducts] = useState([]); // State to store recommended products
    

    const handleSearch = async (product, productPk, shade) => {
        setSelectedProduct(product);
        console.log("Product1:", product)
        console.log("ProductPk1:", productPk)
        console.log("shade1:", shade)
        setSelectedShade(shade);
        console.log("Product:", product)
        console.log("ProductPk:", productPk)
        console.log("shade:", shade)

        // Check if both product and shade are selected before fetching recommended products
        if (selectedProduct) {// && selectedShade) {
            fetchRecommendedProducts(productPk, shade);
            console.log("MewProduct:", product)
            console.log("NewProductPk:", productPk)
            console.log("Newshade:", shade)
        }
    };

    // Function to fetch recommended products
    const fetchRecommendedProducts = async (productId, shade) => {
        try {
            console.log()
            // Update your API endpoint to handle shade if necessary
            const response = await axios.get(`http://localhost:8000/api/recommendations/?product_id=${productId}&shade=${shade}`);
            setRecommendedProducts(response.data);
            console.log("recommendedProducts:", recommendedProducts)
        } catch (error) {
            console.error('Error fetching recommended products:', error);
        }
    };

    // In the return statement of your App.js, display the recommended products below.
    return (
        <div className="App">
        <header className="App-header">
            <h1>Makeup Recommender</h1>
            <SearchBar onSearch={handleSearch} />
            {recommendedProducts.length > 0 && (
                <div className="selected-product-container">
                    <img src={"media/product_images/LashParadise.png"} alt="Selected Product" />
                    <div className="selected-product-details">
                        <p><b>Selected Product:</b> {selectedProduct}</p>
                        <p><b>Selected Shade:</b> {selectedShade}</p>
                    </div>
                </div>
            )}
            {recommendedProducts.length > 0 && (
                        <h3>Recommended Products:</h3>
            )}
            {recommendedProducts.length > 0 && (
                    <div className="recommendations">
                        <div className="recommendations product-container">
                            {recommendedProducts.map((product, index) => (
                                <div key={index} className="recommendation-item">
                                    <img src={product.image_url} alt={product.name} className="product-image" />
                                    <div className="product-info">
                                        <p><b>{product.name}</b></p>
                                        <p>Brand: {product.brand}</p>
                                        <p>Shade: {product.shade}</p>
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