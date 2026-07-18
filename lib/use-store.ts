"use client"

import { useSyncExternalStore } from "react"
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/store"

export function useAppStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
