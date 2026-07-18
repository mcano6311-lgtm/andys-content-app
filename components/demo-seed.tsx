"use client"

import { useEffect } from "react"
import { seedDemoData } from "@/lib/store"

export function DemoSeed() {
  useEffect(() => {
    seedDemoData()
  }, [])
  return null
}
