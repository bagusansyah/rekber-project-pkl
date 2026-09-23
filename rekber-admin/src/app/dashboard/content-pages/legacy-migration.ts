import type { LegacyLegalContent, LegalBlock, LegalContent } from "./types"

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function blockToHtml(block: LegalBlock): string {
  switch (block.type) {
    case "paragraph":
      return block.text.trim() ? `<p>${escapeHtml(block.text)}</p>` : ""
    case "subheading":
      return block.text.trim() ? `<h3>${escapeHtml(block.text)}</h3>` : ""
    case "list": {
      const tag = block.style === "number" ? "ol" : "ul"
      const items = block.items
        .filter((item) => item.trim())
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")
      return items ? `<${tag}>${items}</${tag}>` : ""
    }
    case "definitions":
      return block.items
        .filter((item) => item.term.trim() || item.description.trim())
        .map((item) => `<p><strong>${escapeHtml(item.term)}</strong> ${escapeHtml(item.description)}</p>`)
        .join("")
    case "contact_box":
      return block.items
        .filter((item) => item.label.trim() || item.value.trim())
        .map((item) => `<p><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</p>`)
        .join("")
    default:
      return ""
  }
}

export function legacyLegalToHtml(legacy: Pick<LegacyLegalContent, "intro" | "sections">): string {
  const parts: string[] = []
  if (legacy.intro?.trim()) parts.push(`<p>${escapeHtml(legacy.intro)}</p>`)
  for (const section of legacy.sections) {
    if (section.title?.trim()) parts.push(`<h2>${escapeHtml(section.title)}</h2>`)
    for (const block of section.blocks) {
      const html = blockToHtml(block)
      if (html) parts.push(html)
    }
  }
  return parts.join("\n")
}

export function isLegacyLegalContent(content: unknown): content is LegacyLegalContent {
  return !!content && typeof content === "object" && Array.isArray((content as LegacyLegalContent).sections)
}

export function normalizeLegalContent(content: LegalContent | LegacyLegalContent): LegalContent {
  if (isLegacyLegalContent(content)) {
    return {
      body_html: legacyLegalToHtml(content),
      last_updated: content.last_updated,
      sidebar: content.sidebar,
    }
  }
  return content
}
