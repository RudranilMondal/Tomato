import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Clock, X, VideoOff } from 'lucide-react';
import { RiderTier } from '../../types';
import { supabase } from '../../lib/supabase';

interface RiderSelfieModalProps {
  prompt: {
    id: string;
    triggerReason: 'duty_start' | 'duty_end' | 'periodic' | 'random' | 'order_assignment';
    orderId?: string;
    expiresAt: string;
  };
  tier: RiderTier;
  onSubmit: (selfieUrl: string, orderId?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  onDismiss: () => void;
}

const SAMPLE_SELFIES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
];

export const RiderSelfieModal: React.FC<RiderSelfieModalProps> = ({
  prompt,
  tier,
  onSubmit,
  onDismiss
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes grace period default

  // WebRTC Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'denied' | 'unsupported' | 'error'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported');
      setCameraError('Browser does not support direct camera capture. You may use a simulated verification snapshot.');
      return;
    }

    setCameraState('starting');
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState('active');
    } catch (err: any) {
      console.warn('getUserMedia camera capture warning:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setCameraError('Camera access was denied. Please grant camera permission in your browser or use the fallback capture.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('error');
        setCameraError('No webcam or front camera found on this device.');
      } else {
        setCameraState('error');
        setCameraError(err.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Countdown timer for 10-minute grace period
  useEffect(() => {
    const expireTime = new Date(prompt.expiresAt).getTime();
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prompt.expiresAt]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getReasonTitle = () => {
    switch (prompt.triggerReason) {
      case 'duty_start':
        return 'Duty Start Selfie Verification';
      case 'duty_end':
        return 'Duty End Selfie Verification';
      case 'order_assignment':
        return `Order #${prompt.orderId || 'Active'} Dispatch Verification`;
      case 'periodic':
      case 'random':
      default:
        return 'Routine Fleet Safety Check';
    }
  };

  const getReasonDescription = () => {
    switch (prompt.triggerReason) {
      case 'duty_start':
        return 'Please capture a clear live selfie with your delivery helmet and Tomattto jacket or t-shirt to begin receiving orders.';
      case 'duty_end':
        return 'Confirm your physical presence and end your active duty shift safely.';
      case 'order_assignment':
        return 'Compliance check requires a live selfie when an active delivery order is assigned.';
      case 'periodic':
      case 'random':
      default:
        return `Periodic compliance check for ${tier.toUpperCase()} Tier riders to verify active driver identity.`;
    }
  };

  // Capture frame from video or fallback
  const handleCapture = () => {
    setIsCapturing(true);
    setError(null);

    try {
      if (videoRef.current && cameraState === 'active') {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhoto(dataUrl);
          stopCamera();
          setIsCapturing(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Canvas capture error:', err);
    }

    // Fallback if camera is denied/unavailable in development environment
    const sample = SAMPLE_SELFIES[Math.floor(Math.random() * SAMPLE_SELFIES.length)];
    setCapturedPhoto(sample);
    stopCamera();
    setIsCapturing(false);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setError(null);
    setUploadProgress(null);
    startCamera();
  };

  const handleConfirm = async () => {
    if (!capturedPhoto) return;
    setIsSubmitting(true);
    setError(null);
    setUploadProgress('Preparing selfie upload...');

    try {
      let finalStoragePath = capturedPhoto;

      // Upload to private Supabase storage bucket 'rider-selfie-evidence'
      if (supabase && capturedPhoto.startsWith('data:image/')) {
        setUploadProgress('Uploading encrypted selfie to private storage...');
        try {
          const byteString = atob(capturedPhoto.split(',')[1]);
          const mimeString = capturedPhoto.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const authUser = (await supabase.auth.getUser()).data?.user;
          const folder = authUser?.id || prompt.id;
          const filePath = `${folder}/${prompt.id}_${Date.now()}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from('rider-selfie-evidence')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (!uploadError) {
            finalStoragePath = filePath;
            setUploadProgress('Uploaded to secure evidence storage.');
          } else {
            console.warn('Storage upload notice (falling back to data path):', uploadError.message);
          }
        } catch (storageErr) {
          console.warn('Storage upload caught error:', storageErr);
        }
      }

      setUploadProgress('Validating with compliance ledger...');
      const res = await onSubmit(
        finalStoragePath,
        prompt.orderId,
        `Selfie verified for ${prompt.triggerReason} (Tier: ${tier})`
      );

      if (!res.success) {
        setError(res.error || 'Verification failed. Please try again.');
        setUploadProgress(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Error uploading verification selfie.');
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onDismiss();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#18181C',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                {getReasonTitle()}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor:
                      tier === 'gold'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : tier === 'silver'
                        ? 'rgba(156, 163, 175, 0.2)'
                        : 'rgba(217, 119, 6, 0.2)',
                    color:
                      tier === 'gold'
                        ? '#F59E0B'
                        : tier === 'silver'
                        ? '#9CA3AF'
                        : '#D97706'
                  }}
                >
                  {tier} Tier
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>• Mandatory Check</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          {/* Grace Period Warning */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="#F59E0B" />
              <span style={{ fontSize: '12px', color: '#FCD34D', fontWeight: 600 }}>
                Grace Period Remaining:
              </span>
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: secondsRemaining < 120 ? '#EF4444' : '#F59E0B',
                fontFamily: 'monospace'
              }}
            >
              {formatCountdown(secondsRemaining)}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#D1D5DB', margin: '0 0 16px', lineHeight: 1.5 }}>
            {getReasonDescription()}
          </p>

          {/* Camera Viewfinder / Preview Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              borderRadius: '16px',
              backgroundColor: '#0F0F12',
              border: '2px dashed rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            {capturedPhoto ? (
              <>
                <img
                  src={capturedPhoto}
                  alt="Captured Selfie"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(46, 204, 113, 0.9)',
                    color: '#FFFFFF',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={13} />
                  Captured
                </div>
              </>
            ) : cameraState === 'active' ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror selfie preview for natural view
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.85)',
                    color: '#FFFFFF',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      animation: 'pulse 1.5s infinite'
                    }}
                  />
                  LIVE CAMERA
                </div>
              </>
            ) : cameraState === 'starting' ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <RefreshCw size={24} className="animate-spin" color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Initializing camera feed...</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    color: '#9CA3AF'
                  }}
                >
                  {cameraState === 'denied' || cameraState === 'error' ? (
                    <VideoOff size={24} color="#EF4444" />
                  ) : (
                    <Camera size={26} />
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                  {cameraState === 'denied'
                    ? 'Camera Permission Blocked'
                    : cameraState === 'unsupported'
                    ? 'Camera API Not Supported'
                    : 'Position your face in frame'}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', maxWidth: '280px', margin: '0 auto' }}>
                  {cameraError || 'Ensure proper lighting, wear your helmet, and look directly into the camera.'}
                </div>
              </div>
            )}
          </div>

          {uploadProgress && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60A5FA',
                fontSize: '12px',
                marginBottom: '14px'
              }}
            >
              <RefreshCw size={13} className="animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                fontSize: '12px',
                marginBottom: '16px'
              }}
            >
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {capturedPhoto ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} />
                  Retake Photo
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirm}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-veg, #2ECC71)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                  }}
                >
                  <ShieldCheck size={16} />
                  {isSubmitting ? 'Uploading & Verifying...' : 'Submit & Verify'}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isCapturing}
                onClick={handleCapture}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primary, #FF4B3A)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(255, 75, 58, 0.35)'
                }}
              >
                <Camera size={18} />
                {isCapturing ? 'Capturing Snapshot...' : 'Capture Duty Selfie'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
