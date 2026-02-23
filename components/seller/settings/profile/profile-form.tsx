'use client';

import { useActionState, useState } from 'react';
import { updateSellerProfile } from '@/app/actions/seller-profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface SellerProfileData {
    name: string;
    br_number?: string | null;
    tel1: string;
    tel2?: string | null;
    address: string;
    district?: number | null;
    city?: number | null;
}

interface LocationData {
    districts: { id: number; name: string }[];
    cities: { id: number; name: string; district_id: number }[];
}

export function ProfileForm({ seller, locations }: { seller: SellerProfileData, locations: LocationData }) {
    const [state, formAction, isPending] = useActionState(updateSellerProfile, null);
    const [selectedDistrict, setSelectedDistrict] = useState(seller.district?.toString() || '');

    // Filter cities based on selected district
    const filteredCities = selectedDistrict
        ? locations.cities.filter((c) => c.district_id.toString() === selectedDistrict)
        : locations.cities;

    return (
        <form action={formAction}>
            <Card className="border-border">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your store details and public profile. The phone numbers here will be used for contact.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {state?.message && (
                        <div className={`p-4 rounded-md text-sm font-medium ${state.type === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Store Name <span className="text-destructive">*</span></Label>
                            <Input id="name" name="name" defaultValue={seller.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="br_number">BR Number (Optional)</Label>
                            <Input id="br_number" name="br_number" defaultValue={seller.br_number || ''} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tel1">Primary Phone <span className="text-destructive">*</span></Label>
                            <Input id="tel1" name="tel1" defaultValue={seller.tel1} required pattern="[0-9]{10}" title="10 digit phone number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tel2">Secondary Phone (Optional)</Label>
                            <Input id="tel2" name="tel2" defaultValue={seller.tel2 || ''} pattern="[0-9]{10}" title="10 digit phone number" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Full Address <span className="text-destructive">*</span></Label>
                        <Textarea id="address" name="address" defaultValue={seller.address} required className="min-h-[100px]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <select
                                id="district"
                                name="district"
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            >
                                <option value="">Select a district</option>
                                {locations.districts.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <select
                                id="city"
                                name="city"
                                defaultValue={seller.city || ''}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            >
                                <option value="">Select a city</option>
                                {filteredCities.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/40 p-4">
                    <Button type="submit" disabled={isPending} className="ml-auto w-full md:w-auto">
                        {isPending ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
