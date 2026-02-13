import Link from "next/link"

type Product = {
  id: string
  name: string
  description?: string
  price?: string
  image?: string
}

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent/50"
    >
      <div className="aspect-square w-full bg-muted" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium leading-tight">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
        {product.price && (
          <p className="mt-auto text-sm font-medium">{product.price}</p>
        )}
      </div>
    </Link>
  )
}
