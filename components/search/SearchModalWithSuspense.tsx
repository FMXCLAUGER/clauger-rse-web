"use client"

import { Suspense } from "react"
import { SearchModal } from "./SearchModal"

export function SearchModalWithSuspense() {
  return (
    <Suspense fallback={null}>
      <SearchModal />
    </Suspense>
  )
}
