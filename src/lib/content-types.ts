export const CONTENT_TYPES_WITH_CONTENT = ["snippet", "prompt", "command", "note"] as const
export const CONTENT_TYPES_WITH_LANGUAGE = ["snippet", "command"] as const
export const CONTENT_TYPES_WITH_URL = ["link"] as const
export const CONTENT_TYPES_WITH_FILE = ["file", "image"] as const
export const ALL_CREATION_TYPES = ["snippet", "prompt", "command", "note", "file", "image", "link"] as const

export function hasContent(type: string): boolean {
  return (CONTENT_TYPES_WITH_CONTENT as readonly string[]).includes(type)
}

export function hasLanguage(type: string): boolean {
  return (CONTENT_TYPES_WITH_LANGUAGE as readonly string[]).includes(type)
}

export function hasUrl(type: string): boolean {
  return (CONTENT_TYPES_WITH_URL as readonly string[]).includes(type)
}

export function isFileType(type: string): boolean {
  return (CONTENT_TYPES_WITH_FILE as readonly string[]).includes(type)
}
