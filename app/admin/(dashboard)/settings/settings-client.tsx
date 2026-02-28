"use client"

import { useTransition } from "react"
import { updateAppDetails } from "@/app/actions/admin"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SettingsClient({ data }: { data: any }) {
    const [isPending, startTransition] = useTransition()

    async function onSubmit(formData: FormData) {
        startTransition(async () => {
            const updateData = {
                name: formData.get("name") as string,
                address: formData.get("address") as string,
                logo_url: formData.get("logo_url") as string,
                br_number: formData.get("br_number") as string,
                tel1: formData.get("tel1") as string,
                tel2: formData.get("tel2") as string,
                fb_link: formData.get("fb_link") as string,
                tiktok_link: formData.get("tiktok_link") as string,
                bio: formData.get("bio") as string,
            }
            await updateAppDetails(data?.id, updateData)
            alert("Settings updated successfully!")
        })
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form action={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">App Name</Label>
                            <Input id="name" name="name" defaultValue={data?.name || "anypart.lk"} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo_url">Logo URL</Label>
                            <Input id="logo_url" name="logo_url" defaultValue={data?.logo_url || ""} />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" name="address" defaultValue={data?.address || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="br_number">BR Number</Label>
                            <Input id="br_number" name="br_number" defaultValue={data?.br_number || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tel1">Telephone 1 (Primary)</Label>
                            <Input id="tel1" name="tel1" defaultValue={data?.tel1 || ""} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tel2">Telephone 2</Label>
                            <Input id="tel2" name="tel2" defaultValue={data?.tel2 || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fb_link">Facebook Link</Label>
                            <Input id="fb_link" name="fb_link" defaultValue={data?.fb_link || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tiktok_link">TikTok Link</Label>
                            <Input id="tiktok_link" name="tiktok_link" defaultValue={data?.tiktok_link || ""} />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" name="bio" defaultValue={data?.bio || ""} />
                        </div>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Settings"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
