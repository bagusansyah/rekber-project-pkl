"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2, ExternalLink, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

interface Blog {
  id: number
  title: string
  slug: string
  image_url: string
  status: 'draft' | 'publish'
  category_name: string
  created_at: string
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/admin/all`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.status) {
        setBlogs(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error)
      toast.error("Gagal mengambil daftar blog")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus blog ini?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.status) {
        toast.success("Blog berhasil dihapus")
        fetchBlogs()
      } else {
        toast.error(data.error || "Gagal menghapus blog")
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast.error("Gagal menghapus blog")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manajemen Blog</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Buat, edit, dan kelola artikel blog Rekber.com</p>
        </div>
        <Link href="/dashboard/blogs/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Artikel</CardTitle>
          <CardDescription>Daftar semua artikel baik yang sudah terbit maupun draf</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Cover</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Belum ada artikel yang dibuat
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div className="relative w-16 h-10 bg-muted rounded overflow-hidden">
                          {blog.image_url ? (
                            <Image 
                              src={blog.image_url} 
                              alt={blog.title} 
                              fill 
                              className="object-cover" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
                              No Cover
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate">
                        {blog.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{blog.category_name || "Tanpa Kategori"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.status === 'publish' ? 'default' : 'secondary'}>
                          {blog.status === 'publish' ? 'Terbit' : 'Draf'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(blog.created_at).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(blog.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
