import Link from "next/link"
import { ProductCard } from "@/components/buyer/ProductCard"
import { getFeaturedProducts } from "@/app/actions/buyer"
import { CategoryBar } from "@/components/buyer/CategoryBar"

export default async function BuyerHomePage() {
  // Fetch featured products from database
  const featuredProducts = await getFeaturedProducts()

  return (
    <>
      <CategoryBar />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Featured Products Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-base sm:text-sm font-bold font-heading text-gray-400 ">
            Featured Products
          </h2>
          <Link
            href="/buyer/products"
            className="text-xs sm:text-base text-primary font-bold hover:underline underline-offset-4 transition-all"
          >
            View All
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </>
  )
}
