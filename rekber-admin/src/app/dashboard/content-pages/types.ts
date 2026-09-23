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

// Structured format used before the single rich-text editor replaced per-block
// inputs. Only kept so old content already stored in the database can be
// auto-converted to HTML the first time it's opened in the new editor.
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
  content: LegalContent | AboutContent
  updated_at: string
}

export const ICON_OPTIONS = [
  "FileText",
  "Shield",
  "ShieldCheck",
  "Users",
  "Scale",
  "AlertTriangle",
  "Eye",
  "Lock",
  "Mail",
  "Clock",
  "Ban",
  "CheckCircle",
]

export const PAGE_LABELS: Record<string, string> = {
  "tentang-kami": "Tentang Kami",
  "syarat-dan-ketentuan": "Syarat dan Ketentuan",
  "kebijakan-privasi": "Kebijakan Privasi",
  "kebijakan-refund": "Kebijakan Refund",
}

export const STATIC_PAGE_SLUGS = [
  "tentang-kami",
  "syarat-dan-ketentuan",
  "kebijakan-privasi",
  "kebijakan-refund",
]
