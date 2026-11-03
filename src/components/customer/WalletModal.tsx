import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { walletBalance, walletTransactions, topUpWallet } = useTomattto();
  const [customAmount, setCustomAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  if (!isOpen) return null;

  const handleTopUp = (amount: number) => {
    topUpWallet(amount);
    setIsAddingFunds(false);
    setCustomAmount('');
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
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease',
          overflowY: 'auto'
        }}
        className="no-scrollbar"
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
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Tomattto Credits & Wallet</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              1-click instant checkout with zero payment drop-offs
            </p>
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

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Virtual Wallet Card */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #1E1E24 0%, #2D2D37 50%, #FF4B3A 120%)',
              color: '#FFFFFF',
              padding: '20px',
              boxShadow: '0 10px 25px rgba(255, 75, 58, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Card Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '90px',
                opacity: 0.1,
                pointerEvents: 'none'
              }}
            >
              🍅
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>
                  Total Balance
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.5px' }}>
                  ₹{walletBalance}
                </h2>
              </div>

              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)'
                }}
              >
                ACTIVE
              </span>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.7, display: 'block' }}>ACCOUNT HOLDER</span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>Souvik Mukherjee</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.85 }}>TOMATTTO PAY</span>
            </div>
          </div>

          {/* Quick Top Up Options */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800 }}>Quick Add Money</span>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>
                Get 10% instant cashback
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleTopUp(amt)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    fontSize: '13px',
                    fontWeight: 800,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  <span>+₹{amt}</span>
                  <span style={{ fontSize: '9px', color: 'var(--color-veg)', fontWeight: 700 }}>
                    +₹{Math.round(amt * 0.1)} free
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Amount Form Toggle */}
            {!isAddingFunds ? (
              <button
                onClick={() => setIsAddingFunds(true)}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-main)',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>Enter custom amount</span>
              </button>
            ) : (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 750)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '13px',
                    color: 'var(--color-text-main)'
                  }}
                />
                <button
                  onClick={() => {
                    const parsed = parseInt(customAmount, 10);
                    if (parsed > 0) handleTopUp(parsed);
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Transaction Passbook History */}
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, display: 'block', marginBottom: '10px' }}>
              Passbook & Transactions
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {walletTransactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div
                    key={tx.id}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: isCredit ? 'var(--color-veg-bg)' : 'var(--color-primary-light)',
                          color: isCredit ? 'var(--color-veg)' : 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>

                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>{tx.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{tx.date}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: isCredit ? 'var(--color-veg)' : 'var(--color-text-main)'
                      }}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
