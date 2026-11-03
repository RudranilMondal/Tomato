import React, { useState, useEffect, useRef } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, Send, Phone, Bike, CheckCheck } from 'lucide-react';

interface RiderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallRider: () => void;
}

export const RiderChatModal: React.FC<RiderChatModalProps> = ({ isOpen, onClose, onCallRider }) => {
  const { currentOrder, riderMessages, sendRiderMessage } = useTomattto();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const rider = currentOrder?.rider;

  const quickPills = [
    'Please leave at security gate',
    'Call when you reach downstairs',
    'Ring bell once and leave at door',
    'Coming down to receive!'
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [riderMessages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendRiderMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickSend = (pill: string) => {
    sendRiderMessage(pill);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          height: '82%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={rider?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                alt={rider?.name || 'Rider'}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-veg)',
                  border: '2px solid #FFFFFF'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{rider?.name || 'Vikram Singh'}</h4>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    backgroundColor: 'var(--color-veg-bg)',
                    color: 'var(--color-veg)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}
                >
                  ONLINE
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {rider?.vehicleNumber || 'KA 03 EN 4592'} • Tomattto Delivery Partner
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onCallRider}
              style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-veg-bg)',
                color: 'var(--color-veg)',
                display: 'flex'
              }}
              title="Call Rider"
            >
              <Phone size={16} />
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                display: 'flex'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--color-bg)'
          }}
          className="no-scrollbar"
        >
          {/* Security Banner */}
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-full)',
              alignSelf: 'center',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Bike size={12} color="var(--color-primary)" />
            <span>Chat is monitored for delivery safety & quick coordination</span>
          </div>

          {riderMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isUser ? '#FFFFFF' : 'var(--color-text-main)',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    boxShadow: 'var(--shadow-sm)',
                    border: isUser ? 'none' : '1px solid var(--color-border)'
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px', padding: '0 4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>{msg.time}</span>
                  {isUser && <CheckCheck size={11} color="var(--color-primary)" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Quick-Reply Chips */}
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto'
          }}
          className="no-scrollbar"
        >
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => handleQuickSend(pill)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid var(--color-border)'
              }}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Text Input Row */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Message your delivery partner..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              fontSize: '13px',
              color: 'var(--color-text-main)'
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() ? 'var(--color-primary)' : 'var(--color-surface-muted)',
              color: inputText.trim() ? '#FFFFFF' : 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
