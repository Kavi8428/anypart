export default function SellerDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      <p className="text-muted-foreground">
        Manage your products, orders, and store settings.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-medium">Products</h3>
          <p className="text-sm text-muted-foreground">Add, edit, delete products</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-medium">Orders</h3>
          <p className="text-sm text-muted-foreground">View and manage orders</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-medium">Settings</h3>
          <p className="text-sm text-muted-foreground">Store and profile settings</p>
        </div>
      </div>
    </div>
  )
}
