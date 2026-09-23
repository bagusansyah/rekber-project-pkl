import { Badge } from "@/components/ui/badge"

export function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Draft
        </Badge>
      )
    case "wait_payment":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          Pending
        </Badge>
      )
    case "disbursed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Dicairkan
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Selesai
        </Badge>
      )
    case "paid":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Lunas
        </Badge>
      )
    case "disputed":
      return (
        <Badge variant="secondary" className="bg-red-100 text-green-700">
          Bermasalah
        </Badge>
      )
    case "cancel":
    case "cancelled":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 font-semibold border-red-200">
          Dibatalkan
        </Badge>
      )
    case "refunded":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          Dikembalikan (Refund)
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}