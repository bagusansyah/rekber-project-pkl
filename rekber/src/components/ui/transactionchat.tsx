"use client";

import React, { useEffect, useState, useRef } from "react";
import { initSocket } from "@/lib/socket"; // Import helper socket
import { Socket } from "socket.io-client";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Import komponen Shadcn UI milikmu
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Definisikan tipe data agar TypeScript senang
interface Message {
  user_id: number;
  user_name: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface ChatProps {
  transactionId: number | string;
  transactionCode: string;
  userToken: string;
  currentUserId: number;
}

const TransactionChat: React.FC<ChatProps> = ({ 
  transactionId, 
  transactionCode, 
  userToken, 
  currentUserId 
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Setup Socket
  useEffect(() => {
    if (!userToken || !transactionId) return;

    const newSocket = initSocket(userToken);
    
    if (newSocket) {
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        newSocket.emit("join_transaction", transactionId);
      });

      newSocket.on("disconnect", () => setIsConnected(false));

      newSocket.on("chat-history", (history: Message[]) => {
        setMessages(history);
        setIsLoading(false);
      });

      newSocket.on("chat-message", (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage]);
      });
    }

    return () => {
      newSocket?.disconnect();
    };
  }, [transactionId, userToken]);

  // Auto-scroll ke pesan terbawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 2. Handle Kirim Pesan
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit("send_chat", {
      transaction_id: transactionId,
      message: inputMessage,
    });

    setInputMessage("");
  };

  return (
    <Card className="w-full h-[600px] flex flex-col shadow-lg border-t-4 border-t-primary">
      {/* HEADER */}
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Chat Diskusi
              <Badge variant="outline" className="text-xs font-normal">
                #{transactionCode}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <p className="text-xs text-muted-foreground">
                {isConnected ? "Terhubung Realtime" : "Menghubungkan..."}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* BODY (MESSAGE LIST) */}
      <CardContent className="flex-1 p-0 overflow-hidden relative bg-slate-50/50">
        <ScrollArea className="h-full p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 mt-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Memuat riwayat chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <Alert className="mt-10 max-w-sm mx-auto bg-white">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Belum ada pesan</AlertTitle>
              <AlertDescription>
                Mulai diskusi dengan penjual/pembeli di sini.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isMe = msg.user_id === currentUserId;
                const isAdmin = msg.is_admin;

                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar User */}
                    <Avatar className="h-8 w-8 mt-1 border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.user_name}`} />
                      <AvatarFallback>{msg.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    {/* Bubble Chat */}
                    <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1">
                         <span className={`text-xs font-semibold ${isAdmin ? "text-orange-600" : "text-slate-700"}`}>
                           {isMe ? "Saya" : msg.user_name} {isAdmin && "(Admin)"}
                         </span>
                         <span className="text-[10px] text-muted-foreground">
                           {format(new Date(msg.created_at), "HH:mm", { locale: idLocale })}
                         </span>
                      </div>
                      
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : isAdmin
                            ? "bg-orange-100 text-orange-900 border border-orange-200 rounded-tl-none"
                            : "bg-white border text-slate-800 rounded-tl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Dummy element untuk scroll target */}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* FOOTER (INPUT) */}
      <CardFooter className="p-3 border-t bg-white">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button type="submit" size="icon" disabled={!inputMessage.trim() || !isConnected}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Kirim</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default TransactionChat;