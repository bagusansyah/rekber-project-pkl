"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      const data = await response.json()
      if (data.status) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast.error("Gagal mengambil daftar kategori")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenDialog = (category: Category | null = null) => {
    setEditingCategory(category)
    setCategoryName(category ? category.name : "")
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setSubmitting(true)
    const token = localStorage.getItem("token")
    const method = editingCategory ? "PUT" : "POST"
      const url = editingCategory 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/categories`

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName })
      })
      const data = await response.json()
      if (data.status) {
        toast.success(editingCategory ? "Kategori diperbarui" : "Kategori dibuat")
        setIsDialogOpen(false)
        fetchCategories()
      } else {
        toast.error(data.error || "Gagal menyimpan kategori")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Gagal menyimpan kategori")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.status) {
        toast.success("Kategori dihapus")
        fetchCategories()
      } else {
        toast.error(data.error || "Gagal menghapus kategori")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Gagal menghapus kategori")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Kategori Blog</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Kelola kategori untuk konten blog Anda</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
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
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Belum ada kategori
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        {new Date(category.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleOpenDialog(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            <DialogDescription>
              Masukkan nama kategori yang unik untuk mengelompokkan blog Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Contoh: Teknologi, Update, Tutorial"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting || !categoryName.trim()}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "Simpan Perubahan" : "Buat Kategori"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
