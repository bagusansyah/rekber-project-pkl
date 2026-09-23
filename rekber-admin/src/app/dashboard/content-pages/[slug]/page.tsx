"use client"
export const runtime = 'edge'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  StaticPage,
  LegalContent,
  LegacyLegalContent,
  AboutContent,
  AboutMissionPoint,
  ICON_OPTIONS,
  PAGE_LABELS,
} from "../types"
import { normalizeLegalContent } from "../legacy-migration"

export default function EditContentPagePage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageType, setPageType] = useState<"legal" | "about" | null>(null)
  const [title, setTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [legal, setLegal] = useState<LegalContent | null>(null)
  const [about, setAbout] = useState<AboutContent | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/static-pages/${slug}`)
        const data = await response.json()
        if (data.status) {
          const page: StaticPage = data.data
          setPageType(page.page_type)
          setTitle(page.title)
          setMetaDescription(page.meta_description || "")
          if (page.page_type === "legal") {
            setLegal(normalizeLegalContent(page.content as LegalContent | LegacyLegalContent))
          } else {
            setAbout(page.content as AboutContent)
          }
        } else {
          toast.error(data.error || "Halaman tidak ditemukan")
        }
      } catch (error) {
        console.error("Failed to fetch page:", error)
        toast.error("Gagal mengambil data halaman")
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Judul halaman wajib diisi")
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const content = pageType === "legal" ? legal : about
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/static-pages/admin/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, meta_description: metaDescription, content }),
      })
      const data = await response.json()
      if (data.status) {
        toast.success("Halaman berhasil disimpan")
      } else {
        toast.error(data.error || "Gagal menyimpan halaman")
      }
    } catch (error) {
      console.error("Failed to save page:", error)
      toast.error("Gagal menyimpan halaman")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/content-pages"
            className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit {PAGE_LABELS[slug] || slug}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Umum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Judul Halaman</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Meta Description (SEO)</Label>
            <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      {pageType === "about" && about && <AboutEditor content={about} onChange={setAbout} />}
      {pageType === "legal" && legal && <LegalEditor content={legal} onChange={setLegal} />}
    </div>
  )
}

function AboutEditor({ content, onChange }: { content: AboutContent; onChange: (c: AboutContent) => void }) {
  const update = (patch: Partial<AboutContent>) => onChange({ ...content, ...patch })

  const updatePoint = (index: number, patch: Partial<AboutMissionPoint>) => {
    const points = content.mission.points.map((p, i) => (i === index ? { ...p, ...patch } : p))
    update({ mission: { ...content.mission, points } })
  }

  const addPoint = () => {
    update({ mission: { ...content.mission, points: [...content.mission.points, { title: "", description: "" }] } })
  }

  const removePoint = (index: number) => {
    update({ mission: { ...content.mission, points: content.mission.points.filter((_, i) => i !== index) } })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Judul Baris 1</Label>
              <Input
                value={content.hero.title_line1}
                onChange={(e) => update({ hero: { ...content.hero, title_line1: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Judul Baris 2 (highlight biru)</Label>
              <Input
                value={content.hero.title_line2}
                onChange={(e) => update({ hero: { ...content.hero, title_line2: e.target.value } })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Subtitle</Label>
            <Textarea
              rows={2}
              value={content.hero.subtitle}
              onChange={(e) => update({ hero: { ...content.hero, subtitle: e.target.value } })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Misi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Judul Misi</Label>
            <Input
              value={content.mission.title}
              onChange={(e) => update({ mission: { ...content.mission, title: e.target.value } })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Deskripsi Misi</Label>
            <Textarea
              rows={3}
              value={content.mission.description}
              onChange={(e) => update({ mission: { ...content.mission, description: e.target.value } })}
            />
          </div>

          <div className="space-y-3">
            <Label>Poin Misi</Label>
            {content.mission.points.map((point, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Poin {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removePoint(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  placeholder="Judul poin"
                  value={point.title}
                  onChange={(e) => updatePoint(index, { title: e.target.value })}
                />
                <Textarea
                  placeholder="Deskripsi poin"
                  rows={2}
                  value={point.description}
                  onChange={(e) => updatePoint(index, { description: e.target.value })}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={addPoint}>
              <Plus className="h-3.5 w-3.5" /> Tambah Poin
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gambar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label>URL Gambar</Label>
            <Input value={content.image_url} onChange={(e) => update({ image_url: e.target.value })} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function LegalEditor({ content, onChange }: { content: LegalContent; onChange: (c: LegalContent) => void }) {
  const update = (patch: Partial<LegalContent>) => onChange({ ...content, ...patch })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konten Halaman</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Isi Halaman</Label>
            <RichTextEditor
              value={content.body_html}
              onChange={(html) => update({ body_html: html })}
              placeholder="Tulis isi halaman di sini, seperti menulis dokumen biasa..."
            />
          </div>
          <div className="grid gap-2 max-w-xs">
            <Label>Terakhir Diperbarui</Label>
            <Input
              value={content.last_updated}
              onChange={(e) => update({ last_updated: e.target.value })}
              placeholder="Contoh: 15 Januari 2025"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sidebar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Badge Kepercayaan</p>
            <div className="grid sm:grid-cols-[160px_1fr] gap-4">
              <div className="grid gap-2">
                <Label>Ikon</Label>
                <Select
                  value={content.sidebar.trust_badge.icon}
                  onValueChange={(v) =>
                    update({
                      sidebar: { ...content.sidebar, trust_badge: { ...content.sidebar.trust_badge, icon: v } },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Judul</Label>
                <Input
                  value={content.sidebar.trust_badge.title}
                  onChange={(e) =>
                    update({
                      sidebar: {
                        ...content.sidebar,
                        trust_badge: { ...content.sidebar.trust_badge, title: e.target.value },
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi</Label>
              <Textarea
                rows={2}
                value={content.sidebar.trust_badge.description}
                onChange={(e) =>
                  update({
                    sidebar: {
                      ...content.sidebar,
                      trust_badge: { ...content.sidebar.trust_badge, description: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium">Kartu CTA Bantuan</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Judul</Label>
                <Input
                  value={content.sidebar.cta.title}
                  onChange={(e) =>
                    update({ sidebar: { ...content.sidebar, cta: { ...content.sidebar.cta, title: e.target.value } } })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Nomor WhatsApp</Label>
                <Input
                  value={content.sidebar.cta.whatsapp_number}
                  onChange={(e) =>
                    update({
                      sidebar: { ...content.sidebar, cta: { ...content.sidebar.cta, whatsapp_number: e.target.value } },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi</Label>
              <Input
                value={content.sidebar.cta.description}
                onChange={(e) =>
                  update({
                    sidebar: { ...content.sidebar, cta: { ...content.sidebar.cta, description: e.target.value } },
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Pesan WhatsApp Default</Label>
              <Input
                value={content.sidebar.cta.whatsapp_message}
                onChange={(e) =>
                  update({
                    sidebar: {
                      ...content.sidebar,
                      cta: { ...content.sidebar.cta, whatsapp_message: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
