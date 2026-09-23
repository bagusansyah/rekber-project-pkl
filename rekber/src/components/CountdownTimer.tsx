import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react'; // Pastikan install lucide-react

interface CountdownProps {
  targetDate: string; // Format string ISO dari database
}

const CountdownTimer: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    // Fungsi hitung mundur
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24) + Math.floor(difference / (1000 * 60 * 60 * 24)) * 24, // Total jam (termasuk hari)
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isExpired: false,
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      }
    };

    // Jalankan sekali saat mount
    calculateTimeLeft();

    // Update setiap 1 detik
    const timer = setInterval(calculateTimeLeft, 1000);

    // Bersihkan timer saat komponen hilang
    return () => clearInterval(timer);
  }, [targetDate]);

  // Loading state
  if (!timeLeft) return null;

  // TAMPILAN JIKA SUDAH EXPIRED
  if (timeLeft.isExpired) {
    return (
      <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 font-bold border border-red-200">
        <AlertCircle size={20} />
        <span>Waktu Habis / Expired</span>
      </div>
    );
  }

  // TAMPILAN HITUNG MUNDUR (Kuning/Merah)
  // Jika sisa kurang dari 1 jam, warna jadi merah & berkedip
  const isUrgent = timeLeft.hours === 0;

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-all
      ${isUrgent 
        ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
        : 'bg-orange-50 border-orange-200 text-orange-700'}
    `}>
      <Clock size={20} className={isUrgent ? 'animate-bounce' : ''} />
      
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
          Sisa Waktu Pembayaran
        </span>
        <span className="text-xl font-mono font-bold leading-none mt-1">
          {String(timeLeft.hours).padStart(2, '0')} : 
          {String(timeLeft.minutes).padStart(2, '0')} : 
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;