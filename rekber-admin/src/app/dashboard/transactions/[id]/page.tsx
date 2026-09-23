"use client"
export const runtime = 'edge';

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" 
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator" 
import { Textarea } from "@/components/ui/textarea"
import { Copy, MessageCircle, AlertCircle, Share2,  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MinusCircle,
  MessageSquare,
  User,
  Calendar,
  Package,
  ShieldCheck,
  ShieldAlert,  } from "lucide-react"
import { useParams } from 'next/navigation'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';
import io from "socket.io-client";
import { Socket } from "socket.io-client"; 
import { Toaster } from "sonner";
import { toast } from "sonner"
import Image from 'next/image'
import Lightbox from "yet-another-react-lightbox";
import { isPartnershipValue } from "@/lib/formatters";
// @ts-ignore
import "yet-another-react-lightbox/styles.css";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL; 
const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface StatusLog {
  id: number
  status: string
  name: string
  note: string
  created_at: string
}
interface PaymentDetail {
  id: number;
  amount: number;
  created_at: string;
  currency: string;
  external_id: string;
  fee: number;
  net_amount: number;
  payment_gateway: string;
  payment_method: string;
  reference_id: string;
  status: string;
  transaction_id: string;
  updated_at: string;
}
interface Transaction {
  id: number
  kode_transaksi: string
  title: string
  buyer_name: string
  buyer_is_verified?: boolean
  seller_name: string
  seller_is_verified?: boolean
  status: string
  total_amount: string
  fee_amount: string
  amount_paid: string
  is_funded: boolean
  funded_at: string | null
  notes: string
  created_at: string
  updated_at: string
  created_by: number
  fee_by: string | null 
  categ_id: number
  seller_id : string
  buyer_id: string
  is_partnership?: boolean | null
  partnership_percentage?: string | number | null
  product_images?: string[] | null
}

interface SocialPlatform {
  name: string
  icon: string
  color: string
  shareUrl: (url: string, text: string) => string
}

interface ChatMessage {
  id: number;
  user_id: string;
  user_name: string;
  message: string;
  image_url?: string; // Tambahkan field untuk image
  message_type: 'text' | 'image'; // Tambahkan type message
  created_at: string;
  is_admin: string;
} 

interface ShippingProof {
  id: number;
  seller_id: number;
  image_url: string;
  description: string;
  uploaded_at: string;
  formatted_date: string;
}

interface Report {
  id: number;
  reported_by: number;
  reporter_name: string;
  report_type: string;
  reason: string;
  description: string;
  evidence_url: string; // Single image, bukan array
  status: string;
  admin_response: string | null;
  reviewed_by: number | null;
  created_at: string;
  formatted_date: string;
}

interface BankInfo {
  type: string;
  purpose: string;
  recipient: string;
  bank: string;
  no_rekening: string;
  nama_rekening: string;
}

const quickReplyTemplates = [
  {
    label: "Menyapa",
    message: "Halo, kami dari tim admin Rekber. Ada yang bisa kami bantu?",
  },
  {
    label: "Terima kasih",
    message: "Terima kasih atas informasinya. Kami akan membantu menindaklanjutinya.",
  },
  {
    label: "Menunggu pencairan",
    message: "Saat ini transaksi masih menunggu proses pencairan. Kami akan menginformasikan kembali setelah proses selesai.",
  },
  {
    label: "Sedang diperiksa",
    message: "Laporan Anda sedang kami periksa. Mohon menunggu, kami akan memberikan kabar selanjutnya.",
  },
  {
    label: "Minta konfirmasi",
    message: "Mohon konfirmasi apabila informasi tersebut sudah sesuai agar kami dapat melanjutkan prosesnya.",
  },
];

