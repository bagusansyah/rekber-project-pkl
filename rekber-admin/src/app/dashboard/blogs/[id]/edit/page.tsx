"use client"
export const runtime = 'edge';

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Loader2, Upload, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

interface Category {
  id: number
  name: string
}

const CATEGORY_LIST_ENDPOINT = "/api/categories";
const BLOG_DETAIL_ENDPOINT = (id: string | string[]) => `/api/blogs/admin/${id}`;
const BLOG_UPDATE_ENDPOINT = (id: string | string[]) => `/api/blogs/${id}`;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

async function apiFetch(path: string, init: RequestInit = {}, options: { auth?: boolean } = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  if (options.auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, { ...init, headers });
}

async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("draft")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await apiFetch(CATEGORY_LIST_ENDPOINT, {}, { auth: true })
        if (!catRes.ok) throw new Error("Gagal mengambil kategori")
        const catData = await safeJsonParse<any>(catRes)
        if (catData?.status) {
          setCategories(catData.data)
        }

        // Fetch blog detail
        const blogRes = await apiFetch(BLOG_DETAIL_ENDPOINT(id as string), {}, { auth: true })
        if (!blogRes.ok) throw new Error("Gagal mengambil detail blog")
        const blogData = await safeJsonParse<any>(blogRes)

        if (blogData?.status) {
          const blog = blogData.data
          setTitle(blog.title)
          setCategoryId(blog.category_id?.toString() || "")
          setStatus(blog.status)
          setContent(blog.content)
          setExistingImageUrl(blog.image_url)
          setImagePreview(blog.image_url)
        } else {
          toast.error(blogData?.error || "Blog tidak ditemukan")
          router.push("/dashboard/blogs")
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Gagal mengambil data blog")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar (maksimal 5MB)")
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    setExistingImageUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      toast.error("Judul dan konten wajib diisi")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("category_id", categoryId)
    formData.append("status", status)
    formData.append("content", content)
    if (image) {
      formData.append("image", image)
    } else if (existingImageUrl) {
      formData.append("image_url", existingImageUrl)
    }

    try {
      const response = await apiFetch(BLOG_UPDATE_ENDPOINT(id as string), {
        method: "PUT",
        body: formData,
      }, { auth: true })

      const data = await safeJsonParse<any>(response)
      if (response.ok && data?.status) {
        toast.success("Blog berhasil diperbarui")
        router.push("/dashboard/blogs")
      } else {
        toast.error(data?.error || "Gagal memperbarui blog")
      }
    } catch (error) {
      console.error("Error updating blog:", error)
      toast.error("Terjadi kesalahan saat menyimpan blog")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/blogs">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Artikel</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Konten Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Judul Artikel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul yang menarik..."
                  className="text-xl font-bold py-6"
                />
              </div>

              {/* Image Upload Area below Title */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Gambar Sampul</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all relative min-h-[200px] group",
                    imagePreview ? "border-primary/50 bg-accent/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
                  )}
                >
                  {imagePreview ? (
                    <div className="relative w-full aspect-[21/9] max-h-[300px]">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3 w-full py-10">
                      <div className="p-3 bg-primary/10 rounded-full transition-transform group-hover:scale-110">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-semibold text-primary">Klik untuk ganti gambar</span>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB (Rasio 21:9 disarankan)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="content" className="text-sm font-semibold">Isi Artikel</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis konten blog Anda di sini..."
                  className="min-h-[500px] resize-none focus-visible:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draf</SelectItem>
                    <SelectItem value="publish">Terbit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
                <Link href="/dashboard/blogs" className="w-full">
                  <Button variant="outline" className="w-full">Batal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </form>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}