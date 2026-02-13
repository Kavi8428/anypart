"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveProduct, updateProduct } from "@/app/actions/products"
import { Loader2, Image as ImageIcon, Info, CreditCard } from "lucide-react"
import { PaymentForm } from "./payment-form"
import Image from "next/image"

interface ProductFormProps {
    initialData?: {
        id: number;
        p_name: number;
        v_model: number;
        v_year: number;
        price: number;
        condition: number;
        description: string;
        hash_tag_1: number;
        hash_tag_2: number;
        hash_tag_3: number;
        is_featured: number;
        image_url_1: string;
        image_url_2?: string;
        image_url_3?: string;
    } | null
    metaData: {
        pNames: { id: number; name: string }[]
        vModels: { id: number; name: string; v_brands: { name: string } }[]
        conditions: { id: number; status: string }[]
        tags: { id: number; name: string }[]
        vYears: { id: number; year: number }[]
    }
    onSuccess: () => void
}

export function ProductForm({ initialData, metaData, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = React.useState(false)
    const [isFeatured, setIsFeatured] = React.useState(false)
    const [isPaid, setIsPaid] = React.useState(false)
    const [orderId, setOrderId] = React.useState<string | null>(null)
    const [activeTab, setActiveTab] = React.useState("basic")

    // Track validation states
    const [isBasicValid, setIsBasicValid] = React.useState(false)
    const [isImagesValid, setIsImagesValid] = React.useState(false)

    const [previews, setPreviews] = React.useState<{ [key: string]: string | null }>({
        img1: null,
        img2: null,
        img3: null,
    })

    const formRef = React.useRef<HTMLFormElement>(null)
    const file1Ref = React.useRef<HTMLInputElement>(null)
    const file2Ref = React.useRef<HTMLInputElement>(null)
    const file3Ref = React.useRef<HTMLInputElement>(null)

    const checkValidation = React.useCallback(() => {
        if (!formRef.current) return
        const formData = new FormData(formRef.current)

        const basic = !!(
            formData.get('p_name') &&
            formData.get('v_model') &&
            formData.get('v_year') &&
            formData.get('price') &&
            formData.get('hash_tag_1')
        )

        // For images, we are valid if we have an existing image OR a newly selected one
        const hasImg1 = !!initialData?.image_url_1 || (file1Ref.current?.files?.length ?? 0) > 0

        setIsBasicValid(basic)
        setIsImagesValid(hasImg1)
    }, [initialData])

    React.useEffect(() => {
        if (initialData) {
            setIsFeatured(initialData.is_featured === 1)
            setIsPaid(initialData.is_featured === 1)
            setPreviews({
                img1: initialData.image_url_1 ? `/products/${initialData.image_url_1}` : null,
                img2: initialData.image_url_2 ? `/products/${initialData.image_url_2}` : null,
                img3: initialData.image_url_3 ? `/products/${initialData.image_url_3}` : null,
            })
            setTimeout(checkValidation, 0)
        } else {
            setIsFeatured(false)
            setIsPaid(false)
            setPreviews({ img1: null, img2: null, img3: null })
        }
    }, [initialData, checkValidation])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviews(prev => ({ ...prev, [key]: url }))
        } else {
            // If file is cleared, remove preview
            setPreviews(prev => ({ ...prev, [key]: null }))
        }
        checkValidation()
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isFeatured && !isPaid) {
            alert("Please complete the payment first")
            return
        }
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        // Ensure is_featured is sent as 1/0 for easier server handling
        formData.set('is_featured', isFeatured ? '1' : '0')
        if (orderId) formData.set('order_id', orderId)

        try {
            if (initialData) {
                await updateProduct(initialData.id, formData)
                alert("Product updated successfully")
            } else {
                await saveProduct(formData)
                alert("Product created successfully")
            }
            onSuccess()
        } catch {
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const showSaveButton = isBasicValid && isImagesValid && (!isFeatured || isPaid)

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Basic Info
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2" disabled={!isBasicValid}>
                    <ImageIcon className="h-4 w-4" />
                    Images
                </TabsTrigger>
                <TabsTrigger
                    value="payment"
                    className="flex items-center gap-2"
                    disabled={!isFeatured || !isImagesValid}
                >
                    <CreditCard className="h-4 w-4" />
                    Payment
                </TabsTrigger>
            </TabsList>

            <form ref={formRef} onSubmit={onSubmit} onChange={checkValidation}>
                {/* Hidden fields */}
                {orderId && <input type="hidden" name="order_id" value={orderId} />}

                <TabsContent value="basic" forceMount className="data-[state=inactive]:hidden space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="p_name">Product Name</Label>
                                <Select name="p_name" defaultValue={initialData?.p_name?.toString()} required onValueChange={checkValidation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metaData.pNames.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="v_model">Vehicle Model</Label>
                                <Select name="v_model" defaultValue={initialData?.v_model?.toString()} required onValueChange={checkValidation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metaData.vModels.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.v_brands.name} {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="v_year">Vehicle Year</Label>
                                <Select name="v_year" defaultValue={initialData?.v_year?.toString()} required onValueChange={checkValidation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metaData.vYears.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (LKR)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={initialData?.price}
                                    required
                                    onChange={checkValidation}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Select name="condition" defaultValue={initialData?.condition?.toString()} onValueChange={checkValidation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {metaData.conditions.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={initialData?.description}
                                rows={3}
                                onChange={checkValidation}
                            />
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <Label className="text-sm font-semibold">Categorization (Tags)</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 text-xs">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Primary Tag *</Label>
                                    <Select name="hash_tag_1" defaultValue={initialData?.hash_tag_1?.toString()} required onValueChange={checkValidation}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Primary" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {metaData.tags.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Secondary Tag</Label>
                                    <Select name="hash_tag_2" defaultValue={initialData?.hash_tag_2?.toString()} onValueChange={checkValidation}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Optional" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {metaData.tags.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Tertiary Tag</Label>
                                    <Select name="hash_tag_3" defaultValue={initialData?.hash_tag_3?.toString()} onValueChange={checkValidation}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Optional" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {metaData.tags.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border">
                            <input
                                type="checkbox"
                                id="is_featured"
                                name="is_featured"
                                checked={isFeatured}
                                onChange={(e) => {
                                    setIsFeatured(e.target.checked)
                                    if (!e.target.checked) {
                                        setIsPaid(false)
                                        setOrderId(null)
                                    }
                                    checkValidation()
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="is_featured" className="text-sm font-medium">Featured Product</Label>
                                <p className="text-xs text-muted-foreground">Boost your product to the top for a small fee.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            type="button"
                            disabled={!isBasicValid}
                            onClick={() => setActiveTab("images")}
                        >
                            Next: Images
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="images" forceMount className="data-[state=inactive]:hidden space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { num: 1, ref: file1Ref, key: 'img1' },
                            { num: 2, ref: file2Ref, key: 'img2' },
                            { num: 3, ref: file3Ref, key: 'img3' }
                        ].map(({ num, ref, key }) => {
                            const fieldName = `image_url_${num}`
                            return (
                                <div key={num} className="space-y-3">
                                    <Label className="text-xs font-semibold">Image {num} {num === 1 && '*'}</Label>
                                    <div
                                        onClick={() => ref.current?.click()}
                                        className="aspect-square relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors group"
                                    >
                                        {previews[key] ? (
                                            <Image
                                                src={previews[key]!}
                                                alt={`Preview ${num}`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="text-center p-2">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                                <span className="text-[10px] text-muted-foreground font-medium">Click to upload</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change Image</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={ref}
                                        name={fieldName}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, key)}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-amber-800">Automatic Image Processing</p>
                                <ul className="text-xs text-amber-700 list-disc list-inside space-y-1">
                                    <li>Images will be automatically renamed for uniqueness.</li>
                                    <li>Primary image (Image 1) is required to save.</li>
                                    <li>Recommended resolution: 800x800px or higher.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                            Back
                        </Button>
                        {isFeatured ? (
                            <Button
                                type="button"
                                disabled={!isImagesValid}
                                onClick={() => setActiveTab("payment")}
                            >
                                Next: Payment
                            </Button>
                        ) : (
                            showSaveButton && (
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {initialData ? "Update Product" : "Save Product"}
                                </Button>
                            )
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="payment">
                    <PaymentForm
                        amount={5000}
                        onSuccess={(pId) => {
                            setOrderId(pId)
                            setIsPaid(true)
                            checkValidation()
                        }}
                        disabled={isPaid}
                    />
                    <div className="flex justify-between pt-4 border-t mt-4">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("images")} disabled={loading || isPaid}>
                            Back
                        </Button>
                        {showSaveButton && (
                            <Button type="submit" variant="default" className="flex-1 ml-4" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Update Featured Product" : "Save Featured Product"}
                            </Button>
                        )}
                    </div>
                    {isPaid && (
                        <p className="text-center text-green-600 text-sm mt-4 font-medium">
                            ✓ Payment Successful! You can now save your product.
                        </p>
                    )}
                </TabsContent>
            </form>
        </Tabs>
    )
}
