import type { ReactNode } from "react"
import { FieldError } from "@/components/ui/field-error"

interface FormSectionProps {
  label: string
  required?: boolean
  children: ReactNode
  errors?: Record<string, string[]> | null
  fieldName?: string
}

export function FormSection({ label, required, children, errors, fieldName }: FormSectionProps) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </h3>
      {children}
      {fieldName && <FieldError field={fieldName} errors={errors ?? null} />}
    </div>
  )
}
