import { getProductDetails, getBuyerCredits, getBuyerDetails } from "@/app/actions/buyer"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, ShoppingCart, Phone, Mail, MapPin, Package, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatWithSellerButton } from "@/components/buyer/ChatWithSellerButton"

export default async function ProductViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
        notFound()
    }

    const product = await getProductDetails(productId)
    const credits = await getBuyerCredits()
    const buyer = await getBuyerDetails()

    if (!product) {
        notFound()
    }

    // Format data
    const partName = product.p_name_ref?.name || "Unknown Part"
    const brandName = product.v_model_ref?.v_brands?.name || "Unknown Brand"
    const modelName = product.v_model_ref?.name || "Unknown Model"
    const year = product.v_year_ref?.year || product.v_model_ref?.v_years?.year
    const condition = product.condition_ref?.status || "Not Specified"
    const partBrand = product.p_name_ref?.p_brands?.name

    const images = [
        product.image_url_1,
        product.image_url_2,
        product.image_url_3,
    ].filter(Boolean)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-6xl">
                {/* Back Button */}
                <Link
                    href="/buyer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-primary transition-colors mb-3 sm:mb-4"
                >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Image Gallery */}
                    <div className="space-y-2 sm:space-y-3">
                        <div className="aspect-square relative bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            {images.length > 0 ? (
                                <Image
                                    src={`/products/${images[0]}`}
                                    alt={partName}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <Package className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-3 gap-2">
                                {images.slice(1).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square relative bg-white rounded-md overflow-hidden border border-gray-200"
                                    >
                                        <Image
                                            src={`/products/${img}`}
                                            alt={`${partName} ${idx + 2}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3 sm:space-y-4">
                        {/* Title & Price */}
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                                {partName}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">
                                {year ? `${year} • ` : ""}{brandName} • {modelName}
                            </p>
                            {partBrand && (
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                    Part Brand: <span className="font-semibold text-gray-600">{partBrand}</span>
                                </p>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-xs text-gray-600">(0 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20">
                            <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5">Price</p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-primary">
                                Rs. {product.price.toLocaleString()}
                            </p>
                        </div>

                        {/* Product Details */}
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 space-y-2 sm:space-y-3">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">Product Details</h3>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                <div className="flex items-start gap-2">
                                    <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-gray-500">Condition</p>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900">{condition}</p>
                                    </div>
                                </div>

                                {year && (
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-500">Year</p>
                                            <p className="text-xs sm:text-sm font-semibold text-gray-900">{year}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Tag className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    {[product.hash_tag_1_ref, product.hash_tag_2_ref, product.hash_tag_3_ref]
                                        .filter(Boolean)
                                        .map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium rounded-full"
                                            >
                                                {tag?.name}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && product.description !== "Description" && (
                            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2">Description</h3>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">{product.description}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button className="flex-1 bg-primary hover:bg-primary/90 text-white h-9 sm:h-10 text-xs sm:text-sm font-bold rounded-lg">
                                <ShoppingCart className="w-4 h-4 mr-1.5" />
                                Add to Cart
                            </Button>
                            <ChatWithSellerButton
                                productId={productId}
                                isSignedIn={!!buyer}
                                hasCredits={credits > 0}
                                isUnlocked={(product as any).isUnlocked || false}
                            />
                        </div>


                        {/* Seller Info */}

                    </div>
                </div>
            </div>
        </div>
    )
}
