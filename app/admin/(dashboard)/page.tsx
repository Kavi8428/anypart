export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Control brands, models, and platform settings.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-medium">Brands</h3>
          <p className="text-sm text-muted-foreground">Manage product brands</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-medium">Models</h3>
          <p className="text-sm text-muted-foreground">Manage product models</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-medium">Sellers</h3>
          <p className="text-sm text-muted-foreground">Manage sellers</p>
        </div>
      </div>
    </div>
  )
}
