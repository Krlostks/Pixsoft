import { Header } from "@/components/header"
import { FeaturedProducts } from "@/components/featured-products"
import { BrandsSection } from "@/components/brands-section"
import { CategoriesSection } from "@/components/categories-section"
import { PromoBanners } from "@/components/promo-banners"
import { BestSellers } from "@/components/best-sellers"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <FeaturedProducts />
        <BrandsSection />
        <CategoriesSection />
        <PromoBanners />
        <BestSellers />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
