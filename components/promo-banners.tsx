"use client"

import { ChevronRightIcon } from "./icons"

const banners = [
  {
    title: "KITS DE HERRAMIENTAS",
    headline: "¡MANTÉN TU PC EN FORMA!",
    description: "Herramientas para que tu equipo funcione sin problemas.",
    cta: "Ver más",
    image: "/placeholder.svg?height=300&width=400",
    gradient: "from-cyan-600 via-cyan-500 to-teal-500 dark:from-cyan-800 dark:via-slate-700 dark:to-slate-800",
  },
  {
    title: "DRONES",
    headline: "¡VUELA HACIA LO DESCONOCIDO!",
    description: "Captura vistas asombrosas desde el aire.",
    cta: "Ver más",
    image: "/placeholder.svg?height=300&width=400",
    gradient: "from-slate-700 via-slate-600 to-slate-500 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600",
  },
]

export function PromoBanners() {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r ${banner.gradient} shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]`}
            >
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-white/5 dark:bg-black/10" />

              <div className="relative flex items-center p-8 lg:p-10 min-h-[280px]">
                {/* Content */}
                <div className="flex-1 z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wider mb-3">
                    {banner.title}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{banner.headline}</h3>
                  <p className="text-white/90 mb-6 max-w-xs">{banner.description}</p>
                  <button className="group/btn flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl font-medium transition-all duration-300">
                    {banner.cta}
                    <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Image */}
                <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-center justify-center">
                  <img
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
