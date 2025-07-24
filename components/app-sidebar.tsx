"use client"

import type React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Settings, Plus, Check } from "lucide-react"
import Link from "next/link"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
]

interface Filter {
  id: string
  name: string
  customPrompt: string
  dimensions: {
    founders: number
    product: number
    market: number
    vision: number
    traction: number
    investors: number
  }
}

function CreateFilterModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    customPrompt: "",
    dimensions: {
      founders: 75,
      market: 60,
      product: 35,
      traction: 15,
      investors: 5,
      vision: 10,
    },
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Filter name is required"
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters"
    }

    if (!formData.customPrompt.trim()) {
      newErrors.customPrompt = "Custom prompt is required"
    } else if (formData.customPrompt.length > 500) {
      newErrors.customPrompt = "Custom prompt must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Save to localStorage for now (in a real app, this would be an API call)
      const existingFilters = JSON.parse(localStorage.getItem("filters") || "[]")
      const newFilter: Filter = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        customPrompt: formData.customPrompt.trim(),
        dimensions: formData.dimensions,
      }

      existingFilters.push(newFilter)
      localStorage.setItem("filters", JSON.stringify(existingFilters))

      toast({
        title: "Success",
        description: "Filter created successfully",
      })

      // Reset form
      setFormData({
        name: "",
        customPrompt: "",
        dimensions: {
          founders: 75,
          market: 60,
          product: 35,
          traction: 15,
          investors: 5,
          vision: 10,
        },
      })
      setErrors({})
      setIsOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to create filter:", error)
      toast({
        title: "Error",
        description: "Failed to create filter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const updateDimension = (dimension: string, value: number[]) => {
    const newValue = Math.round(value[0])

    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [dimension]: newValue,
      },
    })
  }

  const resetToDefaults = () => {
    setFormData({
      ...formData,
      dimensions: {
        founders: 75,
        market: 60,
        product: 35,
        traction: 15,
        investors: 5,
        vision: 10,
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
          <Plus className="mr-2 h-4 w-4" />
          <span className="text-sm">Create Filter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Filter</DialogTitle>
          <DialogDescription>
            Set up a custom evaluation filter. Rate each dimension from 0-100 based on importance.
            <br />
            <span className="text-sm text-muted-foreground mt-1 block">
              0 = Not important at all • 50 = Moderately important • 100 = Extremely important
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Filter Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter filter name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Prompt *</Label>
            <Textarea
              id="customPrompt"
              value={formData.customPrompt}
              onChange={(e) => updateField("customPrompt", e.target.value)}
              placeholder="Enter your custom evaluation prompt..."
              maxLength={500}
              disabled={isSubmitting}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{formData.customPrompt.length}/500 characters</p>
            {errors.customPrompt && <p className="text-sm text-red-600">{errors.customPrompt}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dimension Importance (0-100)</Label>
              <Button type="button" variant="outline" size="sm" onClick={resetToDefaults} disabled={isSubmitting}>
                Reset to Defaults
              </Button>
            </div>

            {Object.entries(formData.dimensions).map(([dimension, value]) => (
              <div key={dimension} className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="capitalize font-medium">{dimension}</Label>
                  <span className="text-sm font-medium px-2 py-1 bg-muted rounded">{value}</span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(newValue) => updateDimension(dimension, newValue)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Important</span>
                  <span>Moderately Important</span>
                  <span>Extremely Important</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Filter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AppSidebar() {
  const [filters, setFilters] = useState<Filter[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  useEffect(() => {
    // Load filters from localStorage
    const savedFilters = JSON.parse(localStorage.getItem("filters") || "[]")
    setFilters(savedFilters)

    // Load selected filter
    const savedSelected = localStorage.getItem("selectedFilter")
    setSelectedFilter(savedSelected)
  }, [])

  const refreshFilters = () => {
    const savedFilters = JSON.parse(localStorage.getItem("filters") || "[]")
    setFilters(savedFilters)
  }

  const toggleFilter = (filterId: string) => {
    if (selectedFilter === filterId) {
      // Deselect if already selected
      setSelectedFilter(null)
      localStorage.removeItem("selectedFilter")
      toast({
        title: "Filter Deselected",
        description: "No filter is currently active",
      })
    } else {
      // Select new filter
      setSelectedFilter(filterId)
      localStorage.setItem("selectedFilter", filterId)
      const filter = filters.find((p) => p.id === filterId)
      toast({
        title: "Filter Selected",
        description: `"${filter?.name}" will be used for evaluations`,
      })
    }
  }

  return (
    <Sidebar className="flex-[2]">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Pitch Evaluator</h2>
      </SidebarHeader>

      <SidebarContent className="p-0">
        {/* Navigation Section */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-9 px-2">
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Filters Section */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-3 w-3" />
            Filters
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filters.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground">No filters created yet</div>
              ) : (
                filters.map((filter) => (
                  <SidebarMenuItem key={filter.id}>
                    <SidebarMenuButton
                      className="h-9 px-2 justify-between group"
                      onClick={() => toggleFilter(filter.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm truncate">{filter.name}</span>
                      </div>
                      {selectedFilter === filter.id && <Check className="h-3 w-3 text-primary shrink-0" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>

            {/* Create Filter Button */}
            <div className="px-2 pt-2">
              <CreateFilterModal onSuccess={refreshFilters} />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
