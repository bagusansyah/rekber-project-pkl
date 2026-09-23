"use client"
export const runtime = "edge"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar as CalendarIcon, ArrowLeft, Mail, Phone, Calendar, Loader2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as DateCalendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { formatDateForApi, formatShortIndonesianDate, getPartnershipExpirationValue, normalizeDateValue } from "@/lib/formatters"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPartnership, setIsPartnership] = useState(false)
  const [partnershipPercentage, setPartnershipPercentage] = useState(0)
  const [partnershipExpiration, setPartnershipExpiration] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const userId = params?.id ?? "0"

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(`${API_URL}/admin/dashboard/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("email")
          localStorage.removeItem("name")
          router.push("/login")
          return
        }

        if (!res.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await res.json()

        if (data.status) {
          const fetchedUser = data.data.user
          const expirationValue = getPartnershipExpirationValue(fetchedUser)

          setUser(fetchedUser)
          setIsPartnership(Boolean(fetchedUser.is_partnership))
          setPartnershipPercentage(Number(fetchedUser.partnership_percentage || 0))
          setPartnershipExpiration(normalizeDateValue(expirationValue))
        } else {
          setError(data.message || "Failed to fetch user data")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Gagal mengambil data pengguna")
      } finally {
        setLoading(false)
      }
    }

    if (userId && userId !== "0") {
      fetchUser()
    }
  }, [userId, router])

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const expirationValue = formatDateForApi(partnershipExpiration)

      const res = await fetch(`${API_URL}/admin/dashboard/users/${userId}/partnership`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_partnership: isPartnership,
          partnership_percentage: partnershipPercentage,
          partnership_expires_at: expirationValue,
          partnership_expiration_date: expirationValue,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update partnership settings")
      }

      const data = await res.json()
      if (data.status) {
        alert("Pengaturan kemitraan berhasil disimpan!")
        setUser((prev: any) => ({
          ...prev,
          is_partnership: isPartnership,
          partnership_percentage: partnershipPercentage,
          partnership_expires_at: expirationValue,
          partnership_expiration_date: expirationValue,
        }))
      } else {
        alert(data.message || "Gagal menyimpan pengaturan kemitraan")
      }
    } catch (err: any) {
      console.error(err)
      alert("Terjadi kesalahan saat menyimpan data.")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const partnershipLabel = isPartnership ? "Partnership Member" : "Non Partnership"
  const partnershipExpirationLabel = formatShortIndonesianDate(partnershipExpiration)

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="p-4 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Memuat data pengguna...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-destructive">{error || "Pengguna tidak ditemukan"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-balance">Detail Pengguna</h3>
          <p className="text-sm sm:text-base text-muted-foreground">ID: {user?.id}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">{getInitials(user?.nama)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.nama}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border font-semibold",
                          isPartnership
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {partnershipLabel}
                      </Badge>
                      <span className="text-muted-foreground">
                        Role: <span className="font-medium text-foreground">{partnershipLabel}</span>
                        {" "}|
                        {" "}Partnership Expires:{" "}
                        <span className="font-medium text-foreground">{partnershipExpirationLabel}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon</p>
                    <p className="font-medium">{user?.kontak || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bergabung</p>
                    <p className="font-medium">{user?.bergabung || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aktivitas Terakhir</p>
                    <p className="font-medium">{user?.lastActivity || "-"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Alamat</p>
                <p>{user?.alamat_lengkap || "-"}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Atas Nama Rekening</p>
                  <p className="font-medium">{user?.nama_rekening || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rekening Bank</p>
                  <p className="font-medium">{user?.no_rekening || "-"}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/60 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Pengaturan Partnership</h4>
                    <p className="text-xs text-muted-foreground">Update status partnership, persentase, dan tanggal kedaluwarsa.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_partnership"
                    checked={isPartnership}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setIsPartnership(checked)
                      if (!checked) {
                        setPartnershipExpiration(null)
                        setPartnershipPercentage(0)
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="is_partnership" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Partnership Member
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="partnership_expiration" className="text-sm font-semibold text-foreground">
                      Partnership Expiration Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          id="partnership_expiration"
                          variant="outline"
                          disabled={!isPartnership}
                          className={cn(
                            "w-full justify-start text-left font-normal border-gray-200 bg-white rounded-sm px-4 py-2.5 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm",
                            !partnershipExpiration ? "text-muted-foreground" : "text-gray-900",
                            !isPartnership && "opacity-50 cursor-not-allowed bg-muted border-border hover:bg-muted hover:border-border"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                          {partnershipExpiration
                            ? formatShortIndonesianDate(partnershipExpiration)
                            : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex w-auto flex-col space-y-3 p-3 rounded-sm shadow-lg border-gray-100" align="start">
                        <Select
                          onValueChange={(value) => {
                            const d = new Date()
                            if (value === "1") d.setMonth(d.getMonth() + 1)
                            else if (value === "3") d.setMonth(d.getMonth() + 3)
                            else if (value === "6") d.setMonth(d.getMonth() + 6)
                            else if (value === "12") d.setFullYear(d.getFullYear() + 1)
                            setPartnershipExpiration(d)
                          }}
                        >
                          <SelectTrigger className="w-full rounded-sm border-gray-200 px-3 py-2 text-sm shadow-sm hover:border-gray-300 transition-colors bg-white text-gray-700">
                            <SelectValue placeholder="Pilih durasi cepat" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="rounded-sm border-gray-100 shadow-lg">
                            <SelectItem value="1">1 Bulan dari sekarang</SelectItem>
                            <SelectItem value="3">3 Bulan dari sekarang</SelectItem>
                            <SelectItem value="6">6 Bulan dari sekarang</SelectItem>
                            <SelectItem value="12">1 Tahun dari sekarang</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="rounded-xl overflow-hidden">
                          <DateCalendar
                            mode="single"
                            selected={partnershipExpiration ?? undefined}
                            onSelect={(date) => setPartnershipExpiration(date ?? null)}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    {partnershipExpiration && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPartnershipExpiration(null)}
                        className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Hapus tanggal
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">Kosongkan jika partnership tidak memiliki tanggal kedaluwarsa.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnership_percentage" className="text-sm font-semibold text-foreground">
                      Persentase Partnership (%)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        id="partnership_percentage"
                        min="0"
                        max="100"
                        disabled={!isPartnership}
                        value={partnershipPercentage}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value)))
                          setPartnershipPercentage(val)
                        }}
                        className={cn("w-28", !isPartnership && "opacity-50 cursor-not-allowed bg-muted border-border hover:bg-muted hover:border-border")}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Maksimal persentase adalah 100%.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Kemitraan"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
