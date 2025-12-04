"use client"

import { MailIcon, PhoneIcon, MapPinIcon } from "./icons"

const footerLinks = {
  "Sobre PixSoft": ["Quiénes somos", "Trabaja con nosotros", "Blog", "Centro de noticias"],
  Ayuda: ["Centro de ayuda", "Métodos de pago", "Envíos", "Devoluciones", "Garantías"],
  Legal: ["Términos y condiciones", "Política de privacidad", "Aviso de privacidad", "Cookies"],
}

const socialLinks = [
  { name: "Facebook", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "YouTube", href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-secondary/50 dark:bg-secondary/30 border-t border-border/50">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-slate-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-400 dark:to-slate-300 bg-clip-text text-transparent">
                PixSoft
              </span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Tu destino para hardware, computadoras, laptops y tecnología de calidad premium al mejor precio.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:contacto@pixsoft.mx"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <MailIcon className="w-5 h-5" />
                <span className="text-sm">contacto@pixsoft.mx</span>
              </a>
              <a
                href="tel:+528001234567"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
                <span className="text-sm">800 123 4567</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Ciudad de México, México</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Suscríbete a nuestro newsletter</h4>
              <p className="text-sm text-muted-foreground">Recibe ofertas exclusivas y novedades</p>
            </div>
            <div className="flex gap-3 max-w-md w-full lg:w-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
              />
              <button className="px-6 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 PixSoft. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
