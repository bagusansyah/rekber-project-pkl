'use client';
 
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Camera, CircleDot, Loader2, RefreshCcw, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
 
export type CaptureMode = 'photo' | 'video';
export type GuideShape = 'card' | 'face' | 'face-and-card';

const VIDEO_MIME_CANDIDATES = [
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

// ImageCapture adalah API eksperimental yang belum ada di lib.dom.d.ts bawaan
// TypeScript, jadi dideklarasikan minimal di sini alih-alih pakai `any`.
interface PhotoCapabilityRangeLike {
  min: number;
  max: number;
  step: number;
}
interface PhotoCapabilitiesLike {
  imageWidth?: PhotoCapabilityRangeLike;
  imageHeight?: PhotoCapabilityRangeLike;
}
interface PhotoSettingsLike {
  imageWidth?: number;
  imageHeight?: number;
}
interface ImageCaptureLike {
  takePhoto(settings?: PhotoSettingsLike): Promise<Blob>;
  getPhotoCapabilities(): Promise<PhotoCapabilitiesLike>;
}
interface ImageCaptureConstructor {
  new (track: MediaStreamTrack): ImageCaptureLike;
}

// focusMode juga belum ada di MediaTrackConstraintSet bawaan TypeScript —
// hanya didukung sebagian browser (terutama Chrome/Android), tapi constraint
// yang tidak dikenal browser lain akan diabaikan dengan aman.
interface FocusConstraintSet extends MediaTrackConstraintSet {
  focusMode?: 'continuous' | 'single-shot' | 'manual' | 'none';
}

function pickSupportedVideoMimeType(): string {
  for (const type of VIDEO_MIME_CANDIDATES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'video/webm';
}

const SPOTLIGHT_SHADOW = { boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' };

// Durasi maksimal video selfie — otomatis berhenti setelah durasi ini tercapai.
const VIDEO_MAX_DURATION_MS = 8000;

// Guide selfie+KTP: satu overlay gelap rata dengan dua lubang presisi (oval
// wajah + kotak KTP), dihitung dalam pixel asli lewat ukuran viewport dan
// digambar sebagai satu SVG mask — bukan CSS mask-composite (dukungan
// browser tidak konsisten di semua HP) dan bukan box-shadow (dua box-shadow
// terpisah saling menggelapkan lubang satu sama lain).
function FaceCardSpotlight({ hint }: { hint: string }) {
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  if (!viewport) return null;
  const { width: W, height: H } = viewport;

  // Sisakan ruang untuk header (tombol kembali + progress bar) dan tombol
  // ambil gambar di bawah, supaya teks hint tidak pernah bertabrakan dengan
  // tombol pada layar yang pendek.
  const HEADER_RESERVE = 110;
  const FOOTER_RESERVE = 140;
  const GAP = 16;
  const HINT_HEIGHT = 30;
  const available = H - HEADER_RESERVE - FOOTER_RESERVE;

  const naturalOvalWidth = W * 0.66;
  const naturalOvalHeight = (naturalOvalWidth * 4) / 3;
  const naturalKotakWidth = W * 0.72;
  const naturalKotakHeight = naturalKotakWidth / 1.586;
  const naturalGroupHeight = naturalOvalHeight + GAP + naturalKotakHeight + GAP + HINT_HEIGHT;

  // Kalau susunan oval+kotak+hint tidak cukup di ruang yang tersedia (layar
  // pendek), kecilkan proporsional — jangan biarkan hint menabrak tombol.
  const scale = Math.min(1, available / naturalGroupHeight);

  const ovalWidth = naturalOvalWidth * scale;
  const ovalHeight = naturalOvalHeight * scale;
  const kotakWidth = naturalKotakWidth * scale;
  const kotakHeight = naturalKotakHeight * scale;
  const groupHeight = ovalHeight + GAP + kotakHeight + GAP + HINT_HEIGHT;
  const groupTop = HEADER_RESERVE + Math.max(0, (available - groupHeight) / 2);

  const ovalCx = W / 2;
  const ovalCy = groupTop + ovalHeight / 2;
  const kotakX = ovalCx - kotakWidth / 2;
  const kotakY = ovalCy + ovalHeight / 2 + GAP;
  const maskId = 'kyc-face-card-mask';

  return (
    <div className='absolute inset-0 pointer-events-none'>
      <svg width={W} height={H} className='absolute inset-0'>
        <defs>
          <mask id={maskId}>
            <rect width='100%' height='100%' fill='white' />
            <ellipse cx={ovalCx} cy={ovalCy} rx={ovalWidth / 2} ry={ovalHeight / 2} fill='black' />
            <rect x={kotakX} y={kotakY} width={kotakWidth} height={kotakHeight} rx={12} fill='black' />
          </mask>
        </defs>
        <rect width='100%' height='100%' fill='black' opacity={0.55} mask={`url(#${maskId})`} />
      </svg>
      <div
        className='absolute rounded-[50%] border-[3px] border-white'
        style={{ left: ovalCx, top: ovalCy, width: ovalWidth, height: ovalHeight, transform: 'translate(-50%, -50%)' }}
      />
      <div
        className='absolute rounded-xl border-[3px] border-white'
        style={{ left: kotakX, top: kotakY, width: kotakWidth, height: kotakHeight }}
      />
      <p
        className='absolute left-1/2 -translate-x-1/2 text-white text-xs sm:text-sm font-medium bg-black/40 px-3 py-1 rounded-full text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[92%]'
        style={{ top: kotakY + kotakHeight + GAP }}
      >
        {hint}
      </p>
    </div>
  );
}

function GuideOverlay({ shape, hint, emphasize }: { shape: GuideShape; hint: string; emphasize?: boolean }) {
  const hintClassName = emphasize
    ? 'mt-4 text-white text-lg sm:text-xl font-semibold bg-black/50 px-5 py-3 rounded-2xl text-center max-w-[85%] leading-snug whitespace-pre-line'
    : 'mt-4 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full';

  if (shape === 'face-and-card') {
    return <FaceCardSpotlight hint={hint} />;
  }

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
      <div
        className={
          shape === 'card'
            ? 'w-[92%] aspect-[1.586/1] rounded-2xl border-[3px] border-white'
            : 'w-[70%] aspect-[3/4] rounded-[50%] border-[3px] border-white'
        }
        style={SPOTLIGHT_SHADOW}
      />
      <p className={hintClassName}>{hint}</p>
    </div>
  );
}

export function CameraCaptureField({
  label,
  mode,
  guide,
  hint,
  facingMode,
  file,
  onCapture,
  stepIndex,
  stepTotal = 3,
}: {
  label: string;
  mode: CaptureMode;
  guide: GuideShape;
  hint: string;
  facingMode: 'user' | 'environment';
  file: File | null;
  onCapture: (file: File) => void;
  stepIndex: number;
  stepTotal?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const historyPushedRef = useRef(false);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const closeDialog = () => {
    clearRecordingTimeout();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    stopStream();
    setIsOpen(false);
    setIsRecording(false);
  };

  // Back (hardware/gesture) should only dismiss the camera overlay and keep
  // the user on this page, not trigger the browser's actual back navigation.
  const handleBack = () => {
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    } else {
      closeDialog();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePopState = () => {
      historyPushedRef.current = false;
      closeDialog();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    setIsStarting(true);
    setIsOpen(true);
    // Dibaca ulang di sini (bukan cuma sekali saat mount) supaya kalau nama
    // baru diganti di halaman Profil lalu user langsung buka kamera, hint
    // video pakai nama terbaru, bukan nama yang sudah basi.
    setUserName(localStorage.getItem('name') || '');
    window.history.pushState({ kycCameraOpen: true }, '');
    historyPushedRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          // Minta resolusi setinggi mungkin — tanpa ini browser sering
          // default ke ~640x480 sehingga hasil foto KTP terlihat buram.
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          // Banyak HP memilih mode sensor berdasarkan frame rate yang
          // diminta: fps tinggi (30/60) sering memaksa mode sensor yang
          // di-crop/di-bin (cepat tapi resolusi & ketajaman lebih rendah).
          // Foto dokumen tidak butuh fps tinggi, jadi diminta rendah supaya
          // browser cenderung memilih mode resolusi penuh.
          frameRate: { ideal: 15 },
          // Autofocus terus-menerus supaya kamera tidak "malas fokus" saat
          // buka dialog — constraint yang tidak dikenal browser lain akan
          // diabaikan dengan aman, bukan menyebabkan error.
          advanced: [{ focusMode: 'continuous' } as FocusConstraintSet],
        },
        audio: mode === 'video',
      });
      streamRef.current = stream;

      // Beberapa browser (terutama Chrome/Android) hanya menerima focusMode
      // lewat applyConstraints setelah track aktif, bukan dari getUserMedia
      // di atas — dicoba lagi di sini, gagal pun tidak masalah (best effort).
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          await videoTrack.applyConstraints({ advanced: [{ focusMode: 'continuous' } as FocusConstraintSet] });
        } catch {
          // Tidak didukung — abaikan, kamera tetap pakai autofocus bawaannya.
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      setError('Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan untuk situs ini.');
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      stopStream();
    };
  }, []);

  const handleTakePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const track = streamRef.current?.getVideoTracks()[0];

    // Paksa satu siklus autofokus baru tepat sebelum jepret — continuous AF
    // di background belum tentu sudah konvergen persis saat tombol ditekan,
    // dan ini sering jadi penyebab hasil teks KTP terlihat blur padahal
    // preview-nya kelihatan cukup jelas. Di banyak HP Android, langsung set
    // 'single-shot' tidak memicu apa-apa kalau AF sudah dianggap "converged"
    // oleh continuous mode — jadi di-toggle dulu balik ke continuous supaya
    // driver kamera menjalankan ulang siklus AF-nya dari awal. Best effort:
    // browser yang tidak mendukung akan melempar error yang diabaikan di sini.
    if (track) {
      try {
        await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as FocusConstraintSet] });
        await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' } as FocusConstraintSet] });
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch {
        // Tidak didukung — lanjut ambil foto dengan fokus apa adanya.
      }
    }

    // ImageCapture.takePhoto() menarik still-frame langsung dari pipeline
    // kamera (resolusi & tajam penuh), berbeda dari menggambar ulang video
    // element ke canvas yang terbatas pada resolusi preview video. Resolusi
    // still-capture maksimum diminta eksplisit lewat getPhotoCapabilities()
    // karena tanpa itu sebagian implementasi Android diam-diam memakai
    // resolusi yang sama dengan preview stream (lebih rendah dari maksimum
    // sebenarnya kamera itu).
    const ImageCapture = (window as unknown as { ImageCapture?: ImageCaptureConstructor }).ImageCapture;
    if (track && ImageCapture) {
      try {
        const imageCapture = new ImageCapture(track);
        let photoSettings: PhotoSettingsLike | undefined;
        try {
          const capabilities = await imageCapture.getPhotoCapabilities();
          if (capabilities.imageWidth?.max && capabilities.imageHeight?.max) {
            photoSettings = {
              imageWidth: capabilities.imageWidth.max,
              imageHeight: capabilities.imageHeight.max,
            };
          }
        } catch {
          // getPhotoCapabilities tidak didukung — takePhoto() tanpa settings eksplisit.
        }
        const blob = await imageCapture.takePhoto(photoSettings);
        const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
        onCapture(capturedFile);
        handleBack();
        return;
      } catch (err) {
        console.error('ImageCapture gagal, fallback ke canvas:', err);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Gagal mengambil foto, coba lagi');
          return;
        }
        const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(capturedFile);
        handleBack();
      },
      'image/jpeg',
      1
    );
  };

  const handleStopRecording = () => {
    clearRecordingTimeout();
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleStartRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = pickSupportedVideoMimeType();
    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      clearRecordingTimeout();
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const capturedFile = new File([blob], `capture-${Date.now()}.${ext}`, { type: mimeType });
      onCapture(capturedFile);
      handleBack();
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);

    if (mode === 'video') {
      recordingTimeoutRef.current = setTimeout(handleStopRecording, VIDEO_MAX_DURATION_MS);
    }
  };

  return (
    <div className='space-y-3'>
      <Label className='text-sm font-semibold text-slate-700'>
        {label} <span className='text-red-500'>*</span>
      </Label>

      <button
        type='button'
        onClick={startCamera}
        className='w-full border-2 border-dashed border-slate-200 rounded-xl p-8 bg-white/50 hover:bg-white/80 hover:border-blue-300 transition-all duration-200 cursor-pointer'
      >
        <div className='flex flex-col items-center space-y-4'>
          <div className='w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center'>
            <Camera className='w-6 h-6 text-blue-600' />
          </div>
          {file ? (
            <div className='text-center'>
              <p className='text-sm font-medium text-slate-700'>{file.name}</p>
              <p className='text-xs text-slate-500 mt-1'>Sudah diambil, klik untuk ambil ulang</p>
            </div>
          ) : (
            <div className='text-center'>
              <span className='inline-flex items-center gap-2 mb-2 px-4 py-2 rounded-md border border-blue-200 text-blue-600 text-sm font-medium'>
                <Camera className='w-4 h-4' /> Ambil dari Kamera
              </span>
              <p className='text-xs text-slate-500'>Belum ada {mode === 'photo' ? 'foto' : 'video'} diambil</p>
            </div>
          )}
        </div>
      </button>

      {mounted && isOpen && createPortal(
        <div className='fixed inset-0 z-[999] bg-black overflow-hidden'>
          <video ref={videoRef} className='absolute inset-0 w-full h-full object-cover' muted playsInline autoPlay />

          <div className='absolute top-0 inset-x-0 px-4 pt-6 pb-4 bg-gradient-to-b from-black/70 to-transparent'>
            <div className='flex items-center justify-between mb-3'>
              <button
                type='button'
                onClick={handleBack}
                className='flex items-center gap-2 text-white'
                aria-label='Kembali'
              >
                <ArrowLeft className='w-5 h-5' />
                <span className='text-base font-semibold'>Verifikasi Identitas</span>
              </button>
              <button
                type='button'
                onClick={handleBack}
                className='w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white'
                aria-label='Tutup kamera'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='flex gap-1.5'>
              {Array.from({ length: stepTotal }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i < stepIndex ? 'bg-blue-500' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>

          {isStarting && (
            <div className='absolute inset-0 flex items-center justify-center bg-black'>
              <Loader2 className='w-8 h-8 text-white animate-spin' />
            </div>
          )}

          {error && (
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center'>
              <p className='text-white text-sm'>{error}</p>
              <Button variant='outline' onClick={startCamera} className='gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20'>
                <RefreshCcw className='w-4 h-4' /> Coba Lagi
              </Button>
            </div>
          )}

          {!isStarting && !error && (
            <GuideOverlay
              shape={guide}
              hint={
                mode === 'video'
                  ? `Ucapkan dengan jelas:\n"Saya ${userName || 'Pengguna'}, ingin melakukan verifikasi akun Rekber.com"`
                  : hint
              }
              emphasize={mode === 'video'}
            />
          )}

          {isRecording && (
            <div className='absolute top-24 inset-x-0 flex items-center justify-center'>
              <div className='flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full'>
                <CircleDot className='w-3.5 h-3.5 text-red-500 animate-pulse' />
                <span className='text-white text-xs font-medium'>Merekam...</span>
              </div>
            </div>
          )}

          {!isStarting && !error && (
            <div className='absolute bottom-8 inset-x-0 flex items-center justify-center'>
              {mode === 'photo' ? (
                <button
                  type='button'
                  onClick={handleTakePhoto}
                  className='w-16 h-16 rounded-full bg-white border-4 border-white/40 active:scale-95 transition-transform shadow-lg'
                  aria-label='Ambil foto'
                />
              ) : isRecording ? (
                <button
                  type='button'
                  onClick={handleStopRecording}
                  className='w-16 h-16 rounded-full bg-red-600 flex items-center justify-center active:scale-95 transition-transform shadow-lg'
                  aria-label='Selesai rekam'
                >
                  <Square className='w-6 h-6 text-white' />
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleStartRecording}
                  className='w-16 h-16 rounded-full bg-white border-4 border-red-500 active:scale-95 transition-transform shadow-lg'
                  aria-label='Mulai rekam'
                />
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
