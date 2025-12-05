// components/SearchBar.jsx
import { useState, useCallback, useRef } from 'react'
import { useDebounce } from 'use-debounce'
import { SearchIcon } from 'lucide-react'
import axios from 'axios'
import SearchResults from './searchResults'

export default function SearchBar({ className = '' }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [debouncedQuery] = useDebounce(searchQuery, 400)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setIsActive(query.trim().length > 0)
  }, [])

  const handleClose = useCallback(() => {
    setSearchQuery('')
    setIsActive(false)
    inputRef.current?.focus()
  }, [])

  return (
    <div className={`relative w-full ${className}`}>
      {/* Overlay blur */}
      {isActive && (
        <div 
          className="fixed inset-0 bg-black/80 h-screen w-screen z-40"
          onClick={handleClose}
        />
      )}
      
      {/* Search container */}
      <div className="relative w-full group z-50">
        <input
          ref={inputRef}
          type="text"
          placeholder="¿Qué producto buscas hoy?"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full h-12 pl-5 pr-14 rounded-2xl bg-secondary/50 dark:bg-secondary/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-foreground placeholder:text-muted-foreground shadow-lg"
        />
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
          onClick={handleClose}
        >
          <SearchIcon className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {/* Results dropdown */}
      <SearchResults 
        query={debouncedQuery}
        isActive={isActive}
        onClose={handleClose}
        className="mt-2"
      />
    </div>
  )
}
