import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SearchBar({ onProductSelect, onColorSelect }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductImage, setSelectedProductImage] = useState('');
  const [shades, setShades] = useState([]);
  const [shadeInput, setShadeInput] = useState('');
  const [displayShadeDropdown, setDisplayShadeDropdown] = useState(false);
  const [filteredShades, setFilteredShades] = useState([]);

  useEffect(() => {
    const filterShades = () => {
      if (!shadeInput) {
        setFilteredShades(shades); // When there's no input, show all shades
      } else {
        const matchedShades = shades.filter(shade =>
          shade.toLowerCase().startsWith(shadeInput.toLowerCase())
        );
        setFilteredShades(matchedShades);
      }
    };
  
    filterShades();
  }, [shadeInput, shades]); // Depend on both shadeInput and shades
  

  // Handle search input changes
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInput(value);
    setShadeInput(''); // Reset shade input when searching for products
    setSelectedProduct(null); // Reset selected product

    if (value.length >= 1) { // Fetch suggestions if input length is at least 1
      try {
        const response = await axios.get(`/api/search/?q=${encodeURIComponent(value)}`);
        // Filter suggestions to match the input value from the start
        //console.log('API Response:', response); // Log the full response object here
        const filteredSuggestions = response.data.filter(suggestion =>
            suggestion.name.toLowerCase().startsWith(value.toLowerCase())
        );
        //console.log('filtered Response:', filteredSuggestions); // Log the full response object here
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle clicking on a suggestion
    const handleSuggestionClick = async (suggestion) => {
        setInput(suggestion.name);
        setSelectedProduct(suggestion);
        //setSelectedProductImage(suggestion.api_featured_image);
        onProductSelect(suggestion); // Call the passed function with the selected product
        setSuggestions([]);
    
        // Fetch shades based on the selected product
        try {
        console.log('suggestion', suggestion);
        const response = await axios.get(`/api/products/${suggestion.product_id}`);
        console.log('response', response);
    
        // Ensure shadesArray is let or var so it can be reassigned
        let shadesArray = response.data.product_colors;
        if (typeof shadesArray === 'string') {
            shadesArray = JSON.parse(shadesArray);
        }
    
        // Check if product_colors is an array and log its content
        if (Array.isArray(shadesArray)) {
            // Extract the color names into a new array
            const shadeNames = shadesArray.map(shade => shade.colour_name);
            setShades(shadeNames); // Set the state with the new array of names
            console.log('colorNames', shadeNames);
        } else {
            // If product_colors is not an array, log a warning and reset shades
            console.warn('product_colors is not an array:', shadesArray);
            setShades([]); // Or handle accordingly if no colors are found
        }
        } catch (error) {
        console.error('Error fetching product details:', error);
        setShades([]); // In case of error, set an empty array to shades
        }
    };

  // Handle shade input changes
    const handleShadeInputChange = (e) => {
        const value = e.target.value//.trim().toLowerCase();
        setShadeInput(value);
        setDisplayShadeDropdown(true);
    
        // Filter shades to include only those starting with the input value
        const filtered = shades.filter(shade =>
        shade.toLowerCase().startsWith(value.toLowerCase())
        );
        setFilteredShades(filtered); // This ensures we're only showing the shades that start with the input value
    };

  // Handle clicking on a shade suggestion
  const handleShadeClick = (shadeName) => { // Corrected parameter to just the shade name
    setShadeInput(shadeName);
    setDisplayShadeDropdown(false);
    if (onColorSelect) {
      onColorSelect(shadeName); // Call the onColorSelect prop function
    }
  };
  
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for makeup products..."
        value={input}
        onChange={handleInputChange}
        className="search-input"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
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
            className="shade-input"
          />
          {displayShadeDropdown && filteredShades.length > 0 && (
            <ul className="shades-dropdown">
                {filteredShades.map((shade, index) => (
                    <li key={index} onClick={() => handleShadeClick(shade)}>
                        {shade}
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
