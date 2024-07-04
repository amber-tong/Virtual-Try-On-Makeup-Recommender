import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import './App.css';
import axios from 'axios';
import WebcamStream from './components/WebcamStream';

function App() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedShade, setSelectedShade] = useState('');
    const [selectedProductImage, setSelectedProductImage] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [selectedShadeHex, setSelectedShadeHex] = useState(''); 
    const [tryOnProduct, setTryOnProduct] = useState([null]); 
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [productInfo, setProductInfo] = useState(null); 
    const [selectedProductType, setSelectedProductType] = useState('');

    useEffect(() => {
      if (tryOnProduct) {
        console.log('tryOnProduct has been updated:', tryOnProduct);
      }
    }, [tryOnProduct]); 

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

        // Reset states for recommended products and virtual try-on
        setRecommendedProducts([]); // Clears recommended products
        //setTryOnProduct(null); // Clears tryOnProduct, which should effectively reset the virtual try-on
        setLoading(true); 
        setProductInfo(null); 

        setSelectedProductType(product.product_type);

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

        if (selectedProduct && shadeName) {

            // Find the full color object for the selected shade
            const selectedColor = selectedProduct.product_colors.find(
                (color) => color.colour_name === shadeName
            );

            // Construct a product_info object similar to the structure of recommended products
            const newProductInfo = {
                name: selectedProduct.name,
                brand: selectedProduct.brand,
                closest_shade_name: selectedColor.colour_name,
                closest_shade_hex: selectedColor.hex_value,
                image_url: selectedProduct.api_featured_image,
                match_score: 1, 
                id: selectedProduct.id,
                type: selectedProduct.product_type,
                description: selectedProduct.description
            };

            setSelectedShade(shadeName);
            setSelectedShadeHex(shadeHex); 
            //setSelectedProductImage(selectedProduct.api_featured_image);
            //setTryOnProduct(productInfo);
            fetchRecommendedProducts(selectedProduct.id, shadeHex); // Pass the hex value
            setProductInfo(newProductInfo);
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

    // Call this when a product card is clicked
    const handleTryOnProductSelect = (product) => {
      if (product) {
        setSelectedProductId(product.id);
        // Determine which product data to use
        const productData = product.id === selectedProductId ? productInfo : product;
        console.log('Product ID selected for try-on:', product.id);
        console.log('Product selected for try-on:', productData);
        setTryOnProduct(productData);
        setLoading(false);
      } else {
        console.error('Product data is missing for try-on');
      }
    };

    return (
        <div className="App">
          <header className="App-header">
            <h1>Makeup Recommender</h1>
            <SearchBar onProductSelect={handleProductSelect} onColorSelect={handleShadeSelect} />

            {selectedProduct && selectedShade && (
                <div 
                    className={`selected-product-container ${selectedProductId === selectedProduct.id ? 'selected' : ''}`}
                    onClick={() => handleTryOnProductSelect(productInfo)}
                >
                <img src={selectedProduct.api_featured_image} alt={selectedProduct.name} />
                    
                    <p><b>Selected Product:</b> {selectedProduct.name}</p>
                    <p>
                        <b>Selected Shade: </b>
                        {selectedShade}
                        <span className="shade-color" style={{ backgroundColor: selectedShadeHex }}></span>
                    </p>
                </div>
             
            )}

            {recommendedProducts.length > 0 && (
              <div>
                <h3>Recommended Products:</h3>
                <div className="recommendations">
                  {recommendedProducts.map((product, index) => (
                    <div key={index} className={`recommendation-item ${selectedProductId === product.id ? 'selected-product' : ''}`} onClick={() => handleTryOnProductSelect(product)}>
                      <img src={product.image_url} alt={product.name} className="product-image" />
                      <div className="product-info">
                          <div className="product-name-container">
                              <p><b>{product.name}</b></p>
                          </div>
                          <p><b>Brand: </b>{capitalizeWords(product.brand)}</p>
                          <p>
                            <b>Shade: </b>{product.closest_shade_name}
                            <span className="shade-color" style={{ backgroundColor: product.closest_shade_hex }}></span>
                          </p>
                          <p><b>Ingredients-Based Match Score: </b>{product.match_score.toFixed(2)}</p>
                          <p><b>Shade Match Score: </b>{product.color_match_score ? parseFloat(product.color_match_score).toFixed(2) : 'Not available'}</p>
                          <p><b>Cruelty Free:</b> {product.cruelty_free ? 'Yes' : 'No'}</p>
                          <p><b>Silicone Free:</b> {product.silicone_free ? 'Yes' : 'No'}</p>
                          <p><b>Gluten Free:</b> {product.gluten_free ? 'Yes' : 'No'}</p>
                          <p><b>Hypoallergenic:</b> {product.hypoallergenic ? 'Yes' : 'No'}</p>
                          <p><b>Vegan:</b> {product.vegan ? 'Yes' : 'No'}</p>
                          <p><b>Organic:</b> {product.organic ? 'Yes' : 'No'}</p>

                          <p><b>Description: </b><ReadMore maxLength={100}>{product.description}</ReadMore></p>
                      </div>
                  </div>
                  ))}
                </div>

                <h1>Virtual Try-On</h1>
                {!loading && tryOnProduct && selectedProductType !== 'mascara' && selectedProductType !== 'nail_polish' ? (
                  <WebcamStream tryOnProduct={tryOnProduct} />
                ) : (
                  <p>No virtual try-on implemented yet for this product type.</p>
                )}
                <br></br><br></br>
              </div>
            )}

          </header>
        </div>
      );
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function ReadMore({ children, maxLength }) {
  const [isTruncated, setIsTruncated] = useState(true);
  const text = children;
  const resultString = isTruncated ? text.slice(0, maxLength) : text;

  function toggleIsTruncated() {
      setIsTruncated(!isTruncated);
  }

  return (
      <span>
          {resultString}
          {text.length > maxLength && (
              <span onClick={toggleIsTruncated} style={{ color: 'blue', cursor: 'pointer' }}>
                  {isTruncated ? '...Read more' : ' Read less'}
              </span>
          )}
      </span>
  );
}



export default App;
