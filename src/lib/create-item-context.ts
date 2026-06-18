"use client"

import { createContext, useContext } from "react"

interface CreateItemContextType {
  openDialog: (initialType?: string) => void
}

export const CreateItemContext = createContext<CreateItemContextType>({
  openDialog: () => {},
})

export function useCreateItem() {
  return useContext(CreateItemContext)
}
