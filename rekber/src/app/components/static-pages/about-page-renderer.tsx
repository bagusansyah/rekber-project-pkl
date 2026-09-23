import { CheckCircle } from "lucide-react"
import Image from "next/image"
import type { AboutContent } from "./types"

export default function AboutPageRenderer({ content }: { content: AboutContent }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            <span className="text-gray-900">{content.hero.title_line1}</span>
            <br />
            <span className="text-blue-600">{content.hero.title_line2}</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">{content.hero.subtitle}</p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">{content.mission.title}</h2>
            <p className="text-lg text-gray-600 leading-relaxed">{content.mission.description}</p>
            <div className="space-y-4">
              {content.mission.points.map((point, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{point.title}</h3>
                    <p className="text-gray-600">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-96 rounded-2xl flex items-center justify-center">
              <Image
                src={content.image_url}
                alt="Rekber.com Logo"
                width={228}
                height={228}
                className="opacity-80"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
