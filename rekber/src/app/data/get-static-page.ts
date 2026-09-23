import type { LegacyLegalContent, LegalContent, StaticPage } from "../components/static-pages/types"
import { normalizeLegalContent } from "../components/static-pages/legacy-migration"
import { STATIC_PAGES_FALLBACK } from "./static-pages-fallback"

// Old rows saved before the admin moved to a single rich-text editor are
// still stored in the structured section/block format. Normalize here so
// every consumer of getStaticPage always receives the new body_html shape.
function normalizePage(page: StaticPage): StaticPage {
  if (page.page_type !== "legal") return page
  return { ...page, content: normalizeLegalContent(page.content as LegalContent | LegacyLegalContent) }
}

export async function getStaticPage(slug: string): Promise<StaticPage> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/static-pages/${slug}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) throw new Error(`Static page fetch failed with status ${res.status}`)

    const json = await res.json()
    if (!json.status || !json.data) throw new Error("Static page response missing data")

    return normalizePage(json.data as StaticPage)
  } catch (error) {
    console.error(`Gagal mengambil halaman "${slug}", memakai konten cadangan:`, error)
    return normalizePage(STATIC_PAGES_FALLBACK[slug])
  }
}
