import { getProducts } from "@/app/actions/products";
import { ProductList } from "@/components/dashboard/products/product-list";

export default async function SellerProductsPage() {
  const products = await getProducts();

  const formattedProducts = products.map((item) => {
    let imageUrl = "/placeholder-product.png";
    if (item.image_url_1) {
      if (item.image_url_1.startsWith('http')) {
        imageUrl = item.image_url_1;
      } else {
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

