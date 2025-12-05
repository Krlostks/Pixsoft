import { PackageIcon, ShoppingCartIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyOrdersProps {
  title?: string
  description?: string
  showBackButton?: boolean
}

export default function EmptyOrders({ 
  title = "Aún no tienes pedidos", 
  description = "Realiza tu primera compra para ver tus pedidos aquí",
  showBackButton = true
}: EmptyOrdersProps) {
  return (
    <Card className="glass rounded-3xl">
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
          <PackageIcon className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/productos">
            <Button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-all duration-300">
              <ShoppingCartIcon className="w-4 h-4 mr-2" />
              Explorar Productos
            </Button>
          </Link>
          {showBackButton && (
            <Link href="/">
              <Button variant="outline" className="px-6 py-3 rounded-2xl font-medium">
                Volver al Inicio
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}