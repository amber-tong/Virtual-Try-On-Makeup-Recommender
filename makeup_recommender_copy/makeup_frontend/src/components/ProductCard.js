import React from 'react';


function ProductCard({ product }) {
    return (
        <div className="product-card">
            <img src={product.image_url} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.shade_name}</p>
        </div>
    );
}


export default ProductCard;
