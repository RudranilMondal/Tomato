import React, { useState, useRef, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  X,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Headphones,
  CheckCheck,
  Sparkles
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { supportMessages, sendSupportMessage } = useTomattto();
  const [activeTab, setActiveTab] = useState<'faq' | 'chat'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const faqs = [
    {
      q: 'Where is my order & how can I track it?',
      a: 'You can tap on "Live Tracking" from the bottom navigation or orders tab anytime to view real-time GPS coordinates of your rider, arrival ETA, and status stepper.'
    },
    {
      q: 'How do I cancel an order or request a refund?',
      a: 'Orders can be cancelled before the kitchen starts preparation. Once confirmed by the restaurant chef, cancellation may be restricted to avoid food waste. Any refunds are instantly credited to your Tomattto Wallet!'
    },
    {
      q: 'What is Tomattto Gold & Free Delivery?',
      a: 'Tomattto Gold members enjoy 100% free delivery on all orders above ₹249, VIP customer support, and up to 20% extra discount across participating gourmet partner restaurants.'
    },
    {
      q: 'How do coupons and promo codes work?',
      a: 'You can apply codes like TOMATTTO50, WELCOME, or FREESHIP directly on the cart screen before placing your order. Only one coupon code can be applied per order.'
    },
    {
      q: 'Can I add cooking instructions for allergies?',
      a: 'Yes! While customizing any dish, enter your chef notes (e.g. "Less spicy", "No onions", "Extra green chutney") in the special instructions box.'
    }
  ];

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, activeTab]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendSupportMessage(inputText.trim());
    setInputText('');
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
          height: '85%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Headphones size={18} />
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Tomattto 24x7 Help Center</h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Instant answers & dedicated concierge support
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            padding: '10px 16px',
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg)'
          }}
        >
          <button
            onClick={() => setActiveTab('faq')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: activeTab === 'faq' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeTab === 'faq' ? '#FFFFFF' : 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={14} />
            <span>FAQs & Help Topics</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: activeTab === 'chat' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeTab === 'chat' ? '#FFFFFF' : 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={14} />
            <span>Live Concierge Chat</span>
          </button>
        </div>

        {/* Content View */}
        {activeTab === 'faq' ? (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
            className="no-scrollbar"
          >
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Frequently Asked Questions
            </span>

            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    style={{
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp size={16} color="var(--color-primary)" />
                    ) : (
                      <ChevronDown size={16} color="var(--color-text-muted)" />
                    )}
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 14px 14px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                        borderTop: '1px solid var(--color-border-subtle)',
                        paddingTop: '10px',
                        backgroundColor: 'var(--color-bg)'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Live Chat Prompt */}
            <div
              style={{
                marginTop: '10px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 100%)',
                border: '1px solid var(--color-primary)',
                textAlign: 'center'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Need more help with an order?</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 12px' }}>
                Chat live with our AI food concierge bot for instant support!
              </p>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Start Live Chat
              </button>
            </div>
          </div>
        ) : (
          /* Live Chat View */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              {supportMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isUser && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '2px' }}>
                        🍅 Tomattto Support Bot
                      </span>
                    )}
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
                    <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px', padding: '0 4px' }}>
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Pills */}
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto'
              }}
              className="no-scrollbar"
            >
              {['Where is my active order?', 'How to cancel?', 'Refund policy', 'Discount coupons'].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => sendSupportMessage(chip)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-muted)',
                    color: 'var(--color-text-main)',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
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
                placeholder="Ask about orders, refunds, delivery..."
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
        )}
      </div>
    </div>
  );
};
