"use client"

import { TruckIcon, ShieldCheckIcon, CreditCardIcon, PhoneIcon } from "./icons"

const features = [
  {
    icon: TruckIcon,
    title: "Envío Gratis",
    description: "En compras mayores a $999",
  },
  {
    icon: ShieldCheckIcon,
    title: "Compra Segura",
    description: "Tus datos siempre protegidos",
  },
  {
    icon: CreditCardIcon,
    title: "Hasta 18 MSI",
    description: "Con tarjetas participantes",
  },
  {
    icon: PhoneIcon,
    title: "Soporte 24/7",
    description: "Estamos para ayudarte",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass rounded-3xl p-6 lg:p-8 text-center hover:shadow-xl transition-all duration-500 hover:scale-105"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
