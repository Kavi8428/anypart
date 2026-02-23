import { getSellerSession } from "@/lib/auth"
import { getSellerMetadata } from "@/app/actions/seller-meta"
import { ProfileForm } from "@/components/seller/settings/profile/profile-form"
import { redirect } from "next/navigation"

export default async function SellerSettingsPage() {
  const session = await getSellerSession();

  if (!session) {
    redirect('/seller/login');
  }

  // Fetch districts and cities metadata
  const locations = await getSellerMetadata();

  return (
    <div className="space-y-6 max-full py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your store&apos;s public profile and contact information.
        </p>
      </div>

      <ProfileForm seller={session.seller_details} locations={locations} />
    </div>
  )
}
