"use client"

import { ComputerDesktopIcon, CpuChipIcon, DevicePhoneMobileIcon, PrinterIcon } from "./icons"

const categories = [
  {
    name: "Tarjetas de Video",
    icon: CpuChipIcon,
    image: "/placeholder.svg?height=200&width=200",
    count: 234,
    gradient: "from-cyan-500 to-blue-500 dark:from-cyan-700 dark:to-slate-700",
  },
  {
    name: "Laptops",
    icon: ComputerDesktopIcon,
    image: "/placeholder.svg?height=200&width=200",
    count: 156,
    gradient: "from-purple-500 to-pink-500 dark:from-purple-700 dark:to-slate-700",
  },
  {
    name: "Monitores",
    icon: ComputerDesktopIcon,
    image: "/placeholder.svg?height=200&width=200",
    count: 89,
    gradient: "from-emerald-500 to-teal-500 dark:from-emerald-700 dark:to-slate-700",
  },
  {
    name: "Celulares",
    icon: DevicePhoneMobileIcon,
    image: "/placeholder.svg?height=200&width=200",
    count: 178,
    gradient: "from-amber-500 to-orange-500 dark:from-amber-700 dark:to-slate-700",
  },
  {
    name: "Procesadores",
    icon: CpuChipIcon,
    image: "/placeholder.svg?height=200&width=200",
    count: 67,
    gradient: "from-rose-500 to-red-500 dark:from-rose-700 dark:to-slate-700",
  },
  {
    name: "Impresoras",
    icon: PrinterIcon,
    image: "/placeholder.svg?height=200&width=200",
    count: 112,
    gradient: "from-indigo-500 to-violet-500 dark:from-indigo-700 dark:to-slate-700",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Categorías <span className="text-primary">destacadas</span>
            </h2>
            <p className="text-muted-foreground mt-1">Explora nuestras categorías más populares</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category) => (
            <a
              key={category.name}
              href="#"
              className="group relative overflow-hidden rounded-3xl aspect-square glass hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Image */}
              <div className="absolute inset-0 p-4">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white font-semibold text-sm lg:text-base">{category.name}</h3>
                <span className="text-white/80 text-xs">{category.count} productos</span>
              </div>

              {/* Default Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-foreground font-medium text-sm text-center truncate">{category.name}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
