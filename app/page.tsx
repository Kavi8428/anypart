import { SiteHeader } from "@/components/public/site-header"
import { ProductGrid } from "@/components/public/product-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container flex-1 py-8">
        <h1 className="mb-6 text-2xl font-bold">Products</h1>
        <ProductGrid />
      </main>
    </div>
  )
}
