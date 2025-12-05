"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StarIcon, ThumbsUpIcon, MessageSquareIcon, PenLineIcon } from "lucide-react"
import { Opinion, OpinionEstadisticas } from "@/types/opiniones"

interface ProductReviewsProps {
  opiniones: Opinion[];
  promedioCalificacion: number;
  estadisticas?: OpinionEstadisticas | null;
}


export function ProductReviews({ promedioCalificacion, opiniones, estadisticas }: ProductReviewsProps) {
 {
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const totalResenas = estadisticas?.total_opiniones ?? opiniones.length
  const distribucionCalificaciones = estadisticas
    ? [
        { estrellas: 5, porcentaje: Math.round((estadisticas.cinco_estrellas / totalResenas) * 100), cantidad: estadisticas.cinco_estrellas },
        { estrellas: 4, porcentaje: Math.round((estadisticas.cuatro_estrellas / totalResenas) * 100), cantidad: estadisticas.cuatro_estrellas },
        { estrellas: 3, porcentaje: Math.round((estadisticas.tres_estrellas / totalResenas) * 100), cantidad: estadisticas.tres_estrellas },
        { estrellas: 2, porcentaje: Math.round((estadisticas.dos_estrellas / totalResenas) * 100), cantidad: estadisticas.dos_estrellas },
        { estrellas: 1, porcentaje: Math.round((estadisticas.una_estrella / totalResenas) * 100), cantidad: estadisticas.una_estrella },
      ]
    : []

  const handleSubmitReview = () => {
    // Aquí iría la lógica para enviar la reseña
    console.log({ calificacion: selectedRating, comentario })
    setDialogOpen(false)
    setSelectedRating(0)
    setComentario("")
  }

  return (
    <div className="space-y-8">
      {/* Header con resumen y botón */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Resumen de calificación */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-4 lg:gap-2 p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-slate-800 dark:to-slate-900/50 border border-cyan-200/50 dark:border-slate-700/50 lg:min-w-[200px]">
          <div className="text-center">
            <span className="text-5xl lg:text-6xl font-bold text-foreground">{promedioCalificacion.toFixed(1)}</span>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(promedioCalificacion)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{totalResenas} reseñas</p>
          </div>
        </div>

        {/* Distribución de estrellas */}
        <div className="flex-1 space-y-3">
          {distribucionCalificaciones.map((item) => (
            <div key={item.estrellas} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20 flex-shrink-0">
                <span className="text-sm font-medium text-foreground w-3">{item.estrellas}</span>
                <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <Progress
                value={item.porcentaje}
                className="h-2.5 flex-1 bg-slate-200 dark:bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-cyan-400 dark:[&>div]:from-cyan-600 dark:[&>div]:to-cyan-500"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">{item.cantidad}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquareIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-500" />
          Reseñas recientes
        </h4>

        <div className="grid gap-4">
          {opiniones.map((resena) => (
            <div
              key={resena.id ?? Math.random()}
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-cyan-300/50 dark:hover:border-cyan-700/50 transition-colors duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Avatar y info usuario */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:w-24 flex-shrink-0">
                  <Avatar className="w-12 h-12 border-2 border-cyan-200 dark:border-slate-600">
                    <AvatarImage alt={resena.usuario_nombre ?? "Usuario"} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-semibold">
                      {(resena.usuario_nombre ?? "Usuario")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="sm:text-center">
                    <p className="text-sm font-semibold text-foreground">{resena.usuario_nombre ?? "Usuario Anónimo"}</p>
                    {( true) && (
                      <span className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido de la reseña */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (resena.calificacion ?? 5)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date( Date.now()).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {resena.comentario ?? "Este producto es excelente, me encantó."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ver más reseñas */}
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="rounded-2xl px-8 border-cyan-300 dark:border-slate-600 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-800 hover:border-cyan-400 dark:hover:border-cyan-700 transition-all duration-300 bg-transparent"
          >
            Ver todas las reseñas
          </Button>
        </div>
      </div>
    </div>
  )
}}
