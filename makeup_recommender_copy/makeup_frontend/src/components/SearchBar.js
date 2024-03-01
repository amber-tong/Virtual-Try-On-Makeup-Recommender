import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SearchBar({ onSearch }) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductPk, setSelectedProductPk] = useState(null);
    const [shades, setShades] = useState([]);
    const [shadeInput, setShadeInput] = useState('');
    const [displayShadeDropdown, setDisplayShadeDropdown] = useState(false);
    const [originalShades, setOriginalShades] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]); // New state for recommended products

    useEffect(() => {
        if (selectedProduct) {
            const fetchShades = async () => {
                try {
                    const response = await axios.get(`/api/shades/?product=${encodeURIComponent(selectedProduct)}`);
                    setOriginalShades(response.data);
                    setShades(response.data);
                } catch (error) {
                    console.error('Error fetching shades:', error);
                }
            };
            fetchShades();
        }
    }, [selectedProduct]);

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setInput(value);
        setShadeInput(''); // Reset shade input when searching for products
        setSelectedProduct(null); // Reset selected product

        if (value.length >= 1) {
            try {
                const response = await axios.get(`/api/search/?q=${value}`);
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion.name);
        setSelectedProduct(suggestion.name);
        setSelectedProductPk(suggestion.pk); // Setting the primary key of the selected product
        setSuggestions([]);
        onSearch(suggestion.name);//, suggestion.pk, suggestion.shade_name);
    };

    const handleShadeInputChange = (e) => {
        const value = e.target.value;
        setShadeInput(value);
        setDisplayShadeDropdown(true);
        
        // Filter the original list of shades based on the input value
        const filteredShades = originalShades.filter(shade =>
            shade.name.toLowerCase().includes(value.toLowerCase())
        );
        setShades(filteredShades); // Update the shades state with the filtered list
    };
    
    const handleShadeClick = async (shade) => {
        setShadeInput(shade.name);
        setDisplayShadeDropdown(false);
        onSearch(selectedProduct, selectedProductPk, shade.name);

        // Fetch recommended products based on selected product and shade
        try {
            const response = await axios.get(`http://localhost:8000/api/recommendations/?product_id=${selectedProductPk}`);
            setRecommendedProducts(response.data); // Update the state with the recommended products
        } catch (error) {
            console.error('Error fetching recommended products:', error);
        }
    };



    return (
        <div>
            <input
                type="text"
                placeholder="Search for makeup products..."
                value={input}
                onChange={handleInputChange}
            />
            {suggestions.length > 0 && (
                <ul>
                    {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}
            {selectedProduct && (
                <div>
                    <input
                        type="text"
                        placeholder="Select a shade..."
                        value={shadeInput}
                        onChange={handleShadeInputChange}
                        onFocus={() => setDisplayShadeDropdown(true)}
                    />
                    {displayShadeDropdown && (
                        <ul>
                            {shades.map((shade, index) => (
                                <li key={index} onClick={() => handleShadeClick(shade)}>
                                    {shade.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            
        </div>
    );
}

export default SearchBar;

