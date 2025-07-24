"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  login: (username: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const storedUsername = localStorage.getItem("username")

      if (authStatus === "true" && storedUsername) {
        setIsAuthenticated(true)
        setUsername(storedUsername)
      } else {
        setIsAuthenticated(false)
        setUsername(null)

        // Redirect to login if not authenticated and not already on login page
        if (pathname !== "/login") {
          router.push("/login")
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  const login = (username: string) => {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("username", username)
    setIsAuthenticated(true)
    setUsername(username)
  }

  const logout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    setIsAuthenticated(false)
    setUsername(null)
    router.push("/login")
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated && pathname !== "/login") {
    return null // Router will handle redirect
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
