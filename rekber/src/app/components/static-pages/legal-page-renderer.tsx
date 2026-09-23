import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { STATIC_PAGE_ICONS } from "./icon-map"
import type { LegalContent } from "./types"

export default function LegalPageRenderer({
  pageTitle,
  content,
}: {
  pageTitle: string
  content: LegalContent
}) {
  const TrustIcon = STATIC_PAGE_ICONS[content.sidebar.trust_badge.icon] || null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
              <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: {content.last_updated}</p>

              <div
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: content.body_html }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-blue-600 text-white mb-6">
              <CardContent className="p-6 text-center">
                {TrustIcon && <TrustIcon className="h-12 w-12 mx-auto mb-4 text-white" />}
                <h3 className="text-xl font-semibold mb-2">{content.sidebar.trust_badge.title}</h3>
                <p className="text-blue-100">{content.sidebar.trust_badge.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{content.sidebar.cta.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{content.sidebar.cta.description}</p>
                <Link
                  href={`https://wa.me/${content.sidebar.cta.whatsapp_number}?text=${encodeURIComponent(
                    content.sidebar.cta.whatsapp_message
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Chat WhatsApp
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
