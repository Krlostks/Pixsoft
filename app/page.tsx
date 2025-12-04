import { FeaturedProducts } from "@/components/featured-products"
import { BrandsSection } from "@/components/brands-section"
import { CategoriesSection } from "@/components/categories-section"
import { PromoBanners } from "@/components/promo-banners"
import { BestSellers } from "@/components/best-sellers"
import { FeaturesSection } from "@/components/features-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      
      <main>
        <FeaturedProducts />
        <BrandsSection />
        <CategoriesSection />
        <PromoBanners />
        <BestSellers />
        <FeaturesSection />
      </main>
    </div>
  )
}
