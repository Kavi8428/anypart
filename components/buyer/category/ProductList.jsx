"use client";

import { ProductCard } from "@/components/buyer/ProductCard";

export function ProductList({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="mt-8 p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <h3 className="text-gray-500 font-medium">No products found for this category.</h3>
                <p className="text-gray-400 text-sm mt-1">Try selecting a different year or part.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    id={product.id.toString()}
                    title={product.p_name_ref.name}
                    makeModel={`${product.v_year_ref?.year || product.v_model_ref.v_years?.year || ''} • ${product.v_model_ref.v_brands.name} • ${product.v_model_ref.name}`.toUpperCase()}
                    price={product.price}
                    rating={5.0} // Placeholder as rating isn't in seller_products schema clearly or is separate
                    reviewsCount={10} // Placeholder
                    imageUrl={product.image_url_1 ? `/products/${product.image_url_1}` : undefined}
                />
            ))}
        </div>
    );
}
