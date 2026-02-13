import {
    getBrands,
    getBrandDetails,
    getModelsByBrand,
    getYearsByModelName,
    getVModelDetails,
    getPartNamesByVModel,
    getPartDetails,
    getProductsByVModelAndPart,
    searchProducts
} from "@/app/actions/category";

import { BrandGrid } from "@/components/buyer/category/BrandGrid";
import { ModelGrid } from "@/components/buyer/category/ModelGrid";
import { YearGrid } from "@/components/buyer/category/YearGrid";
import { PartGrid } from "@/components/buyer/category/PartGrid";
import { ProductList } from "@/components/buyer/category/ProductList";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function CategoryPage({ searchParams }) {
    // Parse Search Params
    const params = await searchParams;
    const brandId = params.brandId ? parseInt(params.brandId) : null;
    const modelName = params.modelName ? decodeURIComponent(params.modelName) : null;
    const yearId = params.yearId ? parseInt(params.yearId) : null;
    const vModelId = params.vModelId ? parseInt(params.vModelId) : null;
    const partId = params.partId ? parseInt(params.partId) : null;
    const searchQuery = params.q ? decodeURIComponent(params.q) : null;

    // Determine Logic State
    let currentStep = 1;
    let title = "Select Your Vehicle Brand";
    let backLink = "/buyer/categories";

    // Fetch Data Context for Headers/Breadcrumbs
    let brandDetails = null;
    let vModelDetails = null;
    let partDetails = null;

    if (brandId) {
        brandDetails = await getBrandDetails(brandId);
        title = `Select Your Vehicle Model for ${brandDetails?.name || 'Vehicle'}`;
        currentStep = 2;
        backLink = "/buyer/categories";
    }

    if (brandId && modelName) {
        title = `Select Your Vehicle Year for ${brandDetails?.name} ${modelName}`;
        currentStep = 3;
        backLink = `/buyer/categories?brandId=${brandId}`;
    }

    if (vModelId) {
        vModelDetails = await getVModelDetails(vModelId);
        title = `Select Your Vehicle Part for ${brandDetails?.name} ${modelName} ${vModelDetails?.v_years?.year || ''}`;
        currentStep = 4;
        backLink = `/buyer/categories?brandId=${brandId}&modelName=${encodeURIComponent(modelName)}`;
    }

    if (vModelId && partId) {
        partDetails = await getPartDetails(partId);
        title = `${partDetails?.name || 'Products'} for ${brandDetails?.name} ${modelName} ${vModelDetails?.v_years?.year || ''}`;
        currentStep = 5;
        backLink = `/buyer/categories?brandId=${brandId}&modelName=${encodeURIComponent(modelName)}&yearId=${yearId}&vModelId=${vModelId}`;
    }

    // Check for Global Text Search (Overrides steps if present)
    if (searchQuery) {
        currentStep = 0; // State for Search Results
        title = `Search results for "${searchQuery}"`;
        if (brandId) {
            brandDetails = await getBrandDetails(brandId);
            title += ` in ${brandDetails?.name}`;
        }
        backLink = "/buyer";
    }

    // Fetch Data for Current Step Only
    let brands = [];
    let models = [];
    let years = [];
    let parts = [];
    let products = [];

    if (currentStep === 0) {
        products = await searchProducts(searchQuery, brandId);
    } else if (currentStep === 1) {
        brands = await getBrands();
        title = "Select your vehicle brand";
        backLink = null;
    } else if (currentStep === 2) {
        models = await getModelsByBrand(brandId);
    } else if (currentStep === 3) {
        years = await getYearsByModelName(brandId, modelName);
    } else if (currentStep === 4) {
        parts = await getPartNamesByVModel(vModelId, yearId);
    } else if (currentStep === 5) {
        products = await getProductsByVModelAndPart(vModelId, partId, yearId);
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section with Back Button */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/buyer/categories" className="hover:text-primary">Categories</Link>
                        {brandId && <><ChevronRight className="w-4 h-4" /> <Link href={`?brandId=${brandId}`} className="hover:text-primary">{brandDetails?.name}</Link></>}
                        {modelName && <><ChevronRight className="w-4 h-4" /> <Link href={`?brandId=${brandId}&modelName=${encodeURIComponent(modelName)}`} className="hover:text-primary">{modelName}</Link></>}
                        {vModelId && <><ChevronRight className="w-4 h-4" /> <Link href={`?brandId=${brandId}&modelName=${encodeURIComponent(modelName)}&yearId=${yearId}&vModelId=${vModelId}`} className="hover:text-primary">{vModelDetails?.v_years?.year}</Link></>}
                        {partId && <><ChevronRight className="w-4 h-4" /> <span className="text-gray-900 font-semibold">{partDetails?.name}</span></>}
                    </div>

                    <div className="flex items-center gap-4">
                        {backLink && (
                            <Link
                                href={backLink}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </Link>
                        )}
                        <div>
                            <h1 className="text-sm sm:text-base font-bold text-gray-900">{title}</h1>
                            {/* <p className="text-gray-500 text-sm sm:text-base mt-1">
                                {currentStep === 5 ? "Browse available parts below." : "Step " + currentStep + " of 5"}
                            </p> */}
                        </div>
                    </div>
                </div>

                {/* Content Section - Only one displayed at a time */}
                <div className="bg-white rounded-2xl min-h-[400px]">
                    {currentStep === 0 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {products.length > 0 ? (
                                <ProductList products={products} />
                            ) : (
                                <EmptyState message={`No products found for "${searchQuery}".`} />
                            )}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <BrandGrid brands={brands} selectedBrandId={brandId} />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {models.length > 0 ? (
                                <ModelGrid models={models} brandId={brandId} selectedModelName={modelName} />
                            ) : (
                                <EmptyState message="No models found for this brand." />
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {years.length > 0 ? (
                                <YearGrid years={years} brandId={brandId} modelName={modelName} selectedYearId={yearId} />
                            ) : (
                                <EmptyState message="No years found for this model." />
                            )}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {parts.length > 0 ? (
                                <PartGrid
                                    parts={parts}
                                    selectedPartId={partId}
                                    brandId={brandId}
                                    modelName={modelName}
                                    yearId={yearId}
                                    vModelId={vModelId}
                                />
                            ) : (
                                <EmptyState message="No parts categories found for this vehicle." />
                            )}
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <ProductList products={products} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-gray-500 font-medium">{message}</p>
            <Link href="/buyer/categories" className="mt-4 text-primary hover:underline text-sm font-medium">
                Start Over
            </Link>
        </div>
    );
}