const socialPlatforms: SocialPlatform[] = [
  {
    name: "WhatsApp",
    icon: "💬",
    color: "bg-green-500 hover:bg-green-600",
    shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    name: "Facebook",
    icon: "📘",
    color: "bg-blue-600 hover:bg-blue-700",
    shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },  
  {
    name: "Telegram",
    icon: "✈️",
    color: "bg-blue-500 hover:bg-blue-600",
    shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
]

export default function TransactionInterface() {
  const router = useRouter(); 
  const params = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false)
  const [isConfirmRefundOpen, setIsConfirmRefundOpen] = useState(false)
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [successModalMessage, setSuccessModalMessage] = useState('')
  const transactionId = params?.id ?? '0'; // fallback id 11 jika kosong 
  const [shippingProofs, setShippingProofs] = useState<ShippingProof[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null); 
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const token = localStorage.getItem("token");
  const scrollAreaRef = useRef<HTMLDivElement>(null); 
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // Fungsi untuk scroll ke bawah
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

  useEffect(() => {
    async function fetchTransaction() {
      try { 
        const res = await fetch(`${API_URL}/admin/dashboard/transactions/${transactionId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      if (res.status === 401) {
          // Token invalid/expired, lakukan logout
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          localStorage.removeItem('name');
          router.push('/auth/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch transaction data');
        const data = await res.json();
        setTransaction(data.transaction);
        setStatusLogs(data.status_logs);
        setPaymentDetail(data.payments);
        setShippingProofs(data.shipping_proofs || []);
        setReports(data.reports || []);
        setBankInfo(data.bank_info || null);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTransaction();
  }, [transactionId, token, router]);

  const handleCancelTransaction = async () => {
  if (!transaction?.id) return;

  try {
    const res = await fetch(`${API_URL}/transactions/${transaction.id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      router.push('/auth/login');
      return;
    }

    if (!res.ok) throw new Error('Failed to cancel transaction');

    // Refresh transaction data after cancellation
    const data = await res.json();
    setTransaction(data.transaction);
    
    // Optionally show success message
    alert('Transaksi berhasil dibatalkan');
    
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    alert('Gagal membatalkan transaksi');
  }
};

const handleDisbursedTransaction = async () => {
  if (!transaction?.id) return;

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/transactions/${transaction.id}/disbursed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        notes: 'Dana dicairkan oleh admin'
      })
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      router.push('/auth/login');
      return;
    }

    if (!res.ok) throw new Error('Gagal mencairkan dana');

    const data = await res.json();
    
    if (data.status) {
      // Refresh transaction data setelah disbursement
      const refreshRes = await fetch(`${API_URL}/admin/dashboard/transactions/${transactionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setTransaction(refreshData.transaction);
        setStatusLogs(refreshData.status_logs);
        setPaymentDetail(refreshData.payments); // Tambahkan ini
      }
      
      setSuccessModalMessage('Dana berhasil dicairkan dan notifikasi telah dikirim');
      setIsSuccessModalOpen(true);
      
      // Emit socket event untuk update real-time
      if (socketRef.current) {
        socketRef.current.emit("transaction_updated", {
          transaction_id: transactionId,
          status: "disbursed"
        });
      }
      
    } else {
      throw new Error(data.message || 'Gagal mencairkan dana');
    }
    
  } catch (error) {
    console.error('Error disbursing transaction:', error);
    setErrorModalMessage('Gagal mencairkan dana. Silakan coba lagi.');
    setIsErrorModalOpen(true);
  }
};

const handleCompleteTransaction = async () => {
  if (!transaction?.id) return;

  try {
    const res = await fetch(`${API_URL}/transactions/${transaction.id}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      router.push('/auth/login');
      return;
    }

    if (!res.ok) throw new Error('Gagal menyelesaikan transaksi');

    // Refresh transaction data setelah completion
    const data = await res.json();
    setTransaction(data.transaction);
    
    setIsConfirmCompleteOpen(false);
    setSuccessModalMessage('Transaksi berhasil diselesaikan!');
    setIsSuccessModalOpen(true);
    
  } catch (error) {
    console.error('Error completing transaction:', error);
    setIsConfirmCompleteOpen(false);
    setErrorModalMessage('Gagal menyelesaikan transaksi. Silakan coba lagi.');
    setIsErrorModalOpen(true);
  }
};

// Fungsi untuk handle upload image
const handleImageUpload = async (file: File) => {
  if (!file) return null;
  
  setIsUploadingImage(true);
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('transaction_id', transactionId.toString());
    
    const response = await fetch(`${API_URL}/chat/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to upload image');
    
    const result = await response.json();
    
    // Reset semua state terkait image upload
    setSelectedImage(null);
    setShowImagePreview(false);
    
    // Reset file input dengan cara yang lebih reliable
    const fileInput = document.getElementById('chat-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      fileInput.files = null;
    }
      
    toast.success('Gambar berhasil dikirim!');
    
    return result.image_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Gagal mengirim gambar');
    return null;
  } finally {
    setIsUploadingImage(false);
  }
};
const handleSendImage = async () => {
  if (!selectedImage || !socketRef.current) return;
  
  const imageUrl = await handleImageUpload(selectedImage);
  if (imageUrl) {
    // Optimistic update - langsung tambahkan ke local state
    const newMessage: ChatMessage = {
      id: Date.now(), // temporary ID
      user_id: localStorage.getItem('user_id') || '',
      user_name: localStorage.getItem('name') || 'You',
      message: '',
      image_url: imageUrl,
      message_type: 'image',
      created_at: new Date().toISOString(),
      is_admin: '0'
    };
    
    // Tambahkan ke state dulu untuk responsiveness
    setMessages((prev) => [...prev, newMessage]);
    
    // Kemudian emit ke socket
    socketRef.current.emit("send_image", {
      transaction_id: transactionId,
      user_name: localStorage.getItem('name'),
      image_url: imageUrl
    });
    
  }
};

const handleConfirmPayment = async () => {
  if (!transaction?.id) return;

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/transactions/${transaction.id}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      router.push('/auth/login');
      return;
    }

    if (!res.ok) throw new Error('Gagal mengkonfirmasi pembayaran');

    const data = await res.json();

    if (data.status) {
      const refreshRes = await fetch(`${API_URL}/admin/dashboard/transactions/${transactionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setTransaction(refreshData.transaction);
        setStatusLogs(refreshData.status_logs);
        setPaymentDetail(refreshData.payments);
      }

      setIsConfirmPaymentOpen(false);
      setSuccessModalMessage('Pembayaran berhasil dikonfirmasi');
      setIsSuccessModalOpen(true);
    } else {
      throw new Error(data.message || 'Gagal mengkonfirmasi pembayaran');
    }

  } catch (error) {
    console.error('Error confirming payment:', error);
    setIsConfirmPaymentOpen(false);
    setErrorModalMessage('Gagal mengkonfirmasi pembayaran. Silakan coba lagi.');
    setIsErrorModalOpen(true);
  }
};

