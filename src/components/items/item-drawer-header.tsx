import { Code2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FieldError } from "@/components/ui/field-error"
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface ItemDrawerHeaderProps {
  Icon: typeof Code2
  color: string
  title: string
  itemTypeName: string
  language: string | null
  isEditing: boolean
  formTitle: string
  formErrors: Record<string, string[]> | null
  onFormTitleChange: (value: string) => void
}

export function ItemDrawerHeader({
  Icon,
  color,
  title,
  itemTypeName,
  language,
  isEditing,
  formTitle,
  formErrors,
  onFormTitleChange,
}: ItemDrawerHeaderProps) {
  return (
    <SheetHeader>
      <div className="flex items-center gap-2">
        <Icon className="size-5 shrink-0" style={{ color }} />
        {isEditing ? (
          <div className="flex-1">
            <Input
              value={formTitle}
              onChange={(e) => onFormTitleChange(e.target.value)}
              placeholder="Title"
              className="h-8 text-base font-semibold"
            />
            <FieldError field="title" errors={formErrors} />
          </div>
        ) : (
          <SheetTitle className="truncate">{title}</SheetTitle>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-[10px]">
          {itemTypeName}
        </Badge>
        {!isEditing && language && (
          <Badge variant="outline" className="text-[10px]">
            {language}
          </Badge>
        )}
      </div>
    </SheetHeader>
  )
}
