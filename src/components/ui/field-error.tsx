export function FieldError({ field, errors }: { field: string; errors: Record<string, string[]> | null }) {
  if (!errors?.[field]) return null
  return (
    <p className="mt-1 text-xs text-destructive">{errors[field][0]}</p>
  )
}
