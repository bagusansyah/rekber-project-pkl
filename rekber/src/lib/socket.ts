import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://api.rekber.com"; // Sesuaikan dengan port backend

export const initSocket = (token: string): Socket | null => {
  if (!token) return null;

  return io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
  });
};