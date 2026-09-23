"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function NewBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState("draft")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
        const data = await response.json()
        if (data.status) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      toast.error("Judul dan konten wajib diisi")
      return
    }

    setLoading(true)
    const token = localStorage.getItem("token")
    
    // Use FormData for multipart/form-data (required for image upload)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("category_id", categoryId)
    formData.append("status", status)
    formData.append("content", content)
    if (image) {
      formData.append("image", image)
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })
      
      const data = await response.json()
      if (data.status) {
        toast.success("Blog berhasil dibuat")
        router.push("/dashboard/blogs")
      } else {
        toast.error(data.error || "Gagal membuat blog")
      }
    } catch (error) {
      console.error("Error creating blog:", error)
      toast.error("Terjadi kesalahan saat menyimpan blog")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/blogs">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Tulis Artikel Baru</h1>
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
                        <span className="text-sm font-semibold text-primary">Klik untuk browse gambar</span>
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
                    <SelectItem value="draft">Simpan sebagai Draf</SelectItem>
                    <SelectItem value="publish">Terbitkan (Publish)</SelectItem>
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status === 'publish' ? 'Terbitkan Sekarang' : 'Simpan Draf'}
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
