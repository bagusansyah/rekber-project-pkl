export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | { type: "definitions"; items: { term: string; description: string }[] }
  | { type: "contact_box"; items: { label: string; value: string }[] }

export interface LegalSection {
  icon: string | null
  title: string
  blocks: LegalBlock[]
}

export interface LegalSidebar {
  trust_badge: { icon: string; title: string; description: string }
  cta: { title: string; description: string; whatsapp_number: string; whatsapp_message: string }
}

export interface LegalContent {
  body_html: string
  last_updated: string
  sidebar: LegalSidebar
}

// Structured format used before the admin switched to a single rich-text
// editor. Old rows in the database (or the static fallback below) may still
// be in this shape until they're re-saved through the new editor.
export interface LegacyLegalContent {
  intro: string
  last_updated: string
  sections: LegalSection[]
  sidebar: LegalSidebar
}

export interface AboutMissionPoint {
  title: string
  description: string
}

export interface AboutContent {
  hero: { title_line1: string; title_line2: string; subtitle: string }
  mission: {
    title: string
    description: string
    points: AboutMissionPoint[]
  }
  image_url: string
}

export interface StaticPage {
  slug: string
  page_type: "legal" | "about"
  title: string
  meta_description: string | null
  content: LegalContent | LegacyLegalContent | AboutContent
  updated_at: string
}