const handleRefundTransaction = async () => {
  if (!transaction?.id) return;

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/transactions/${transaction.id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        notes: 'Dana dikembalikan oleh admin'
      })
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      router.push('/auth/login');
      return;
    }

    if (!res.ok) throw new Error('Gagal mengembalikan dana');

    const data = await res.json();
    
    if (data.status) {
      // Refresh transaction data setelah refund
      const refreshRes = await fetch(`${API_URL}/admin/dashboard/transactions/${transactionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setTransaction(refreshData.transaction);
        setStatusLogs(refreshData.status_logs);
        setPaymentDetail(refreshData.payments);
      }
      
      setIsConfirmRefundOpen(false);
      setSuccessModalMessage('Dana berhasil dikembalikan dan notifikasi telah dikirim');
      setIsSuccessModalOpen(true);
      
      // Emit socket event untuk update real-time
      if (socketRef.current) {
        socketRef.current.emit("transaction_updated", {
          transaction_id: transactionId,
          status: "refunded"
        });
      }
      
    } else {
      throw new Error(data.message || 'Gagal mengembalikan dana');
    }
    
  } catch (error) {
    console.error('Error refunding transaction:', error);
    setIsConfirmRefundOpen(false);
    setErrorModalMessage('Gagal mengembalikan dana. Silakan coba lagi.');
    setIsErrorModalOpen(true);
  }
};
  // Mapping icon berdasarkan status
  const getProgressIcon = (status: string) => {
    // Amankan string dari perbedaan huruf besar/kecil
    const safeStatus = status?.toLowerCase() || "";

    switch (safeStatus) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      
      // === REVISI: Tambahkan deteksi status batal / gagal ===
      case "failed":
      case "cancel":
      case "cancelled":
      case "refunded":
        return <XCircle className="h-4 w-4 text-red-500" />;
      
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      
      case "current":
        return <Clock className="h-4 w-4 text-blue-500" />;
      
      default:
        // Status riwayat masa lalu (default)
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

function getStatusBadge(status: string) {
  const safeStatus = status?.toLowerCase() || "";
  switch (safeStatus) {
    case "draft":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Draft
        </Badge>
      )
    case "wait_payment":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          Menunggu Pembayaran
        </Badge>
      )
    case "disbursed":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Sudah Dicairkan
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
          Sudah Dibayar
        </Badge>
      )
    case "disputed":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          Bermasalah
        </Badge>
      )
    case "refunded":
      return (
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          Dana Dikembalikan
        </Badge>
      )
    case "cancel":
    case "cancelled":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 font-semibold border border-red-200">
          Dibatalkan
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

  function formatIndoDate(dateStr: string) {
    const date = new Date(dateStr.replace(' ', 'T')); // agar bisa di-parse JS
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Mapping badge status
  const getProgressBadge = (status: string) => {
    // Amankan string dari perbedaan huruf besar/kecil
    const safeStatus = status?.toLowerCase() || "";

    switch (safeStatus) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 text-xs">Selesai</Badge>;
      case "current":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Sedang Proses</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      
      // === REVISI: Tambahkan deteksi status batal / gagal ===
      case "failed":
      case "cancel":
      case "cancelled":
      case "refunded":
        return <Badge className="bg-red-100 text-red-800 text-xs">Dibatalkan</Badge>;
        
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs">Menunggu</Badge>;
    }
  };

const getVerificationBadge = (isVerified: boolean | undefined) => {
  return isVerified ? (
    <Badge className="mt-1 w-fit border font-semibold text-[10px] rounded px-1.5 py-0.5 shadow-none flex gap-1 items-center bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
      <ShieldCheck className="h-3 w-3" />
      Terverifikasi
    </Badge>
  ) : (
    <Badge className="mt-1 w-fit border font-semibold text-[10px] rounded px-1.5 py-0.5 shadow-none flex gap-1 items-center bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
      <ShieldAlert className="h-3 w-3" />
      Belum Verifikasi
    </Badge>
  )
}

const getCategoryName = (categId: number) => {
  switch (categId) {
    case 1:
      return "Barang Fisik";
    case 2:
      return "Barang Digital";
    case 3:
      return "Jasa";
    default:
      return "Lainnya";
  }
};

  const copyTransactionId = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.kode_transaksi);
      toast.success("Nomor transaksi berhasil disalin!")
    }
  };

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text) return;

    const payload = {
      transaction_id: transactionId,
      user_name: localStorage.getItem('name'),
      is_admin: true,
      message: text,
    };

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("send_chat", payload);
      } else {
        const response = await fetch(`${API_URL}/transactions/${transactionId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text }),
        });

        if (!response.ok) throw new Error('Gagal mengirim pesan');
        const result = await response.json();
        if (result.data) setMessages((prev) => [...prev, result.data]);
      }

      setMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Gagal mengirim pesan');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const addQuickReply = (template: string) => {
    setMessage((currentMessage) =>
      currentMessage.trim() ? `${currentMessage.trim()} ${template}` : template
    );
  };

  // Buat timeline status berdasarkan statusLogs, buat status "current" di status terakhir
  const timeline = statusLogs.map((log, i) => {
    let statusType = "completed";

    if (i === statusLogs.length - 1) {
      // Ambil status paling mutakhir, kebal huruf besar/kecil
      const currentStatus = transaction?.status?.toLowerCase() || log.status.toLowerCase();
      
      if (currentStatus === "disbursed" || currentStatus === "completed") {
        statusType = "completed"; 
      } else if (currentStatus === "cancel" || currentStatus === "cancelled" || currentStatus === "refunded") {
        statusType = "failed"; // <-- LOGIKA BARU: Deteksi Batal
      } else {
        statusType = "current"; 
      }
    }
    
    return {
      id: log.id.toString(),
      title: log.name,
      description: log.note,
      status: statusType,
      timestamp: log.created_at,
      icon: log.status,
    };
  });
  
  const handleShare = (platform: SocialPlatform) => {
    if (transaction) {
      const shareText = `Transaksi ${transaction.kode_transaksi} - ${transaction.title}`
      const shareUrl = window.location.href
      const url = platform.shareUrl(shareUrl, shareText)

      window.open(url, "_blank", "width=600,height=400")
      setIsShareModalOpen(false) 
    } 
  }
  

  useEffect(() => {
    let isMounted = true;
    const loadChatHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions/${transactionId}/chat`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const history = await response.json();
        if (isMounted && Array.isArray(history)) {
          setMessages(history.sort((a: ChatMessage, b: ChatMessage) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ));
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
    socketRef.current = io(SOCKET_URL || "http://localhost:5000", {
      auth: { token: token },
      query: { transactionId }
    });

    if (socketRef.current) {
      // Listener untuk text message
      socketRef.current.on("chat-message", (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 100);
      });

      socketRef.current.emit("join_transaction", transactionId);

      socketRef.current.on("chat-history", (history: ChatMessage[]) => {
        // Sort berdasarkan timestamp untuk urutan yang benar
        const sortedHistory = history.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedHistory); // Hapus .reverse() karena sudah di-sort ascending
        setTimeout(scrollToBottom, 100);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error('Socket chat connection error:', error.message);
      });
    }

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [transactionId, token]);
  
  return (
  <div className="min-h-screen bg-gray-50">
  <Toaster richColors position="top-center" />
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold text-balance">Detail Transaksi</h3>
          <p className="text-sm sm:text-base text-muted-foreground truncate">{transaction?.kode_transaksi}</p>
        </div>
        <Button
          variant="outline"
          className="sm:ml-auto"
          onClick={handleOpenChat}
          title="Balas chat transaksi"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Balas Chat
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informasi Transaksi
                </CardTitle>
                {getStatusBadge(transaction?.status ?? '...')}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-1xl font-bold text-balance">{transaction?.title ? transaction.title : '-'}</h3>
              {transaction?.product_images && transaction.product_images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {transaction.product_images.map((imgUrl, idx) => (
                    <Image
                      key={idx}
                      src={imgUrl}
                      alt={`${transaction.title || 'Foto produk'} ${idx + 1}`}
                      width={128}
                      height={128}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setLightboxImage(imgUrl);
                        setLightboxOpen(true);
                      }}
                      unoptimized
                    />
                  ))}
                </div>
              )}
              <div className='flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200'>
                <div>
                  <p className='text-sm font-medium text-slate-700'>Nomor Transaksi</p>
                  <p className='text-lg font-mono font-bold text-slate-900'>
                    {transaction?.kode_transaksi ?? '...'}
                  </p>
                </div>
                <Button
                  onClick={copyTransactionId}
                  variant='outline'
                  size='sm'
                  className='border-slate-200 text-slate-600 hover:bg-slate-50'
                >
                  <Copy className='w-4 h-4' />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pembeli</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <p className="font-medium">{transaction?.buyer_name ? transaction.buyer_name : '-'}</p>
                      {transaction?.buyer_name && getVerificationBadge(transaction?.buyer_is_verified)}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Penjual</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <p className="font-medium">{transaction?.seller_name}</p>
                      {transaction?.seller_name && getVerificationBadge(transaction?.seller_is_verified)}
                      <Badge
                        className={`mt-1 w-fit border font-semibold text-[10px] rounded px-1.5 py-0.5 shadow-none flex gap-1 items-center ${
                          isPartnershipValue(transaction?.is_partnership)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {isPartnershipValue(transaction?.is_partnership) ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <MinusCircle className="h-3 w-3" />
                        )}
                        {isPartnershipValue(transaction?.is_partnership) ? "Partnership" : "Non Partnership"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Kategori Barang</label>
                  <p className="mt-1">{transaction?.categ_id ? getCategoryName(transaction.categ_id) : '...'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                  <p className="mt-1">{transaction?.created_at ? new Date(transaction.created_at).toLocaleDateString('id-ID') : '...'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                  <p className="mt-1">{transaction?.notes ? transaction.notes : '-'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Harga</label>
                  <p className="font-bold text-lg">Rp {Number(transaction?.total_amount).toLocaleString('id-ID') ?? '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Biaya Admin</label>
                  <p className="font-medium">Rp {Number(transaction?.fee_amount).toLocaleString('id-ID') ?? '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Detail Card - hanya tampilkan jika ada paymentDetail */}
          {paymentDetail && (
            console.log("PAYMENT :", JSON.stringify(paymentDetail, null, 2)),
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Detail Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Metode Pembayaran</label>
                    <p className="font-medium">{paymentDetail.payment_method}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gateway</label>
                    <p className="font-medium">{paymentDetail.payment_gateway}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">External ID</label>
                    <p className="font-medium">{paymentDetail.external_id}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Detail Pembayaran</label>
                  <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="text-sm font-medium">
                        {paymentDetail.currency} {Number(paymentDetail.amount).toLocaleString('id-ID')}
                      </span>
                    </div> 
                    <div className="flex justify-between">
                      <span className="text-sm">Net Amount:</span>
                      <span className="text-sm font-medium">
                        {paymentDetail.currency} {Number(paymentDetail.net_amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Reference ID:</span>
                      <span className="text-sm font-medium">{paymentDetail.reference_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Transaction ID:</span>
                      <span className="text-sm font-medium">{paymentDetail.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Dibuat:</span>
                      <span className="text-sm font-medium">
                        {new Date(paymentDetail.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )} 
          {/* Bank Info Card - selalu tampilkan */}
          <Card ref={chatSectionRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                Informasi Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankInfo ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tujuan</label>
                      <p className="font-medium">{bankInfo.purpose}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Penerima</label>
                      <p className="font-medium">{bankInfo.recipient}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bank</label>
                      <p className="font-medium">{bankInfo.bank}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">No. Rekening</label>
                      <p className="font-medium">{bankInfo.no_rekening}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nama Rekening</label>
                    <p className="font-medium">{bankInfo.nama_rekening}</p>
                  </div>

                  {bankInfo.type === 'seller' ? (
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <h4 className="font-semibold text-sm text-gray-900 text-slate-800">Rincian Pembayaran Transfer</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Admin Fee</label>
                          <p className="font-medium text-base">Rp {Number(transaction?.fee_amount || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Fee Partnership</label>
                          <p className="font-medium text-base">
                            Rp {transaction?.is_partnership 
                              ? ((Number(transaction?.fee_amount || 0) * Number(transaction?.partnership_percentage || 0)) / 100).toLocaleString('id-ID') 
                              : '0'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Transfer Seller (Nominal Transfer)</label>
                        <p className="font-bold text-lg text-green-600">
                          Rp {(
                            Number(transaction?.total_amount || 0) +
                            (transaction?.is_partnership
                              ? (Number(transaction?.fee_amount || 0) * Number(transaction?.partnership_percentage || 0)) / 100
                              : 0)
                          ).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4 mt-4">
                      <label className="text-sm font-medium text-muted-foreground">Nominal Refund (Nominal Transfer)</label>
                      <p className="font-bold text-lg text-orange-600">
                        Rp {Number(transaction?.amount_paid || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum Ada Informasi Transfer</p>
                  <p className="text-gray-400 text-sm mt-1">Informasi transfer akan muncul setelah dana dicairkan</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Shipping Proofs Card - selalu tampilkan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Bukti Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shippingProofs.length > 0 ? (
                shippingProofs.map((proof, index) => (
                  <div key={proof.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Bukti #{index + 1}</h4>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {proof.formatted_date}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{proof.description}</p>
                    {proof.image_url ? (
                      <div className="relative">
                        <Image 
                          src={proof.image_url} 
                          alt="Bukti Pengiriman"
                          width={400}
                          height={192}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                          loading="lazy"
                          onClick={() => {
                            setLightboxImage(proof.image_url);
                            setLightboxOpen(true);
                          }}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-gray-500 italic">
                        Bukti gambar tidak tersedia
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum Ada Bukti Pengiriman</p>
                  <p className="text-gray-400 text-sm mt-1">Penjual belum mengunggah bukti pengiriman</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports Card - selalu tampilkan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Laporan Masalah {reports.length > 0 && `(${reports.length} laporan)`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.length > 0 ? (
                <> 
                  {reports.map((report, index) => (
                    <div key={report.id} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-red-800">
                            Laporan {report.report_type === 'buyer' ? 'Pembeli' : 'Penjual'}
                          </h4>
                          <p className="text-sm text-red-600">oleh: {report.reporter_name}</p> 
                        </div>
                        <div className="text-right"> 
                          <p className="text-xs text-gray-500">{report.formatted_date}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-red-700 mb-1">Alasan Laporan:</p>
                        <p className="text-sm font-semibold">{report.reason}</p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-red-700 mb-1">Penjelasan Detail:</p>
                        <p className="text-sm">{report.description}</p>
                      </div> 
                      {/* Single Evidence Image */}
                      {report.evidence_url && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2">Bukti Laporan:</p>
                          <div className="relative max-w-md">
                            <img 
                            src={report.evidence_url} 
                            alt={`Bukti Laporan dari ${report.reporter_name}`}
                            className="w-full max-w-lg max-h-64 object-contain rounded-lg border cursor-pointer hover:opacity-80 transition-opacity shadow-sm bg-gray-50"
                            loading="lazy"
                            onClick={() => window.open(report.evidence_url, '_blank')}
                          />
                          </div>
                        </div>
                      )}

                    </div>
                  ))} 
                  {reports.length === 2 && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <p className="text-sm font-medium text-orange-800">Perhatian: Konflik Laporan</p>
                      </div>
                      <p className="text-xs text-orange-700">
                        Terdapat laporan dari kedua belah pihak. Harap review dengan teliti untuk menentukan tindakan yang tepat.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak Ada Laporan Masalah</p>
                  <p className="text-gray-400 text-sm mt-1">Transaksi berjalan lancar tanpa keluhan</p>
                </div>
              )}
            </CardContent>
          </Card> 
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
            <ScrollArea className="max-h-70 overflow-y-auto">
                <div className="space-y-4">
                  {timeline.length === 0 ? (
                    <p className="text-gray-500 text-center">Belum ada log status</p>
                  ) : (
                    timeline.map((step, index) => (
                      <div key={step.id} className="relative">
                        {index < timeline.length - 1 && (
                          <div className="absolute left-5 top-8 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        <div className="flex items-start space-x-3">
                          <div
                            className={`shrink-0 h-10 rounded-full flex items-center justify-center border-2 ${
                              step.status === "completed"
                                ? "bg-green-50 border-green-200"
                                : step.status === "current"
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            {getProgressIcon(step.status)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium text-sm ${step.status === "current" ? "text-blue-600" : "text-gray-900"}`}>
                                {step.title} 
                              </h4>
                              {getProgressBadge(step.status)}
                            </div>

                            <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                            {step.timestamp && (
                              <p className="text-xs text-gray-500">
                                {new Date(step.timestamp).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2"> 
              <Button className="w-full bg-transparent   hover:bg-blue-50" variant="outline" 
                  onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>

              {/* ADMIN: Konfirmasi Pembayaran Manual */}
              {transaction?.status === "wait_payment" && (
                <Button
                  onClick={() => setIsConfirmPaymentOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Konfirmasi Pembayaran Manual
                </Button>
              )}

              {/* ADMIN: Force Cancel (Bisa membatalkan jika status masih draft / wait_payment) */}
              {(transaction?.status === "draft" || transaction?.status === "wait_payment") && (
              <Button className="w-full" variant="destructive" 
                  onClick={handleCancelTransaction}>
                <XCircle className="h-4 w-4 mr-2" />
                Batalkan Transaksi (Force)
              </Button>
              )}

              {/* ADMIN: Force Complete (Bisa memaksa selesai jika pembeli tidak merespon setelah dibayar) */}
              {transaction?.status === "paid" && (
                <Button 
                  onClick={() => setIsConfirmCompleteOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Selesaikan Transaksi (Force)
                </Button>
              )}


              {/* ADMIN: Pencairan Dana (Hanya saat status sudah completed) */}
              {transaction?.status === "completed" && (
                 <Button 
                  onClick={handleDisbursedTransaction}
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                >
                <CheckCircle className="h-4 w-4 mr-2" />
                  Cairkan Dana ke Penjual
                </Button>
              )}

              {/* ADMIN: Refund (Jika status berbayar atau selesai tapi ada komplain parah) */}
              {(transaction?.status === "paid" || transaction?.status === "completed" || transaction?.status === "disputed") && (
                <Button 
                  onClick={() => setIsConfirmRefundOpen(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refund Dana ke Pembeli
                </Button>
              )}
            </CardContent>
          </Card>

              {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Transaksi
              </CardTitle>
            </CardHeader> 
          <CardContent className="space-y-4"> 
            <ScrollArea ref={scrollAreaRef} className="max-h-75 h-75 overflow-y-auto">
              <div className="space-y-4 py-4 h-full">
                {messages.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-full text-center py-2'>
                    <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
                      <MessageCircle className='w-8 h-8 text-slate-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-slate-700 mb-2'>Belum ada percakapan</h3>
                    <p className='text-slate-500 text-sm'>Mulai komunikasi dengan mengirim pesan.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.user_id == (localStorage.getItem('user_id') || 'You');
                      const isAdmin = msg.is_admin;
                      
                      return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`rounded-lg px-4 py-2 max-w-xs ${
                            isAdmin 
                              ? 'bg-orange-500 text-white' 
                              : isMe 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-800'
                          }`}>
                            <p className={`text-xs mb-1 font-medium ${
                              isAdmin 
                                ? 'text-orange-100' 
                                : isMe 
                                  ? 'text-blue-100' 
                                  : 'text-gray-600'
                            }`}>
                              {isAdmin ? '🛡️ Admin' : msg.user_name || (isMe ? 'You' : 'User')}
                            </p>
                            
                            {msg.message_type === 'image' && msg.image_url ? (
                              <div className="space-y-2">
                                <Image 
                                  src={msg.image_url} 
                                  alt="Shared image" 
                                  width={192} // w-48 = 192px
                                  height={128} // h-32 = 128px
                                  className="w-40 h-28 sm:w-48 sm:h-32 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 shadow-sm"
                                  onClick={() => {
                                    if (msg.image_url) {
                                      setLightboxImage(msg.image_url);
                                      setLightboxOpen(true);
                                    }
                                  }}
                                  unoptimized // Untuk external images yang tidak dari domain yang sama
                                />
                                {msg.message && (
                                  <p className='text-sm'>{msg.message}</p>
                                )}
                              </div>
                            ) : (
                              <p className='text-sm'>{msg.message}</p>
                            )}
                            
                            <p className='text-xs mt-1 opacity-75'>{formatIndoDate(msg.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea> 
        {lightboxOpen && (
            <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              slides={[{ src: lightboxImage }]}
              render={{
                buttonPrev: () => null,
                buttonNext: () => null,
              }}
            />
          )}
         {showImagePreview && selectedImage && (
          <div className="mb-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Preview Gambar:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Reset state
                  setSelectedImage(null);
                  setShowImagePreview(false);
                  
                  // Reset file input
                  const fileInput = document.getElementById('chat-image-input') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.value = '';
                    fileInput.files = null;
                  }
                  
                  // Revoke object URL untuk cleanup memory
                  if (selectedImage) {
                    URL.revokeObjectURL(URL.createObjectURL(selectedImage));
                  }
                }}
              >
                ✕
              </Button>
            </div>
           <Image 
              src={URL.createObjectURL(selectedImage)} 
              alt="Preview" 
              width={300}
              height={128}
              className="max-w-full h-32 object-cover rounded-md"
              unoptimized // Untuk blob URLs
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <Button
              onClick={handleSendImage}
              disabled={isUploadingImage}
              className="w-full mt-2"
              size="sm"
            >
              {isUploadingImage ? 'Mengirim...' : 'Kirim Gambar'}
            </Button>
          </div>
        )}

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Template balasan</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplyTemplates.map((template) => (
                    <Button
                      key={template.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => addQuickReply(template.message)}
                    >
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Tulis pesan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={3}
              />
              
              {/* Buttons for send message and image */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()} 
                  className="flex-1"
                >
                  Kirim Pesan
                </Button>
                
                <div className="relative">
                  <input
                    id="chat-image-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validasi ukuran file (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Ukuran file terlalu besar. Maksimal 5MB');
                          return;
                        }
                        setSelectedImage(file);
                        setShowImagePreview(true);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const fileInput = document.getElementById('chat-image-input') as HTMLInputElement;
                      fileInput?.click();
                    }}
                    disabled={isUploadingImage}
                    className="px-3"
                  >
                    📷
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isConfirmCompleteOpen} onOpenChange={setIsConfirmCompleteOpen}>
        <DialogContent className="max-w-md mx-auto z-999">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Selesaikan Transaksi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menyelesaikan transaksi ini? Aksi ini tidak dapat dibatalkan dan dana akan dilepaskan ke penjual.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsConfirmCompleteOpen(false)}
                className="border-gray-300 text-gray-700"
              >
                Batal
              </Button>
              <Button
                onClick={handleCompleteTransaction}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Ya, Selesaikan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Pembayaran Manual */}
      <Dialog open={isConfirmPaymentOpen} onOpenChange={setIsConfirmPaymentOpen}>
        <DialogContent className="max-w-md mx-auto z-999">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Konfirmasi Pembayaran Manual
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin mengkonfirmasi pembayaran manual untuk transaksi ini? Status transaksi akan berubah menjadi "Sudah Dibayar".
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                ℹ️ Pastikan Anda telah memverifikasi bukti pembayaran sebelum melanjutkan.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsConfirmPaymentOpen(false)}
                className="border-gray-300 text-gray-700"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ya, Konfirmasi Pembayaran
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Refund */}
      <Dialog open={isConfirmRefundOpen} onOpenChange={setIsConfirmRefundOpen}>
        <DialogContent className="max-w-md mx-auto z-999">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-orange-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Refund Dana
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin mengembalikan dana transaksi ini? Dana akan dikembalikan ke pembeli dan status transaksi akan berubah menjadi "Refunded".
            </p>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">
                ⚠️ Peringatan: Aksi ini tidak dapat dibatalkan!
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsConfirmRefundOpen(false)}
                className="border-gray-300 text-gray-700"
              >
                Batal
              </Button>
              <Button
                onClick={handleRefundTransaction}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Ya, Refund Dana
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Success */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md mx-auto z-999">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Berhasil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{successModalMessage}</p>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  window.location.reload();
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Error */}
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent className="max-w-md mx-auto z-999">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Gagal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{errorModalMessage}</p>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsErrorModalOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
               Bagikan Transaksi</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-4">Bagikan link transaksi ini ke platform media sosial</div>

            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className={`w-full justify-start text-white ${platform.color}`}
              >
                <span className="text-xl mr-3">{platform.icon}</span>
                Bagikan ke {platform.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
    </div>
  )
}
