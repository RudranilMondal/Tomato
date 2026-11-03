import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface RiderCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderCallModal: React.FC<RiderCallModalProps> = ({ isOpen, onClose }) => {
  const { currentOrder } = useTomattto();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const rider = currentOrder?.rider;

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#111116',
        color: '#FFFFFF',
        zIndex: 110,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px 30px 40px',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      {/* Top Info */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-veg)'
          }}
        >
          <ShieldCheck size={14} />
          <span>Number Masked • Encrypted Call</span>
        </div>

        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '28px auto 16px',
            border: '3px solid var(--color-primary)',
            boxShadow: '0 8px 30px rgba(255, 75, 58, 0.4)'
          }}
        >
          <img
            src={rider?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
            alt={rider?.name || 'Rider'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{rider?.name || 'Vikram Singh'}</h2>
        <p style={{ fontSize: '13px', color: '#A5A5B2', marginTop: '4px' }}>
          Delivery Partner • {rider?.vehicleNumber || 'KA 03 EN 4592'}
        </p>

        <div style={{ marginTop: '14px', fontSize: '16px', fontWeight: 700, color: '#2ECC71' }}>
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Rider Audio Voice Simulator */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <span style={{ fontSize: '11px', color: '#A5A5B2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Rider is on Call
        </span>
        <p style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '6px', fontStyle: 'italic' }}>
          {callDuration < 4
            ? '"Hello Souvik ji! Reaching your society in about 5 minutes."'
            : callDuration < 10
            ? '"Should I leave the parcel at tower lobby or come upstairs?"'
            : '"Got it, thanks! Will deliver safely."'
          }
        </p>
      </div>

      {/* Call Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: isMuted ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: isSpeaker ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {isSpeaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#EB5757',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(235, 87, 87, 0.4)',
            cursor: 'pointer'
          }}
        >
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};
