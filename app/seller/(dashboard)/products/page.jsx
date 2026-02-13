import { getProducts } from "@/app/actions/products";
import { ProductList } from "@/components/dashboard/products/product-list";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SellerProductsPage() {
  let products;
  try {
    products = await getProducts();
  } catch (error) {
    console.error('[Products Page] Error:', error);
    // If unauthorized, redirect to login
    if (error.message === 'Unauthorized') {
      redirect('/seller/login');
    }
    // For other errors, show a fallback
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <p className="text-red-500">Failed to load products. Please try again.</p>
        </div>
      </div>
    );
  }

  const formattedProducts = products.map((item) => {
    let imageUrl = "/placeholder-product.png";
    if (item.image_url_1) {
      if (item.image_url_1.startsWith('http')) {
        imageUrl = item.image_url_1;
      } else if (item.image_url_1.startsWith('/')) {
        // Already has a leading slash (e.g., '/products/img.jpg') — use as-is
        imageUrl = item.image_url_1;
      } else {
        // Just a filename (e.g., '1770994521030_y6tfs9f2_8204.jpg') — prepend path
        imageUrl = `/products/${item.image_url_1}`;
      }
    }

    return {
      id: item.id,
      p_name: item.p_name_ref.name,
      v_model: item.v_model_ref.name,
      v_brand: item.v_model_ref.v_brands.name,
      v_year: item.v_year_ref?.year || "Unknown",
      price: item.price,
      condition: item.condition_ref?.status || "Unknown",
      image_url: imageUrl,
      is_featured: item.is_featured,
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductList data={formattedProducts} rawProducts={products} />
      </div>
    </div>
  );
}

