"use client";

import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ChevronRight, Search, Loader2 } from "lucide-react";
import { API_URL, getToken } from '@/constants/api';
import { encodeTransactionId } from '@/lib/transactionId';

interface TransactionChat {
  id: string;
  title: string;
  other_party_name?: string;
  kode_transaksi?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

interface TransactionInboxItem {
  id: string | number;
  title?: string;
  kode_transaksi?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  other_party_name?: string;
}

interface NotificationPayload {
  type?: string;
  data?: {
    transaction_id?: string | number;
    message?: string;
    kode_transaksi?: string;
    sender_name?: string;
  };
}

export const runtime = "edge";

const AVATAR_BG_COLORS = ["bg-blue-100", "bg-green-100", "bg-purple-100", "bg-red-100", "bg-yellow-100"];
const AVATAR_TEXT_COLORS = ["text-blue-700", "text-green-700", "text-purple-700", "text-red-700", "text-yellow-700"];

export default function ChatInboxPage() {
  const [chats, setChats] = useState<TransactionChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactionsForInbox = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

        const res = await fetch(`${API_URL}/transactions`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const json: { data?: TransactionInboxItem[]; transactions?: TransactionInboxItem[] } = await res.json();
        const transactionsData = json.data || json.transactions || [];

        // Inbox hanya menampilkan transaksi yang sudah punya chat, diurutkan terbaru dulu.
        const sortedData = transactionsData
          .filter((trx): trx is TransactionInboxItem => Boolean(trx.last_message && trx.last_message.trim() !== ''))
          .sort((a, b) => {
            const timeA = new Date(a.last_message_time || 0).getTime();
            const timeB = new Date(b.last_message_time || 0).getTime();
            return timeB - timeA;
          });

        setChats(
          sortedData.map((item) => ({
            id: String(item.id),
            title: item.title || item.kode_transaksi || `Transaksi #${item.id}`,
            kode_transaksi: item.kode_transaksi,
            other_party_name: item.other_party_name,
            last_message: item.last_message,
            last_message_time: item.last_message_time,
            unread_count: item.unread_count,
          }))
        );
      } catch (error) {
        console.error("Error fetching inbox data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsForInbox();
  }, []);

  // Backend belum punya event socket khusus untuk inbox, jadi kita dengarkan
  // stream notifikasi umum dan saring yang bertipe 'chat' saja.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["polling", "websocket"]
    });

    socket.on("new_notification", (notificationData: NotificationPayload) => {
      if (notificationData.type !== 'chat') return;

      const payload = notificationData.data;
      if (!payload || !payload.transaction_id) return;

      setChats((prevChats) => {
        const existingIndex = prevChats.findIndex(chat => String(chat.id) === String(payload.transaction_id));

        if (existingIndex > -1) {
          // Transaksi sudah ada di inbox: perbarui pesan terakhir dan pindahkan ke urutan teratas.
          const updatedChat = {
            ...prevChats[existingIndex],
            last_message: payload.message,
            last_message_time: new Date().toISOString()
          };
          const remainingChats = prevChats.filter(chat => String(chat.id) !== String(payload.transaction_id));
          return [updatedChat, ...remainingChats];
        }

        // Pesan pertama untuk transaksi ini: tambahkan sebagai entri baru di urutan teratas.
        const newChat: TransactionChat = {
          id: String(payload.transaction_id),
          title: payload.kode_transaksi || `Transaksi #${payload.transaction_id}`,
          kode_transaksi: payload.kode_transaksi,
          other_party_name: payload.sender_name,
          last_message: payload.message,
          last_message_time: new Date().toISOString(),
          unread_count: 0
        };
        return [newChat, ...prevChats];
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket koneksi error di inbox chat:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredChats = chats.filter(chat => {
    const keyword = searchQuery.toLowerCase();
    const searchId = String(chat.id || chat.kode_transaksi || "").toLowerCase();
    const searchName = String(chat.title || "").toLowerCase();
    return searchId.includes(keyword) || searchName.includes(keyword);
  });

  return (
    <div className="flex flex-col min-h-screen bg-white md:bg-gray-50">
      <div className="p-3 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Pesan Masuk</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ID Transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900">Belum ada obrolan</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? "Tidak ditemukan percakapan." : "Riwayat chat dari transaksi akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredChats.map((chat) => {
              const isUnread = chat.unread_count && chat.unread_count > 0;
              const nameForInitial = chat.other_party_name || chat.title || chat.id || "U";
              const initial = nameForInitial[0]?.toUpperCase() || "U";
              const colorIndex = Math.abs(parseInt(chat.id, 10) || 0) % AVATAR_BG_COLORS.length;
              const avatarBg = AVATAR_BG_COLORS[colorIndex];
              const avatarText = AVATAR_TEXT_COLORS[colorIndex];

              return (
                <Link
                  key={chat.id}
                  href={`/dashboard/transactions/${encodeTransactionId(chat.id)}`}
                  className={`flex items-center p-3 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`w-10 h-10 ${avatarBg} rounded-full flex items-center justify-center shrink-0`}>
                    <span className={`text-lg font-bold ${avatarText}`}>{initial}</span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 truncate">{chat.title || chat.id}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {chat.last_message_time ? new Date(chat.last_message_time).toLocaleDateString('id-ID') : ''}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {chat.last_message || "Menunggu balasan..."}
                    </p>
                    <div className="mt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">
                        {chat.kode_transaksi || `ID: ${chat.id}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 ml-2" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
