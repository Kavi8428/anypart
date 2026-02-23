"use client"

import * as React from "react"
import Image from "next/image"
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
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveProduct, updateProduct } from "@/app/actions/products"
import { Loader2, Image as ImageIcon, Info, CreditCard } from "lucide-react"
import { PaymentForm } from "./payment-form"
import { normalizeImageUrl } from "@/lib/image-utils"

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
        seller_payments?: {
            order_id: string;
            amount: number;
            status_ref: { status: string };
            created_at: Date;
        } | null;
    } | null
    metaData: {
        pNames: { id: number; name: string; part_brand: number; p_brands: { id: number; name: string } }[]
        vModels: { id: number; name: string; year: number | null; v_brands: { name: string } }[]
        conditions: { id: number; status: string }[]
        tags: { id: number; name: string }[]
        vYears: { id: number; year: number }[]
        featuredPrice: number
    }
    onSuccess: (close?: boolean) => void
    onAddNew?: () => void
}

export function ProductForm({ initialData, metaData, onSuccess, onAddNew }: ProductFormProps) {
    const [submitAction, setSubmitAction] = React.useState<"save" | "next">("save")
    const formRef = React.useRef<HTMLFormElement>(null)
    const file1Ref = React.useRef<HTMLInputElement>(null)
    const file2Ref = React.useRef<HTMLInputElement>(null)
    const file3Ref = React.useRef<HTMLInputElement>(null)
    const [loading, setLoading] = React.useState(false)
    const [isFeatured, setIsFeatured] = React.useState(false)
    const [isPaid, setIsPaid] = React.useState(false)
    const [orderId, setOrderId] = React.useState<string | null>(null)
    const [paymentDetails, setPaymentDetails] = React.useState<{
        order_id: string;
        amount: number;
        status: string;
        created_at: Date;
    } | null>(null)
    const [activeTab, setActiveTab] = React.useState("basic")

    // Track validation states
    const [isBasicValid, setIsBasicValid] = React.useState(false)
    const [isImagesValid, setIsImagesValid] = React.useState(false)

    const [previews, setPreviews] = React.useState<{ [key: string]: string | null }>({
        img1: null,
        img2: null,
        img3: null,
    })

    const [productNameSearch, setProductNameSearch] = React.useState("")
    const [brandSearch, setBrandSearch] = React.useState("")
    const [vModelSearch, setVModelSearch] = React.useState("")

    // Name -> Brand -> p_names.id (submitted as p_name)
    const [selectedProductName, setSelectedProductName] = React.useState<string | null>(null)
    const [selectedBrandId, setSelectedBrandId] = React.useState<string | null>(null)
    const [selectedPNameId, setSelectedPNameId] = React.useState<string>("")
    const [selectedVModelId, setSelectedVModelId] = React.useState<string | null>(null)

    // Tag states
    const [tag1Search, setTag1Search] = React.useState("")
    const [tag2Search, setTag2Search] = React.useState("")
    const [tag3Search, setTag3Search] = React.useState("")

    const [selectedTag1Id, setSelectedTag1Id] = React.useState<string | null>(null)
    const [selectedTag2Id, setSelectedTag2Id] = React.useState<string | null>(null)
    const [selectedTag3Id, setSelectedTag3Id] = React.useState<string | null>(null)

    // Vehicle Year states
    const [vYearSearch, setVYearSearch] = React.useState("")
    const [selectedVYearId, setSelectedVYearId] = React.useState<string | null>(null)



    const uniqueBrands = React.useMemo(() => {
        const map = new Map<number, string>()
        for (const row of metaData.pNames) {
            if (row.p_brands) {
                map.set(row.p_brands.id, row.p_brands.name)
            }
        }
        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    }, [metaData.pNames])

    const filteredBrands = React.useMemo(() => {
        const q = (brandSearch || "").trim().toLowerCase()
        const results = q
            ? uniqueBrands.filter((b) => b.name && b.name.toLowerCase().includes(q))
            : uniqueBrands
        return results.slice(0, 100)
    }, [brandSearch, uniqueBrands])

    const filteredProductNames = React.useMemo(() => {
        if (!selectedBrandId) return []
        const q = (productNameSearch || "").trim().toLowerCase()

        // Filter pNames by selected brand
        const brandProducts = metaData.pNames.filter(
            p => p.p_brands.id.toString() === selectedBrandId
        )

        const results = q
            ? brandProducts.filter((n) => n.name && n.name.toLowerCase().includes(q))
            : brandProducts

        // Return unique names for display
        const unique = new Map<string, typeof brandProducts[0]>()
        for (const item of results) {
            unique.set(item.name, item)
        }
        return Array.from(unique.values()).slice(0, 100)
    }, [productNameSearch, selectedBrandId, metaData.pNames])

    const filteredVModels = React.useMemo(() => {
        const search = (vModelSearch || "").toLowerCase()
        const results = vModelSearch ?
            metaData.vModels.filter(item => item.v_brands.name && item.name && `${item.v_brands.name} ${item.name}`.toLowerCase().includes(search)) :
            metaData.vModels;
        return results.slice(0, 100);
    }, [metaData.vModels, vModelSearch])

    const getFilteredTags = React.useCallback((search: string) => {
        const q = (search || "").toLowerCase()
        const results = q
            ? metaData.tags.filter(t => t.name.toLowerCase().includes(q))
            : metaData.tags
        return results.slice(0, 100)
    }, [metaData.tags])

    const filteredVYears = React.useMemo(() => {
        if (!selectedVModelId) return []

        // Find the selected model object to get its name and brand
        const selectedModel = metaData.vModels.find(m => m.id.toString() === selectedVModelId)
        if (!selectedModel) return []

        // Find all year IDs for models with this name and brand
        const yearIds = metaData.vModels
            .filter(m => m.name === selectedModel.name && m.v_brands.name === selectedModel.v_brands.name)
            .map(m => m.year)
            .filter((y): y is number => y !== null)

        const modelYears = metaData.vYears.filter(y => yearIds.includes(y.id))
        const q = (vYearSearch || "").trim()

        const results = q
            ? modelYears.filter(y => y.year.toString().includes(q))
            : modelYears
        return results.slice(0, 100)
    }, [metaData.vYears, vYearSearch, selectedVModelId, metaData.vModels])





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

    const resetForm = React.useCallback(() => {
        // Reset all states
        setPreviews({ img1: null, img2: null, img3: null })
        setIsFeatured(false)
        setIsPaid(false)
        setSelectedProductName(null)
        setSelectedBrandId(null)
        setSelectedPNameId("")
        setProductNameSearch("")
        setBrandSearch("")
        setVModelSearch("")
        setSelectedVModelId(null)

        setTag1Search("")
        setTag2Search("")
        setTag3Search("")
        setSelectedTag1Id(null)
        setSelectedTag2Id(null)
        setSelectedTag3Id(null)

        setVYearSearch("")
        setSelectedVYearId(null)

        setOrderId(null)
        setPaymentDetails(null)
        setActiveTab("basic")

        // Reset form inputs
        if (formRef.current) formRef.current.reset()
        // Reset file inputs explicitly
        if (file1Ref.current) file1Ref.current.value = ""
        if (file2Ref.current) file2Ref.current.value = ""
        if (file3Ref.current) file3Ref.current.value = ""

        setTimeout(checkValidation, 0)
    }, [checkValidation])

    // Initialize states when metadata or initialData changes
    React.useEffect(() => {
        if (initialData) {
            setPreviews({
                img1: normalizeImageUrl(initialData.image_url_1),
                img2: normalizeImageUrl(initialData.image_url_2),
                img3: normalizeImageUrl(initialData.image_url_3),
            })
            setIsFeatured(initialData.is_featured === 1)

            // Check if there is a successful payment (Support both 'Success' and 'Completed')
            const pStatus = initialData.seller_payments?.status_ref?.status;
            if (initialData.seller_payments && (pStatus === 'Success' || pStatus === 'Completed')) {
                setIsPaid(true)
                setOrderId(initialData.seller_payments.order_id)
                setPaymentDetails({
                    order_id: initialData.seller_payments.order_id,
                    amount: initialData.seller_payments.amount,
                    status: pStatus,
                    created_at: initialData.seller_payments.created_at
                })
            } else {
                setIsPaid(false) // Or keep it false if implied
            }

            if (metaData.pNames.length > 0) {
                const row = metaData.pNames.find(p => p.id === initialData.p_name)
                if (row) {
                    setSelectedProductName(row.name)
                    setSelectedBrandId(row.p_brands.id.toString())
                    setSelectedPNameId(row.id.toString())
                    setProductNameSearch(row.name)
                    setBrandSearch(row.p_brands.name)
                }
            }

            const vModel = metaData.vModels.find(m => m.id === initialData.v_model)
            if (vModel) {
                setVModelSearch(`${vModel.v_brands.name} ${vModel.name}`)
                setSelectedVModelId(vModel.id.toString())
            }

            // Initialize tags
            const tag1 = metaData.tags.find(t => t.id === initialData.hash_tag_1)
            if (tag1) {
                setTag1Search(tag1.name)
                setSelectedTag1Id(tag1.id.toString())
            }

            const tag2 = metaData.tags.find(t => t.id === initialData.hash_tag_2)
            if (tag2) {
                setTag2Search(tag2.name)
                setSelectedTag2Id(tag2.id.toString())
            }

            const tag3 = metaData.tags.find(t => t.id === initialData.hash_tag_3)
            if (tag3) {
                setTag3Search(tag3.name)
                setSelectedTag3Id(tag3.id.toString())
            }

            const vYear = metaData.vYears.find(y => y.id === initialData.v_year)
            if (vYear) {
                setVYearSearch(vYear.year.toString())
                setSelectedVYearId(vYear.id.toString())
            }
        } else {
            // Reset all states
            setPreviews({ img1: null, img2: null, img3: null })
            setIsFeatured(false)
            setIsPaid(false)
            setSelectedProductName(null)
            setSelectedBrandId(null)
            setSelectedPNameId("")
            setProductNameSearch("")
            setBrandSearch("")
            setVModelSearch("")
            setSelectedVModelId(null)

            setTag1Search("")
            setTag2Search("")
            setTag3Search("")
            setSelectedTag1Id(null)
            setSelectedTag2Id(null)
            setSelectedTag3Id(null)

            setVYearSearch("")
            setSelectedVYearId(null)

            setOrderId(null)
            setPaymentDetails(null)
        }
        setTimeout(checkValidation, 0)
    }, [initialData, metaData.pNames, metaData.vModels, metaData.tags, metaData.vYears, checkValidation])

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
                // If we are editing, we usually don't support "Add Next" unless specifically requested.
                // But if "submitAction" is next, we treat it as "Update then Add New".
                await updateProduct(initialData.id, formData)
                // alert("Product updated successfully")
            } else {
                await saveProduct(formData)
                // alert("Product created successfully")
            }

            if (submitAction === "next") {
                onAddNew?.() // Clear parent selection
                onSuccess(false) // Keep dialog open
                resetForm() // Reset form
                // Ideally show toast here
            } else {
                onSuccess(true) // Close dialog
            }
        } catch (err) {
            console.error(err)
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
                                <Label htmlFor="v_model">Vehicle Model</Label>
                                <Combobox
                                    name="v_model"
                                    value={selectedVModelId}
                                    onValueChange={(val) => {
                                        setSelectedVModelId(val)
                                        const item = metaData.vModels.find(i => i.id.toString() === val)
                                        if (item) setVModelSearch(`${item.v_brands.name} ${item.name}`)

                                        // Reset year selection when model changes
                                        setSelectedVYearId(null)
                                        setVYearSearch("")

                                        setTimeout(checkValidation, 0)
                                    }}
                                >
                                    <ComboboxInput
                                        placeholder="Search model..."
                                        className="w-full"
                                        value={vModelSearch ?? ""}
                                        onChange={(e) => setVModelSearch(e.currentTarget.value)}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredVModels.map((item) => (
                                                <ComboboxItem key={item.id} value={item.id.toString()}>
                                                    {item.v_brands.name} {item.name}
                                                </ComboboxItem>
                                            ))}
                                            <ComboboxEmpty>No model found</ComboboxEmpty>
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="v_year">Vehicle Year</Label>
                                <Combobox
                                    name="v_year"
                                    value={selectedVYearId}
                                    onValueChange={(val) => {
                                        setSelectedVYearId(val)
                                        const item = metaData.vYears.find(y => y.id.toString() === val)
                                        if (item) setVYearSearch(item.year.toString())
                                        setTimeout(checkValidation, 0)
                                    }}
                                >
                                    <ComboboxInput
                                        placeholder={selectedVModelId ? "Search year..." : "Select vehicle model first"}
                                        className="w-full"
                                        value={vYearSearch ?? ""}
                                        onChange={(e) => setVYearSearch(e.currentTarget.value)}
                                        required
                                        disabled={!selectedVModelId}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredVYears.map((item) => (
                                                <ComboboxItem key={item.id} value={item.id.toString()}>
                                                    {item.year}
                                                </ComboboxItem>
                                            ))}
                                            <ComboboxEmpty>No year found</ComboboxEmpty>
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            <div className="space-y-2">
                                <Label>Product Brand</Label>
                                <Combobox
                                    name="part_brand_display"
                                    value={selectedBrandId}
                                    onValueChange={(val) => {
                                        // Brand chosen -> reset product name selection
                                        setSelectedBrandId(val)
                                        const brand = uniqueBrands.find(b => b.id.toString() === val)
                                        if (brand) setBrandSearch(brand.name)

                                        setSelectedProductName(null)
                                        setProductNameSearch("")
                                        setSelectedPNameId("")

                                        setTimeout(checkValidation, 0)
                                    }}
                                >
                                    <ComboboxInput
                                        placeholder={selectedVYearId ? "Select brand..." : "Select vehicle year first"}
                                        className="w-full"
                                        value={brandSearch ?? ""}
                                        onChange={(e) => setBrandSearch(e.currentTarget.value)}
                                        disabled={!selectedVYearId}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredBrands.map((b) => (
                                                <ComboboxItem key={b.id} value={b.id.toString()}>
                                                    {b.name}
                                                </ComboboxItem>
                                            ))}
                                            <ComboboxEmpty>No brands found</ComboboxEmpty>
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>

                            <div className="space-y-2">
                                {/* Submitted field */}
                                <input type="hidden" name="p_name" value={selectedPNameId} />

                                <Label>Product Name</Label>
                                <Combobox
                                    name="p_name_display"
                                    value={selectedProductName}
                                    onValueChange={(val) => {
                                        setSelectedProductName(val)
                                        // Since we already have selectedBrandId, we can find the exact p_name
                                        const row = metaData.pNames.find(r =>
                                            r.name === val &&
                                            r.p_brands.id.toString() === selectedBrandId
                                        )
                                        if (row) {
                                            setProductNameSearch(row.name)
                                            setSelectedPNameId(row.id.toString())
                                        }
                                        setTimeout(checkValidation, 0)
                                    }}
                                >
                                    <ComboboxInput
                                        placeholder={selectedBrandId ? "Search product..." : "Select brand first"}
                                        className="w-full"
                                        disabled={!selectedBrandId}
                                        value={productNameSearch ?? ""}
                                        onChange={(e) => setProductNameSearch(e.currentTarget.value)}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredProductNames.map((item) => (
                                                <ComboboxItem key={item.id} value={item.name}>
                                                    {item.name}
                                                </ComboboxItem>
                                            ))}
                                            <ComboboxEmpty>No product found</ComboboxEmpty>
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
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
                                    <Combobox
                                        name="hash_tag_1"
                                        value={selectedTag1Id}
                                        onValueChange={(val) => {
                                            setSelectedTag1Id(val)
                                            const item = metaData.tags.find(t => t.id.toString() === val)
                                            if (item) setTag1Search(item.name)
                                            setTimeout(checkValidation, 0)
                                        }}
                                    >
                                        <ComboboxInput
                                            placeholder="Search tag..."
                                            className="w-full h-9 text-xs"
                                            value={tag1Search ?? ""}
                                            onChange={(e) => setTag1Search(e.currentTarget.value)}
                                            required
                                        />
                                        <ComboboxContent>
                                            <ComboboxList>
                                                {getFilteredTags(tag1Search).map((item) => (
                                                    <ComboboxItem key={item.id} value={item.id.toString()} className="text-xs">
                                                        {item.name}
                                                    </ComboboxItem>
                                                ))}
                                                <ComboboxEmpty className="text-xs">No tags found</ComboboxEmpty>
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Secondary Tag</Label>
                                    <Combobox
                                        name="hash_tag_2"
                                        value={selectedTag2Id}
                                        onValueChange={(val) => {
                                            setSelectedTag2Id(val)
                                            const item = metaData.tags.find(t => t.id.toString() === val)
                                            if (item) setTag2Search(item.name)
                                            setTimeout(checkValidation, 0)
                                        }}
                                    >
                                        <ComboboxInput
                                            placeholder="Optional..."
                                            className="w-full h-9 text-xs"
                                            value={tag2Search ?? ""}
                                            onChange={(e) => setTag2Search(e.currentTarget.value)}
                                        />
                                        <ComboboxContent>
                                            <ComboboxList>
                                                <ComboboxItem value="none" className="text-xs text-muted-foreground italic">None</ComboboxItem>
                                                {getFilteredTags(tag2Search).map((item) => (
                                                    <ComboboxItem key={item.id} value={item.id.toString()} className="text-xs">
                                                        {item.name}
                                                    </ComboboxItem>
                                                ))}
                                                <ComboboxEmpty className="text-xs">No tags found</ComboboxEmpty>
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Tertiary Tag</Label>
                                    <Combobox
                                        name="hash_tag_3"
                                        value={selectedTag3Id}
                                        onValueChange={(val) => {
                                            setSelectedTag3Id(val)
                                            const item = metaData.tags.find(t => t.id.toString() === val)
                                            if (item) setTag3Search(item.name)
                                            setTimeout(checkValidation, 0)
                                        }}
                                    >
                                        <ComboboxInput
                                            placeholder="Optional..."
                                            className="w-full h-9 text-xs"
                                            value={tag3Search ?? ""}
                                            onChange={(e) => setTag3Search(e.currentTarget.value)}
                                        />
                                        <ComboboxContent>
                                            <ComboboxList>
                                                <ComboboxItem value="none" className="text-xs text-muted-foreground italic">None</ComboboxItem>
                                                {getFilteredTags(tag3Search).map((item) => (
                                                    <ComboboxItem key={item.id} value={item.id.toString()} className="text-xs">
                                                        {item.name}
                                                    </ComboboxItem>
                                                ))}
                                                <ComboboxEmpty className="text-xs">No tags found</ComboboxEmpty>
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
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
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={previews[key]!}
                                                    alt={`Preview ${num}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
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
                                    {/* <li>Images will be automatically renamed for uniqueness.</li> */}
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
                                <div className="flex gap-2">
                                    {!initialData && (
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            disabled={loading}
                                            onClick={() => setSubmitAction("next")}
                                        >
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save & Add Next
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        onClick={() => setSubmitAction("save")}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {initialData ? "Update Product" : "Save Product"}
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="payment">
                    {paymentDetails ? (
                        <div className="space-y-6">
                            <div className="rounded-lg border bg-green-50 p-6 text-green-900 shadow-sm">
                                <div className="flex items-center justify-between border-b border-green-200 pb-4 mb-6">
                                    <div className="flex items-center space-x-2">
                                        <CreditCard className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold">Payment Completed</span>
                                    </div>
                                    <span className="text-xl font-bold">LKR {paymentDetails.amount.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-green-700 uppercase font-semibold">Order ID</p>
                                        <p className="font-mono">{paymentDetails.order_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-700 uppercase font-semibold">Status</p>
                                        <p className="font-bold">{paymentDetails.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-700 uppercase font-semibold">Date</p>
                                        <p>{new Date(paymentDetails.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4 border-t mt-4">
                                <Button type="button" variant="outline" onClick={() => setActiveTab("images")}>
                                    Back
                                </Button>
                                <Button type="submit" variant="default" className="flex-1 ml-4" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Featured Product
                                </Button>
                                {!initialData && (
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        className="ml-2"
                                        disabled={loading}
                                        onClick={() => setSubmitAction("next")}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update & Add Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <PaymentForm
                                amount={metaData.featuredPrice}
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
                                    <div className="flex gap-2 ml-4 flex-1 justify-end">
                                        {!initialData && (
                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                disabled={loading}
                                                onClick={() => setSubmitAction("next")}
                                            >
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save & Add Next
                                            </Button>
                                        )}
                                        <Button type="submit" variant="default" disabled={loading} onClick={() => setSubmitAction("save")}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {initialData ? "Update Featured Product" : "Save Featured Product"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {isPaid && !paymentDetails && (
                                <p className="text-center text-green-600 text-sm mt-4 font-medium">
                                    ✓ Payment Successful! You can now save your product.
                                </p>
                            )}
                        </>
                    )}
                </TabsContent>
            </form>
        </Tabs>
    )
}
