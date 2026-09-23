"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit, FileText } from "lucide-react"
import { toast } from "sonner"
import { StaticPage, PAGE_LABELS } from "./types"

export default function ContentPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/static-pages/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.status) {
          setPages(data.data)
        } else {
          toast.error(data.error || "Gagal mengambil daftar halaman")
        }
      } catch (error) {
        console.error("Failed to fetch static pages:", error)
        toast.error("Gagal mengambil daftar halaman")
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Halaman Konten</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kelola isi halaman Tentang Kami, Syarat dan Ketentuan, Kebijakan Privasi, dan Kebijakan Refund
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pages.map((page) => (
            <Card key={page.slug}>
              <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-start gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{PAGE_LABELS[page.slug] || page.slug}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">/{page.slug}</p>
                  </div>
                </div>
                <Badge variant="outline">{page.page_type}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Terakhir diperbarui:{" "}
                  {new Date(page.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <Link href={`/dashboard/content-pages/${page.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Halaman
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
