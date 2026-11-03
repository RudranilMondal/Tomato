import React, { useState } from 'react';
import { X, Gift, Copy, Check, Share2, Users, Coins, Sparkles } from 'lucide-react';
import { useTomattto } from '../../context/TomatttoContext';
import confetti from 'canvas-confetti';

interface ReferEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferEarnModal: React.FC<ReferEarnModalProps> = ({ isOpen, onClose }) => {
  const { topUpWallet } = useTomattto();
  const [copied, setCopied] = useState(false);
  const [hasClaimedDemoBonus, setHasClaimedDemoBonus] = useState(false);

  if (!isOpen) return null;

  const referralCode = 'TOMATTO-FOODIE100';
  const shareText = `Order delicious food on Tomattto with my code ${referralCode} and get ₹100 off your first meal! https://tomattto.app/invite/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimDemoBonus = () => {
    if (hasClaimedDemoBonus) return;
    topUpWallet(100);
    setHasClaimedDemoBonus(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '88vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Refer & Earn Credits</h3>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              display: 'flex',
              color: 'var(--color-text-muted)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }} className="no-scrollbar">
          {/* Hero Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FF4B3A 0%, #FF8A65 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              color: '#FFFFFF',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(255, 75, 58, 0.3)',
              marginBottom: '18px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: '28px'
              }}
            >
              🎁
            </div>
            <h4 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Give ₹100, Get ₹100
            </h4>
            <p style={{ fontSize: '12px', opacity: 0.95, lineHeight: 1.4, maxWidth: '280px', margin: '0 auto' }}>
              Invite foodies to Tomattto. When they place their first order, you both get ₹100 straight in your wallet!
            </p>
          </div>

          {/* Referral Code Box */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px dashed var(--color-primary)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Your Unique Invite Code
              </span>
              <p style={{ fontSize: '15px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                {referralCode}
              </p>
            </div>

            <button
              onClick={handleCopy}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: copied ? 'var(--color-veg)' : 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Share Channels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid var(--color-border)'
              }}
            >
              <Copy size={14} />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Referral Stats Counter */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(52, 152, 219, 0.15)',
                  color: '#2980B9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={16} />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Friends Joined</span>
                <span style={{ fontSize: '15px', fontWeight: 900 }}>3 Friends</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(46, 204, 113, 0.15)',
                  color: '#27AE60',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Coins size={16} />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Credits Earned</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--color-veg)' }}>₹300</span>
              </div>
            </div>
          </div>

          {/* Interactive Demo Test Button */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: hasClaimedDemoBonus ? 'var(--color-veg-bg)' : 'rgba(255, 75, 58, 0.08)',
              border: `1px solid ${hasClaimedDemoBonus ? 'var(--color-veg)' : 'rgba(255, 75, 58, 0.25)'}`,
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--color-text-main)', fontWeight: 600, marginBottom: '8px' }}>
              {hasClaimedDemoBonus
                ? '🎉 ₹100 Referral bonus added to your Tomattto Wallet!'
                : 'Test the referral flow now:'}
            </p>
            <button
              onClick={handleClaimDemoBonus}
              disabled={hasClaimedDemoBonus}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: hasClaimedDemoBonus ? 'var(--color-veg)' : 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: hasClaimedDemoBonus ? 'default' : 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>{hasClaimedDemoBonus ? 'Bonus Claimed (₹100 in Wallet)' : 'Claim Demo Referral Bonus (+₹100)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
