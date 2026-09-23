"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MessageSquare, Send, Clock, AlertTriangle, CheckCircle } from "lucide-react"

const chatRooms = [
  {
    id: "CHAT-001",
    transactionId: "TRX-001",
    participants: ["John Doe", "Jane Smith"],
    lastMessage: "Barang sudah diterima dengan baik, terima kasih!",
    lastMessageTime: "10:30",
    lastMessageSender: "buyer",
    status: "active",
    unreadCount: 0,
    priority: "normal",
  },
  {
    id: "CHAT-002",
    transactionId: "TRX-002",
    participants: ["Ahmad Rizki", "Sari Indah"],
    lastMessage: "Kapan website bisa diselesaikan?",
    lastMessageTime: "09:45",
    lastMessageSender: "buyer",
    status: "active",
    unreadCount: 2,
    priority: "high",
  },
  {
    id: "CHAT-003",
    transactionId: "TRX-003",
    participants: ["Maria Santos", "Tech Store"],
    lastMessage: "Admin: Silakan konfirmasi pembayaran Anda",
    lastMessageTime: "08:20",
    lastMessageSender: "admin",
    status: "waiting_response",
    unreadCount: 1,
    priority: "urgent",
  },
  {
    id: "CHAT-004",
    transactionId: "TRX-004",
    participants: ["Budi Santoso", "Fashion Hub"],
    lastMessage: "Saya tidak puas dengan kualitas barang",
    lastMessageTime: "07:15",
    lastMessageSender: "buyer",
    status: "dispute",
    unreadCount: 5,
    priority: "urgent",
  },
]

const chatMessages = {
  "CHAT-002": [
    {
      id: 1,
      sender: "buyer",
      senderName: "Ahmad Rizki",
      message: "Halo, saya ingin menanyakan progress website saya",
      time: "09:00",
      date: "2024-01-15",
    },
    {
      id: 2,
      sender: "seller",
      senderName: "Sari Indah",
      message: "Halo pak Ahmad, website sudah 70% selesai. Tinggal finishing touch",
      time: "09:15",
      date: "2024-01-15",
    },
    {
      id: 3,
      sender: "buyer",
      senderName: "Ahmad Rizki",
      message: "Bagus! Kira-kira kapan bisa selesai?",
      time: "09:20",
      date: "2024-01-15",
    },
    {
      id: 4,
      sender: "seller",
      senderName: "Sari Indah",
      message: "Insya Allah hari Jumat sudah bisa saya serahkan",
      time: "09:25",
      date: "2024-01-15",
    },
    {
      id: 5,
      sender: "buyer",
      senderName: "Ahmad Rizki",
      message: "Kapan website bisa diselesaikan?",
      time: "09:45",
      date: "2024-01-15",
    },
  ],
}

const statusConfig = {
  active: { label: "Aktif", variant: "default" as const, icon: CheckCircle },
  waiting_response: { label: "Menunggu Respon", variant: "outline" as const, icon: Clock },
  dispute: { label: "Sengketa", variant: "destructive" as const, icon: AlertTriangle },
  closed: { label: "Ditutup", variant: "secondary" as const, icon: CheckCircle },
}

const priorityConfig = {
  normal: { label: "Normal", color: "text-gray-500" },
  high: { label: "Tinggi", color: "text-yellow-500" },
  urgent: { label: "Mendesak", color: "text-red-500" },
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("CHAT-002")
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const filteredChats = chatRooms.filter(
    (chat) =>
      chat.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const selectedChatData = selectedChat ? chatRooms.find((c) => c.id === selectedChat) : null
  const messages = selectedChat ? chatMessages[selectedChat as keyof typeof chatMessages] || [] : []

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // In real app, this would send message via API
      console.log("Sending message:", newMessage, "to chat:", selectedChat)
      setNewMessage("")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Sistem Chat</h1>
        <p className="text-muted-foreground text-balance">Kelola komunikasi antara pembeli dan penjual</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Daftar Chat
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi atau pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-1">
                {filteredChats.map((chat) => {
                  const status = statusConfig[chat.status as keyof typeof statusConfig]
                  const priority = priorityConfig[chat.priority as keyof typeof priorityConfig]
                  const StatusIcon = status.icon
                  const isSelected = selectedChat === chat.id

                  return (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${
                        isSelected ? "bg-accent/10 border-l-4 border-l-accent" : ""
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {chat.transactionId}
                          </Badge>
                          {chat.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                              {chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${priority.color.replace("text-", "bg-")}`} />
                          <StatusIcon
                            className={`h-3 w-3 ${status.variant === "destructive" ? "text-destructive" : "text-muted-foreground"}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">{chat.participants.join(" ↔ ")}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{chat.lastMessage}</p>
                        <p className="text-xs text-muted-foreground">{chat.lastMessageTime}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedChatData ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {selectedChatData.transactionId}
                      </CardTitle>
                      <CardDescription>{selectedChatData.participants.join(" ↔ ")}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[selectedChatData.status as keyof typeof statusConfig].variant}>
                        {statusConfig[selectedChatData.status as keyof typeof statusConfig].label}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Lihat Transaksi
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "admin" ? "justify-center" : message.sender === "buyer" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] ${message.sender === "admin" ? "text-center" : "flex items-start gap-3"}`}
                        >
                          {message.sender !== "admin" && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarFallback className="text-xs">{getInitials(message.senderName)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.sender === "admin"
                                ? "bg-accent/10 text-accent-foreground inline-block"
                                : message.sender === "buyer"
                                  ? "bg-muted"
                                  : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {message.sender !== "admin" && (
                              <p className="font-medium text-xs mb-1">{message.senderName}</p>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">{message.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Tulis pesan sebagai admin..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} className="self-end">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>Tekan Enter untuk kirim, Shift+Enter untuk baris baru</span>
                    <span>Sebagai: Admin</span>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Pilih chat untuk memulai percakapan</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Chat Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatRooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatRooms.filter((c) => c.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sengketa</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatRooms.filter((c) => c.status === "dispute").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesan Belum Dibaca</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatRooms.reduce((sum, c) => sum + c.unreadCount, 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
