"use client"

const brands = [
  { name: "ASUS", logo: "/asus-logo-black-simple.jpg" },
  { name: "MSI", logo: "/msi-logo-simple.jpg" },
  { name: "NZXT", logo: "/nzxt-logo-simple.jpg" },
  { name: "AMD", logo: "/amd-logo-simple.jpg" },
  { name: "Samsung", logo: "/samsung-logo-simple.jpg" },
  { name: "Acer", logo: "/acer-logo-simple.jpg" },
  { name: "HP", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Intel", logo: "/placeholder.svg?height=60&width=120" },
]

export function BrandsSection() {
  return (
    <section className="py-12 lg:py-16 bg-secondary/30 dark:bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Trabajamos con las <span className="text-primary">mejores marcas</span>
          </h2>
          <p className="text-muted-foreground mt-2">Calidad garantizada en todos nuestros productos</p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-[scroll_30s_linear_infinite] gap-12 items-center">
            {[...brands, ...brands].map((brand, index) => (
              <div key={`${brand.name}-${index}`} className="flex-shrink-0 group cursor-pointer">
                <div className="w-32 h-16 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 hover:scale-110">
                  <img
                    src={brand.logo || "/placeholder.svg"}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain dark:invert dark:opacity-80"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}
