"use client"

import { useState } from "react"
import { StarIcon, ThumbsUpIcon, CheckIcon } from "./icons"
import type { Review } from "@/types/products"

export function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpful)
  const [hasVoted, setHasVoted] = useState(false)

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpful((prev) => prev + 1)
      setHasVoted(true)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          {review.userAvatar ? (
            <img
              src={review.userAvatar || "/placeholder.svg"}
              alt={review.userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-primary">{review.userName.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">{review.userName}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                <CheckIcon className="w-3 h-3" />
                Verificado
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-4 h-4 ${star <= review.rating ? "text-amber-400" : "text-muted/30"}`}
                  filled={star <= review.rating}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(review.date).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.comment}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`flex items-center gap-2 text-sm transition-all duration-300 ${
            hasVoted ? "text-primary cursor-default" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <ThumbsUpIcon className="w-4 h-4" />
          <span>Útil ({helpful})</span>
        </button>
      </div>
    </div>
  )
}
