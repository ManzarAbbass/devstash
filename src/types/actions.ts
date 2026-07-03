export type DataResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type FieldResult<T> =
  | { success: true; data: T }
  | { success: false; error: Record<string, string[]> | string }

export type VoidResult =
  | { success: true }
  | { success: false; error: string }
