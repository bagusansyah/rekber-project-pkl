"use client"
export const runtime = 'edge';

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" 
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator" 
import { Textarea } from "@/components/ui/textarea"
import { Copy, MessageCircle, AlertCircle, Share2,  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Calendar,
  Package,Tag, ChevronRight,
  ShieldCheck, ShieldAlert  } from "lucide-react"
import { useParams } from 'next/navigation';
import { API_URL, getToken } from '@/constants/api';
import PaymentGateway from "@/app/dashboard/transactions/[id]/payment" 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';
import io from "socket.io-client";
import { Socket } from "socket.io-client";
import { getStatusBadge } from "@/app/components/atom/badge";
import { Toaster } from "sonner";
import { toast } from "sonner"
import Image from 'next/image'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import CountdownTimer from "@/components/CountdownTimer";
import { FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { decodeTransactionId, encodeTransactionId } from "@/lib/transactionId";

// const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL = API_URL;

interface StatusLog {
  id: number
  status: string
  name: string
  note: string
  created_at: string
}

interface Transaction {
  id: number
  kode_transaksi: string
  title: string
  buyer_name: string
  buyer_email: string | null
  buyer_phone: string | null
  buyer_is_verified?: boolean
  seller_name: string
  seller_email: string | null
  seller_phone: string | null
  seller_is_verified?: boolean
  status: string
  total_amount: string
  voucher_discount: string
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
  is_reports: boolean
  shipping_option: boolean
  work_duration: number | null
  expired_at: string | null
  is_partnership?: boolean | null
  partnership_percentage?: string | number | null
  product_images?: string[] | null
  public_token?: string | null
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

type TransactionStatusType = "draft" | "menunggu_pembayaran" | "sudah_bayar" | "selesai" | "sudah_dicairkan" | "cancelled";

export default function TransactionInterface() {
  const router = useRouter(); 
  const params = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [statusLogs, setStatusLogs] = useState<StatusLog[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const socketRef = useRef<Socket>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isConfirmCompleteOpen, setIsConfirmCompleteOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [successModalMessage, setSuccessModalMessage] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false) 
  const [reportReason, setReportReason] = useState('')
  const [reportImage, setReportImage] = useState<File | null>(null) 
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportDescription, setReportDescription] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [isShippingProofModalOpen, setIsShippingProofModalOpen] = useState(false);
  const [shippingProofDescription, setShippingProofDescription] = useState('');
  const [shippingProofImages, setShippingProofImages] = useState<File[]>([]);
  const [isSubmittingShippingProof, setIsSubmittingShippingProof] = useState(false); 
  const [shippingProofs, setShippingProofs] = useState<
    { id: number; description: string; image_url: string; uploaded_at: string; seller_id: number }[]
  >([]);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isShippingProofDetailModalOpen, setIsShippingProofDetailModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // URL berisi id yang sudah di-encode (lihat lib/transactionId.ts); decode di sini
  // supaya sisa halaman ini tetap memakai id asli seperti sebelumnya.
  const transactionId = decodeTransactionId(String(params?.id ?? '11'));

  const isSeller = transaction ? String(currentUserId) === String(transaction.seller_id) : false;

  // Transaksi yang dibuat lewat "Buat Transaksi" (form biasa) selalu sudah
  // punya buyer & seller sejak awal (dicari dulu lewat email/no HP), jadi
  // tidak pernah berstatus draft tanpa buyer. Hanya transaksi dari Payment
  // Link yang mulai dalam kondisi itu -- selama masih begitu, link yang
  // relevan untuk dibagikan adalah Payment Link-nya (lihat
  // publicTransactionController.js: isClaimable). Begitu sudah ada buyer
  // (baik dari Payment Link yang sudah diklaim, maupun transaksi biasa),
  // yang relevan dibagikan adalah link halaman transaksi ini sendiri.
  const isPaymentLinkStillClaimable = !!(
    transaction &&
    transaction.status === 'draft' &&
    !transaction.buyer_id &&
    transaction.public_token
  );
  const paymentLink = transaction?.public_token && origin ? `${origin}/pay/${transaction.public_token}` : '';
  const transactionShareLink = origin ? `${origin}/dashboard/transactions/${encodeTransactionId(transaction?.id ?? transactionId)}` : '';

  const token = getToken();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk scroll ke bawah
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

  // Read user_id from localStorage after mount (avoid SSR/hydration mismatch)
  useEffect(() => {
    setCurrentUserId(localStorage.getItem('user_id'));
  }, []);

  useEffect(() => {
    async function fetchTransaction() {
      try { 
        const res = await fetch(`${API_URL}/transactions/${transactionId}`, {
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

        // --- Tambahan: cek dan update buyer_id ---
        const userEmail = localStorage.getItem('email');
        if (
          data.transaction &&
          !data.transaction.buyer && // buyer belum diisi
          userEmail &&
          userEmail !== data.transaction.seller_email // user bukan seller
        ) {
          // Update buyer_id
          await fetch(`${API_URL}/transactions/waiting-payment`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              transaction_id: data.transaction.id,
              email: userEmail,
            }),
          });
        }
        // --- End tambahan ---
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
  // Mapping icon berdasarkan status
  const getProgressIcon = (status: string) => {
    const iconClass =
      status === "completed" ? "text-green-500" :
      status === "current" ? "text-blue-500" : "text-gray-400"

    switch (status) {
      case "pending":
        return <AlertCircle className={`h-4 w-4 ${iconClass}`} />
      case "completed":
        return <CheckCircle className={`h-4 w-4 ${iconClass}`} />
      case "current":
        return <Clock className={`h-4 w-4 ${iconClass}`} />
      default:
        return <Clock className={`h-4 w-4 ${iconClass}`} />
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
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 text-xs">Selesai</Badge>
      case "current":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Sedang Proses</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 text-xs">Menunggu</Badge>
    }
  }
const getVerificationBadge = (isVerified: boolean | undefined) => {
  return isVerified ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
      <ShieldCheck className="w-3 h-3" /> Terverifikasi
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded-full">
      <ShieldAlert className="w-3 h-3" /> Belum Verifikasi
    </span>
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

  const copyPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    toast.success("Nomor HP berhasil disalin!")
  };

const handleSendMessage = async () => {
  if (message.trim() && socketRef.current) {
    socketRef.current.emit("send_chat", {
      transaction_id: transactionId, 
      user_name: localStorage.getItem('name'),
      message: message
    });
    setMessage('');
    setTimeout(scrollToBottom, 100); // Scroll ke bawah setelah kirim pesan
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Buat timeline status berdasarkan statusLogs, buat status "current" di status terakhir
  const timeline = statusLogs.map((log, i) => {
    let statusType = "completed";
    
    if (i === statusLogs.length - 1) {
      // Jika ini adalah log terakhir
      if (log.status === "disbursed" || transaction?.status === "disbursed") {
        statusType = "completed"; // Disbursed dianggap completed
      } else {
        statusType = "current"; // Status lain tetap current untuk log terakhir
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
  const handleShareWhatsApp = () => {
    if (!transaction) return
    const shareText = `Transaksi ${transaction.kode_transaksi} - ${transaction.title}`
    const shareUrl = window.location.href
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`

    window.open(url, "_blank", "width=600,height=400")
    setIsShareModalOpen(false)
  }

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Tautan berhasil disalin!")
    } catch {
      toast.error("Gagal menyalin tautan")
    }
  }

  const handleCopyPaymentLink = async () => {
    if (!paymentLink) return
    try {
      await navigator.clipboard.writeText(paymentLink)
      toast.success("Payment Link berhasil disalin!")
    } catch {
      toast.error("Gagal menyalin Payment Link")
    }
  }

  const getPaymentLinkShareText = () => {
    const amount = transaction ? `Rp ${parseFloat(transaction.amount_paid).toLocaleString('id-ID')}` : ''
    return `💳 *Payment Link Aman via Rekber.com*\n\n~ *${transaction?.title}*\n~ Harga: ${amount}\n\n~ Bayar langsung di sini (tidak perlu akun/login):\n${paymentLink}`
  }

  const handleSharePaymentLinkWhatsApp = () => {
    if (!paymentLink) return
    const url = `https://wa.me/?text=${encodeURIComponent(getPaymentLinkShareText())}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const handleSharePaymentLinkTelegram = () => {
    if (!paymentLink) return
    const url = `https://t.me/share/url?url=${encodeURIComponent(paymentLink)}&text=${encodeURIComponent(getPaymentLinkShareText())}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const handleCopyTransactionShareLink = async () => {
    if (!transactionShareLink) return
    try {
      await navigator.clipboard.writeText(transactionShareLink)
      toast.success("Tautan transaksi berhasil disalin!")
    } catch {
      toast.error("Gagal menyalin tautan")
    }
  }

  const getTransactionShareText = () => {
    return `Transaksi ${transaction?.kode_transaksi} - ${transaction?.title}\n${transactionShareLink}`
  }

  const handleShareTransactionLinkWhatsApp = () => {
    if (!transactionShareLink) return
    const url = `https://wa.me/?text=${encodeURIComponent(getTransactionShareText())}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const handleShareTransactionLinkTelegram = () => {
    if (!transactionShareLink) return
    const url = `https://t.me/share/url?url=${encodeURIComponent(transactionShareLink)}&text=${encodeURIComponent(getTransactionShareText())}`
    window.open(url, "_blank", "width=600,height=400")
  }

useEffect(() => {
  socketRef.current = io(SOCKET_URL, {
    auth: { token: getToken() },
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
    // === [TAMBAHAN BARU: Realtime Status Update] ===
    // Listener ini akan aktif saat Cron Job Bagus mengubah status di database
    socketRef.current.on("transaction_status_update", (data: {
      new_log: unknown; transaction_id: string; status: string; expired_at?: string
}) => {
      // Pastikan update ini untuk transaksi yang sedang dibuka
      if (data.transaction_id == transactionId) {
        
        console.log("Status update received:", data);

        // A. Update State Lokal Transaksi
        setTransaction((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: data.status, // Update status (misal: 'cancel')
            // Jika ada data expired_at baru dikirim, update juga
            expired_at: data.expired_at || prev.expired_at 
          };
        });

        // B. Update Timeline / Log (Opsional: Tambahkan log baru ke state)
        if (data.new_log) {
          setStatusLogs((prevLogs) => [...prevLogs, data.new_log] as StatusLog[]);
        }

        // C. Tampilkan Notifikasi Toast
        if (data.status === 'cancel') {
          toast.error("Waktu pembayaran habis. Transaksi dibatalkan otomatis.");
        } else if (data.status === 'paid') {
          toast.success("Pembayaran berhasil dikonfirmasi!");
        }
      }
    });
  }

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, [transactionId]);
 
const handleSubmitReport = async () => {
  if (!reportReason.trim()) {
    toast.error("Alasan laporan harus diisi!");
    return;
  }

  setIsSubmittingReport(true);
  
  try {
    const formData = new FormData();
    formData.append('transaction_id', transactionId.toString());
    formData.append('report_type', 'transaction');
    formData.append('reason', reportReason);
    formData.append('description', reportDescription);
    
    if (reportImage) {
      formData.append('evidence', reportImage);
    }

    const res = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (res.ok) {
      toast.success("Laporan berhasil dikirim!");
      setIsReportModalOpen(false);
      setReportReason('');
      setReportDescription('');
      setReportImage(null);
      // Reset file input
      const fileInput = document.getElementById('report-evidence') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Gagal mengirim laporan");
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    toast.error("Terjadi kesalahan saat mengirim laporan");
  } finally {
    setIsSubmittingReport(false);
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

// Fungsi upload bukti pengiriman
const handleSubmitShippingProof = async () => {
  if (!shippingProofDescription.trim() || shippingProofImages.length === 0) {
    toast.error("Deskripsi dan minimal 1 gambar harus diisi!");
    return;
  }
  setIsSubmittingShippingProof(true);
  try {
    const formData = new FormData();
    formData.append('description', shippingProofDescription);
    shippingProofImages.forEach((file) => {
      formData.append('image', file);
    });
    const res = await fetch(`${API_URL}/transactions/${transactionId}/upload-shipping-proof`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (res.ok) {
      toast.success("Bukti pengiriman berhasil diupload!");
      setIsShippingProofModalOpen(false);
      setShippingProofDescription('');
      setShippingProofImages([]);
      // Refresh bukti pengiriman
      fetchShippingProofs();
    } else {
      const errorData = await res.json();
      toast.error(errorData.message || "Gagal upload bukti pengiriman");
    }
  } catch {
    toast.error("Terjadi kesalahan saat upload bukti pengiriman");
  } finally {
    setIsSubmittingShippingProof(false);
  }
};

// Fungsi fetch bukti pengiriman
const fetchShippingProofs = useCallback(async () => {
  try {
    const res = await fetch(`${API_URL}/transactions/${transactionId}/shipping-proofs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setShippingProofs(data.shipping_proofs || []);
    }
  } catch (error) {
    console.error("Error fetching shipping proofs:", error);
  }
}, [transactionId, token]);


useEffect(() => { 
  fetchShippingProofs();
}, [fetchShippingProofs]);

useEffect(() => { 
  return () => {
    if (selectedImage) {
      URL.revokeObjectURL(URL.createObjectURL(selectedImage));
    }
  };
}, [selectedImage]);


const renderStatusProgress = (currentStatus: TransactionStatusType) => {
  // KEBAL DATA: Dukung transaksi lama ('cancel') dan baru ('cancelled')
  const safeStatus = currentStatus?.toLowerCase() || '';
  const isCancelled = safeStatus === 'cancel' || safeStatus === 'cancelled';

  const statusSteps = [
    { key: "draft", label: "Draft", description: "Transaksi dibuat" },
    { key: "wait_payment", label: "Wait", description: "Pembeli belum melakukan pembayaran" },
    { 
      key: "paid", 
      label: "Paid", 
      description: <span>Menunggu konfirmasi barang dari penjual.</span>
    },
    { key: "completed", label: "Done", description: "Menunggu dana cair (H+1 - H+2 hari kerja)" },
    { key: "disbursed", label: "Disbursed", description: "Transaksi closed" },
  ] 
  
  // Cegah error index jika statusnya batal
  const currentStepIndex = isCancelled ? -1 : statusSteps.findIndex((step) => step.key === currentStatus)

  return ( 
    <div className="space-y-3"> 
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress Transaksi</span> 
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsTimelineModalOpen(true)}
            className="ml-2 h-auto p-0 gap-0.5"
          >
            Detail
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div> 

        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${
                      isCurrent
                        ? "bg-blue-600 border-blue-600"
                        : isCompleted
                          ? "bg-green-600 border-green-600"
                          : "bg-gray-200 border-gray-300"
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm leading-tight ${
                      isCurrent ? "text-blue-600 font-medium" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">
                      {step.key === "menunggu_pembayaran"
                        ? "Menunggu"
                        : step.key === "sudah_bayar"
                          ? "Bayar"
                          : step.key === "sudah_dicairkan"
                            ? "Cair"
                            : step.label}
                    </span>
                  </span>
                </div>
                {index < statusSteps.length - 1 && <span className="mx-0.5 sm:mx-1 text-gray-300">•</span>}
              </div>
            )
          })}
        </div>

        {/* TAMPILAN STATUS BERSIH & AMAN */}
        <div className={`text-xs p-3 rounded-lg border ${isCancelled ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-gray-600 border-blue-100'}`}>
          <span className="font-medium">Status saat ini: </span>
          {isCancelled 
            ? "Transaksi Dibatalkan (Expired/Manual)" 
            : statusSteps[currentStepIndex]?.description}
        </div>  
    </div>
  )
}

  return (
  <div className="min-h-screen bg-gray-50">
  <Toaster richColors position="top-center" />
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Kembali
                </Button>
                {getStatusBadge(transaction?.status ?? '...')}
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl text-balance">
                  {transaction?.title ? transaction.title : '-'}
                </CardTitle>
                <div className="mt-1.5">
                  <p className="text-xs font-medium text-gray-500">Nomor Transaksi</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-muted-foreground font-mono">{transaction?.kode_transaksi}</p>
                    <button
                      type="button"
                      onClick={copyTransactionId}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label="Salin nomor transaksi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* /* === [TAMBAHAN FAJAR: COUNTDOWN TIMER] === */}
              {/* Hanya muncul jika status Draft/Waiting Payment DAN ada tanggal expired */}
              {/* {(transaction?.status === 'draft' || transaction?.status === 'wait_payment') && transaction?.expired_at && (
                <div className="mb-4">
                    <CountdownTimer targetDate={transaction.expired_at} />
                </div>
              )} */}
              {/* ========================================= */}
               <div className="bg-gray-50 p-3 sm:p-3 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  {renderStatusProgress((transaction?.status as TransactionStatusType) ?? 'draft')}
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                  <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Pembeli</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">{transaction?.buyer_name ? transaction.buyer_name.charAt(0) : '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{transaction?.buyer_name ? transaction.buyer_name : '-'}</span>
                      {transaction?.buyer_name && getVerificationBadge(transaction?.buyer_is_verified)}
                    </div>
                  </div>
                  {transaction?.buyer_email && (
                    <p className="text-xs text-slate-500 mt-1.5 ml-10">{transaction.buyer_email}</p>
                  )}
                  {transaction?.buyer_phone && (
                    <div className="flex items-center gap-2 mt-1.5 ml-10">
                      <span className="text-xs text-slate-500">{transaction.buyer_phone}</span>
                      <button
                        type="button"
                        onClick={() => copyPhoneNumber(transaction.buyer_phone)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        aria-label="Salin nomor HP pembeli"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Penjual</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">{transaction?.seller_name ? transaction.seller_name.charAt(0) : '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{transaction?.seller_name ? transaction.seller_name : '-'}</span>
                      {transaction?.seller_name && getVerificationBadge(transaction?.seller_is_verified)}
                      {transaction?.is_partnership && (
                         <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 w-fit mt-0.5">
                           Partnership
                         </span>
                       )}
                    </div>
                  </div>
                  {transaction?.seller_email && (
                    <p className="text-xs text-slate-500 mt-1.5 ml-10">{transaction.seller_email}</p>
                  )}
                  {transaction?.seller_phone && (
                    <div className="flex items-center gap-2 mt-1.5 ml-10">
                      <span className="text-xs text-slate-500">{transaction.seller_phone}</span>
                      <button
                        type="button"
                        onClick={() => copyPhoneNumber(transaction.seller_phone)}
                        className="text-slate-400 hover:text-green-600 transition-colors"
                        aria-label="Salin nomor HP penjual"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Kategori Barang */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Kategori Barang</label>
                  <p className="mt-1">{transaction?.categ_id ? getCategoryName(transaction.categ_id) : '...'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                  <p className="mt-1">
                    {transaction?.created_at
                      ? new Date(transaction.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '...'}
                  </p>
                </div>
              </div>

              {transaction?.product_images && transaction.product_images.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Foto Produk</label>
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
                </div>
              )}

              {/* Detail sesuai kategori */}
              {transaction?.categ_id === 1 && (
                // Barang Fisik
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi Barang Fisik</label>
                  <p className="mt-1 whitespace-pre-wrap">{transaction?.notes ? transaction.notes : '-'}</p>
                </div>
              )}
              {transaction?.categ_id === 2 && (
                // Produk Digital
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi Produk Digital</label>
                  <p className="mt-1 whitespace-pre-wrap">{transaction?.notes ? transaction.notes : '-'}</p>
                </div>
              )}
              {transaction?.categ_id === 3 && (
                // Jasa dan Layanan
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi Jasa/Layanan</label>
                  <p className="mt-1 whitespace-pre-wrap">{transaction?.notes ? transaction.notes : '-'}</p>
                  <label className="text-sm font-medium text-muted-foreground">Lama Waktu Pengerjaan</label>
                  <p className="mt-1">{transaction?.work_duration ? `${transaction.work_duration} hari` : '-'}</p>
                  <label className="text-sm font-medium text-muted-foreground">Opsi Biaya Kirim</label>
                  <p className="mt-1">{transaction?.shipping_option ? 'Ada' : 'Tidak'}</p>
                </div>
              )}  
              
                <div className="space-y-2">
                  {shippingProofs.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsShippingProofDetailModalOpen(true)}
                    >
                      Bukti Pengiriman Barang
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>

              <div className="border-t pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Nilai Transaksi</p>
                    <p className="text-base font-semibold">
                      Rp {Number(transaction?.total_amount).toLocaleString('id-ID') ?? '0'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Biaya Admin</p>
                    <p className="text-base font-semibold text-orange-600">
                      Rp {Number(transaction?.fee_amount).toLocaleString('id-ID') ?? '0'}
                    </p>
                  </div>
                  
                  {transaction?.voucher_discount && Number(transaction.voucher_discount) > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Voucher
                      </p>
                      <p className="text-base font-semibold text-green-600">
                        -Rp {Number(transaction.voucher_discount).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <p className="text-base font-semibold text-gray-700">Total</p>
                    <p className="text-lg font-bold text-blue-600">
                      Rp {Number(transaction?.amount_paid).toLocaleString('id-ID') ?? '0'}
                    </p>
                  </div>

                  {(() => {
                       const isPartnershipActive = transaction?.is_partnership;
                       const percentage = Number(transaction?.partnership_percentage || 0);

                       if (!isSeller || !isPartnershipActive) return null;

                       return (
                         <>
                           <Separator className="my-2" />
                           <div className="flex justify-between items-center text-purple-700 bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                             <span className="text-xs font-bold flex items-center gap-1">
                               ✨ Partnership Active ({percentage}%)
                             </span>
                             <span className="text-xs bg-purple-100 px-2 py-0.5 rounded-full font-bold">
                               Active
                             </span>
                           </div> 

                        <div className="flex justify-between items-center text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                          <p className="text-sm text-green-800 font-medium">Cashback (Free Partnership)</p>
                          <p className="text-base font-semibold text-green-700">
                            +Rp {((Number(transaction.fee_amount || 0) * percentage) / 100).toLocaleString('id-ID')}
                          </p>
                        </div>

                        <div className="flex justify-between items-center p-2.5 bg-blue-50 border border-blue-100 rounded-lg mt-2">
                          <div>
                            <p className="text-sm font-bold text-blue-900">Nominal Transfer ke Seller</p>
                            <p className="text-[10px] text-blue-600">Pencairan dana bersih setelah cashback</p>
                          </div>
                          <p className="text-base font-bold text-blue-700">
                            Rp {(() => {
                              const totalAmount = Number(transaction?.total_amount || 0);
                              const feeAmount = Number(transaction?.fee_amount || 0);
                              const voucherDiscount = Number(transaction?.voucher_discount || 0);
                              const feeBy = transaction?.fee_by;
                              const cashback = (feeAmount * percentage) / 100;

                              let sellerBase = totalAmount - voucherDiscount;
                              if (feeBy === 'seller') {
                                sellerBase -= feeAmount;
                              }
                              const netPayout = sellerBase + cashback;
                              return Math.max(0, netPayout).toLocaleString('id-ID');
                            })()}
                          </p>
                        </div>
                      </>
                    );
                  })()}

                  {/* Actions Section - Moved below total */}
                  {/* <Separator className="my-4" />
                  <div className="space-y-2">
                    {transaction?.status === "wait_payment" && 
                      localStorage.getItem('user_id') == transaction?.buyer_id && (
                        <PaymentGateway 
                          baseAmount={Number(transaction?.amount_paid)} 
                          transactionId={transaction?.kode_transaksi ?? ''} 
                          onPaymentSelect={(method) => {
                            console.log('Selected payment method:', method)
                          }}
                        />
                    )} */}
                  <Separator className="my-4" />
                  {/* === REVISI: TAMPILAN STATUS CANCEL === */}
                  {(transaction?.status === "cancelled" || transaction?.status === "cancel") && (
                    <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-red-800">Transaksi Dibatalkan</p>
                        <p className="text-xs text-red-600 mt-1">
                          Transaksi ini telah dibatalkan secara otomatis (expired) atau manual. 
                          Anda tidak dapat melanjutkan transaksi ini.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    {/* LOGIKA: Hanya muncul jika status 'wait_payment' DAN user yang login adalah Pembeli */}
                    {transaction?.status === "wait_payment" && 
                    localStorage.getItem('user_id') == transaction?.buyer_id && (
                      <>
                        {/* REVISI FAJAR: Cek apakah waktu expired sudah lewat? */}
                        {(transaction?.expired_at && new Date(transaction.expired_at) < new Date()) ? (
                          
                          /* === SKENARIO 1: WAKTU HABIS (EXPIRED) === */
                          /* Tampilkan kotak merah peringatan, tombol bayar disembunyikan */
                          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-center animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <AlertCircle className="h-6 w-6 text-red-600 mb-1" />
                                <p className="text-red-700 font-bold text-sm">Waktu Pembayaran Habis</p>
                            </div>
                            <p className="text-xs text-red-600 mt-1 leading-relaxed">
                                Transaksi ini telah melewati batas waktu 24 jam. <br/>
                                Silakan buat transaksi baru.
                            </p>
                          </div>

                        ) : (

                          /* === SKENARIO 2: MASIH BERLAKU === */
                          /* Tampilkan Tombol Bayar (PaymentGateway) seperti biasa */
                          <PaymentGateway 
                            baseAmount={Number(transaction?.amount_paid)} 
                            transactionId={transaction?.kode_transaksi ?? ''} 
                            onPaymentSelect={(method) => {
                              console.log('Selected payment method:', method)
                            }}
                          />
                        )}
                      </>
                    )}
                    
                    {/* Disembunyikan sementara */}
                    {false && (
                      <Button className="w-full bg-transparent hover:bg-blue-50" variant="outline"
                          onClick={() => setIsShareModalOpen(true)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Link
                      </Button>
                    )}

                    <Button
                      className={`w-full bg-red-50 text-red-700 border-red-200 ${
                        transaction?.is_reports
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-red-100'
                      }`}
                      variant="outline"
                      onClick={() => !transaction?.is_reports && setIsReportModalOpen(true)}
                      disabled={transaction?.is_reports || isSubmittingReport}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {transaction?.is_reports ? 'Sudah Dilaporkan' : 'Laporkan Masalah'}
                    </Button>
                    {/* === [PINDAHAN TIMER: Posisi Bawah] === */}
                    {(transaction?.status === 'draft' || transaction?.status === 'wait_payment') && transaction?.expired_at && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                          <CountdownTimer targetDate={transaction.expired_at} />
                          <p className="text-[10px] text-center text-gray-400 mt-2">
                            Segera selesaikan pembayaran sebelum waktu habis agar transaksi tidak dibatalkan otomatis.
                          </p>
                      </div>
                    )}
                    {/* ====================================== */}
                    {transaction?.status === "paid"  && localStorage.getItem('user_id') == transaction.seller_id && (
                      <>
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => setIsShippingProofModalOpen(true)}
                          disabled={shippingProofs.length > 0}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          {shippingProofs.length > 0 ? 'Bukti Sudah Diupload' : 'Upload Bukti Pengiriman'}
                        </Button>
                        {shippingProofs.length === 0 && (
                          <div className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-medium text-orange-800">Upload Bukti Pengiriman Wajib!</p>
                                <p className="text-orange-700 mt-1">
                                  Anda harus mengupload bukti pengiriman sebagai syarat penyelesaian transaksi. Pembeli tidak dapat menyelesaikan transaksi sebelum bukti pengiriman diupload.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {transaction?.status === "draft" && 
                    localStorage.getItem('user_id') == transaction.seller_id && ( 
                    <Button className="w-full" variant="destructive" 
                        onClick={handleCancelTransaction}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Batalkan Transaksi
                    </Button>
                    )}

                  {transaction?.status === "paid" && 
                     localStorage.getItem('user_id') == transaction.buyer_id && (
                      <>
                        {shippingProofs.length === 0 ? (
                          <>
                            <Button 
                              onClick={() => setIsConfirmCompleteOpen(true)}
                              className="w-full bg-green-600 hover:bg-green-700 opacity-50 cursor-not-allowed" 
                              disabled={true}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Selesaikan Transaksi
                            </Button>
                            <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium text-yellow-800">Perhatian!</p>
                                  <p className="text-yellow-700 mt-1">
                                    Untuk alasan keamanan & transparansi, silakan hubungi penjual untuk melampirkan bukti pengiriman sebelum menyelesaikan transaksi.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Button 
                            onClick={() => setIsConfirmCompleteOpen(true)}
                            className="w-full bg-green-600 hover:bg-green-700" 
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Selesaikan Transaksi
                          </Button>
                        )}
                      </>
                    )}

                    {transaction?.status === "completed" && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4" />
                        <span>Transaksi Selesai</span>
                      </div>
                    )} 
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
 
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat Transaksi
              </CardTitle>
            </CardHeader> 
          <CardContent className="space-y-4"> 
            <ScrollArea ref={scrollAreaRef} className="max-h-[300px] h-[300px] overflow-y-auto">
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

            <div className="space-y-2">
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

          {transaction && (
            isPaymentLinkStillClaimable ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Bagikan Payment Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Transaksi ini belum punya pembeli. Bagikan link berikut agar pembeli bisa langsung
                    membayar tanpa perlu akun Rekber.com.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={paymentLink}
                      onFocus={(e) => e.target.select()}
                      className="flex-1 h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 truncate focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPaymentLink}
                      aria-label="Salin Payment Link"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={handleSharePaymentLinkWhatsApp}
                      className="w-full justify-center bg-green-500 text-white hover:bg-green-600"
                    >
                      <FaWhatsapp className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSharePaymentLinkTelegram}
                      className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <FaTelegram className="h-5 w-5 mr-2" />
                      Telegram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Bagikan Transaksi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Bagikan halaman transaksi ini sebagai referensi.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={transactionShareLink}
                      onFocus={(e) => e.target.select()}
                      className="flex-1 h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 truncate focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyTransactionShareLink}
                      aria-label="Salin tautan transaksi"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={handleShareTransactionLinkWhatsApp}
                      className="w-full justify-center bg-green-500 text-white hover:bg-green-600"
                    >
                      <FaWhatsapp className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      onClick={handleShareTransactionLinkTelegram}
                      className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <FaTelegram className="h-5 w-5 mr-2" />
                      Telegram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      <Dialog open={isConfirmCompleteOpen} onOpenChange={setIsConfirmCompleteOpen}>
        <DialogContent className="max-w-md mx-auto z-[999]">
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

      {/* Dialog Success */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="max-w-md mx-auto z-[999]">
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
        <DialogContent className="max-w-md mx-auto z-[999]">
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
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Bagikan Transaksi
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                onFocus={(e) => e.target.select()}
                className="flex-1 h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 truncate focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyShareLink}
                aria-label="Salin tautan"
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full justify-center bg-green-500 text-white hover:bg-green-600"
            >
              <FaWhatsapp className="h-5 w-5 mr-2" />
              Bagikan ke WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Laporkan Masalah
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Kategori Masalah <span className="text-red-500">*</span>
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Pilih kategori masalah</option>
                <option value="Ajukan Pengembalian Dana">Ajukan Pengembalian Dana</option>
                <option value="Penjual tidak mengirim barang">Penjual tidak mengirim barang</option>
                <option value="Barang tidak sesuai deskripsi">Barang tidak sesuai deskripsi</option>
                <option value="Pembeli tidak merespon">Pembeli tidak merespon</option>
                <option value="Penipuan">Penipuan</option>
                <option value="Kualitas barang buruk">Kualitas barang buruk</option>
                <option value="Pengiriman terlambat">Pengiriman terlambat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Deskripsi Detail <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Jelaskan secara detail masalah yang Anda alami..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Bukti Pendukung (Opsional)
              </label>
              <input
                id="report-evidence"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setReportImage(e.target.files?.[0] || null)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format yang didukung: JPG, PNG, PDF (Max 5MB)
              </p>
              {reportImage && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600">
                    📎 File: {reportImage.name} ({(reportImage.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ Laporan akan ditinjau oleh tim support kami dalam 1x24 jam. 
                Pastikan informasi yang Anda berikan akurat dan lengkap.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportReason('');
                  setReportDescription('');
                  setReportImage(null);
                }}
                className="border-gray-300 text-gray-700"
                disabled={isSubmittingReport}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitReport}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmittingReport || !reportReason.trim() || !reportDescription.trim()}
              >
                {isSubmittingReport ? "Mengirim..." : "Kirim Laporan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> 

      <Dialog open={isShippingProofModalOpen} onOpenChange={setIsShippingProofModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-orange-600 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Upload Bukti Pengiriman Barang
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Deskripsi Bukti Pengiriman <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Contoh: Barang sudah dikirim via JNE, resi: 123456789"
                value={shippingProofDescription}
                onChange={e => setShippingProofDescription(e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Upload Gambar Bukti (max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 5) {
                    toast.error("Maksimal 5 gambar!");
                    return;
                  }
                  setShippingProofImages(files);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format yang didukung: JPG, PNG (Max 5MB per file)
              </p>
              {shippingProofImages.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {shippingProofImages.map((img, idx) => (
                    <div key={idx} className="p-1 border rounded bg-gray-50">
                      <Image
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx + 1}`}
                        width={80}
                        height={60}
                        className="rounded object-cover"
                        unoptimized
                      />
                      <p className="text-xs text-gray-500">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsShippingProofModalOpen(false);
                  setShippingProofDescription('');
                  setShippingProofImages([]);
                }}
                className="border-gray-300 text-gray-700"
                disabled={isSubmittingShippingProof}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitShippingProof}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isSubmittingShippingProof || !shippingProofDescription.trim() || shippingProofImages.length === 0}
              >
                {isSubmittingShippingProof ? "Mengirim..." : "Upload Bukti"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timeline Modal */}
      <Dialog open={isTimelineModalOpen} onOpenChange={setIsTimelineModalOpen}>
        <DialogContent className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Transaksi
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px] overflow-y-auto">
            <div className="space-y-4 pr-4">
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
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
        </DialogContent>
      </Dialog>
      
  
      {/* Shipping Proof Detail Modal */}
      <Dialog open={isShippingProofDetailModalOpen} onOpenChange={setIsShippingProofDetailModalOpen}>
        <DialogContent className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Detail Bukti Pengiriman Barang
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[500px] overflow-y-auto">
            <div className="pr-4">
              {shippingProofs.length > 0 ? (
                (() => {
                  const proof = shippingProofs[0];
                  return (
                    <div className="mb-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-700">Deskripsi:</p>
                        <p className="text-sm text-gray-600">{proof.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-700">Gambar Bukti:</p>
                        <div className="flex gap-2 flex-wrap">
                          {shippingProofs.map((imgProof) => (
                            <Image
                              key={imgProof.id}
                              src={imgProof.image_url}
                              alt={`Bukti Pengiriman`}
                              width={120}
                              height={80}
                              className="rounded border object-cover cursor-pointer hover:opacity-80 transition"
                              unoptimized
                              onClick={() => {
                                setLightboxImage(imgProof.image_url);
                                setLightboxOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 border-t pt-3">
                        <p>
                          Diunggah: {new Date(proof.uploaded_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">
                    Belum ada bukti pengiriman yang diupload.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
