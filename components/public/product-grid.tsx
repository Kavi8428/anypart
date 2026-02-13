import { ProductCard } from "./product-card"

type Product = {
  id: string
  name: string
  description?: string
  price?: string
  image?: string
}

type ProductGridProps = {
  products?: Product[]
}

export function ProductGrid({ products = [] }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No products yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Products from AnyPart.lk will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
