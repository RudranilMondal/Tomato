import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { supabase } from '../../lib/supabase';
import {
  isDemoAuthEnabled,
  requestDemoOtp,
  verifyDemoOtp,
  DEMO_OTP_CODE,
  DEMO_OTP_BANNER_TEXT
} from '../../lib/demoAuth';
import {
  Bike,
  ShieldCheck,
  X,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RiderAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDevPreview?: () => void;
}

export const RiderAuthModal: React.FC<RiderAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onDevPreview
}) => {
  const { initializeRiderProfile, setDemoRiderUser } = useTomattto();
  const demoActive = isDemoAuthEnabled();
  const [authMode] = useState<'demo' | 'supabase'>(demoActive ? 'demo' : 'supabase');

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Reset modal state whenever modal opens or re-opens
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
      setErrorMsg('');
      setInfoMsg('');
      setTimer(30);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const formattedPhone = `+91${cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)}`;

  // Handle Send OTP (Real Supabase Phone Auth)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);

    if (!supabase) {
      setErrorMsg('Supabase client is not initialized. Please verify environment credentials.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) {
        setErrorMsg(
          `SMS Provider Error: ${error.message}. In local development, use test phone number 98765 43210 with test OTP 123456, or use '⚡ Quick Demo Login (Dev Only)' below.`
        );
        setIsLoading(false);
        return;
      }

      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setTimer(30);
      setInfoMsg(`A 6-digit verification code has been dispatched to ${formattedPhone}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while sending OTP';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto focus next box
    if (digit && index < 5) {
      const nextInput = document.getElementById(`rider-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`rider-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Paste into OTP inputs
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    document.getElementById(`rider-otp-${nextIdx}`)?.focus();
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const token = otp.join('');
    if (token.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      // Real Supabase SMS OTP Verification exclusively
      if (!supabase) {
        setErrorMsg('Supabase client is not initialized');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms'
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired verification code');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const profileOk = await initializeRiderProfile(
          data.user.id,
          data.user.phone || formattedPhone,
          fullName.trim() || undefined
        );

        if (!profileOk) {
          setErrorMsg(
            'Your mobile number is verified, but initializing your applicant profile in the database failed. Please verify again, or ensure this phone number is not linked to another account.'
          );
          setIsLoading(false);
          return;
        }

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}

        onSuccess();
      } else {
        setErrorMsg('Authentication succeeded but session could not be established.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during verification';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplicitDevLogin = () => {
    setDemoRiderUser({
      id: 'demo-rider-dev-01',
      phone: '+919876543210',
      fullName: 'Rahul Kumar (Fleet Partner)',
      role: 'rider',
      isDemo: true,
      createdAt: new Date().toISOString()
    });
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
    onSuccess();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1E1E24',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#17171C'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 75, 58, 0.15)',
                color: 'var(--color-primary, #FF4B3A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bike size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Delivery Partner Portal
              </h3>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
                {step === 'phone' ? 'Phone OTP Authentication' : 'Verify Mobile OTP'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Error Alert */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(231, 76, 60, 0.15)',
                border: '1px solid rgba(231, 76, 60, 0.35)',
                color: '#FF6B6B',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 1.4
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Info Alert */}
          {infoMsg && !errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(46, 204, 113, 0.12)',
                border: '1px solid rgba(46, 204, 113, 0.3)',
                color: 'var(--color-veg, #2ECC71)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                lineHeight: 1.4
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{infoMsg}</div>
            </div>
          )}

          {/* Development Demo Mode Alert */}
          {demoActive && (
            <div
              style={{
                backgroundColor: 'rgba(243, 156, 18, 0.12)',
                border: '1px solid rgba(243, 156, 18, 0.35)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px',
                lineHeight: 1.45
              }}
            >
              <Sparkles size={16} color="#F39C12" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#F39C12' }}>
                  {DEMO_OTP_BANNER_TEXT}
                </div>
                <div style={{ color: '#D1D5DB', marginTop: '2px', fontSize: '11px' }}>
                  Real SMS is paused. Enter any 10-digit mobile number to proceed. Fixed demo verification code: <strong style={{ color: '#FFFFFF' }}>{DEMO_OTP_CODE}</strong>.
                </div>
              </div>
            </div>
          )}

          {step === 'phone' ? (
            /* STEP 1: PHONE & NAME ENTRY */
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: '#E5E7EB'
                  }}
                >
                  Applicant Mobile Number <span style={{ color: '#FF4B3A' }}>*</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#131317',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <span
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#D1D5DB',
                      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    autoFocus
                    required
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      letterSpacing: '0.04em'
                    }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>
                  A one-time verification password will be sent via SMS.
                </p>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: '#E5E7EB'
                  }}
                >
                  Full Name as per Government ID <span style={{ fontSize: '11px', color: '#9CA3AF' }}>(Optional)</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#131317',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0 12px'
                  }}
                >
                  <User size={15} color="#9CA3AF" style={{ marginRight: '8px' }} />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '10px 0',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || cleanPhone.length !== 10}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  backgroundColor: cleanPhone.length === 10 ? 'var(--color-primary, #FF4B3A)' : 'rgba(255, 75, 58, 0.35)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: cleanPhone.length === 10 && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Requesting SMS Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Explicit Dev-Only Instant Login */}
              {demoActive && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 75, 58, 0.08)',
                    border: '1.5px dashed var(--color-primary, #FF4B3A)',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--color-primary, #FF4B3A)',
                      marginBottom: '6px'
                    }}
                  >
                    <Sparkles size={13} />
                    <span>⚡ Quick Demo Login (Dev Only)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExplicitDevLogin}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Instant Login as Demo Rider (Rahul Kumar)</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {/* Development Sandbox Preview Option */}
              {onDevPreview && (
                <div
                  style={{
                    marginTop: '18px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(243, 156, 18, 0.08)',
                    border: '1px dashed rgba(243, 156, 18, 0.35)',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#F39C12',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '4px'
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Dev Preview • Phone OTP Postponed</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 10px', lineHeight: 1.4 }}>
                    Test the complete Phase 2 Onboarding flow (KYC details, vehicle exemptions, file upload cards, and payout) in sandbox preview without SMS authentication.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDevPreview();
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#F39C12',
                      color: '#131317',
                      fontWeight: 800,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Launch Onboarding Preview (Sandbox)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* STEP 2: 6-DIGIT OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#D1D5DB', marginBottom: '4px' }}>
                  Enter the 6-digit code sent to
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                    {formattedPhone}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #FF4B3A)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* 6 Digit Input Boxes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px'
                }}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`rider-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    autoFocus={idx === 0}
                    style={{
                      width: '42px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: '#131317',
                      border: digit
                        ? '2px solid var(--color-primary, #FF4B3A)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '18px',
                      fontWeight: 800,
                      textAlign: 'center',
                      outline: 'none',
                      boxShadow: digit ? '0 0 10px rgba(255, 75, 58, 0.2)' : 'none'
                    }}
                  />
                ))}
              </div>

              {/* Resend Countdown */}
              <div style={{ textAlign: 'center', marginBottom: '22px', fontSize: '12px' }}>
                {timer > 0 ? (
                  <span style={{ color: '#9CA3AF' }}>
                    Resend SMS code in <strong style={{ color: '#FFFFFF' }}>{timer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #FF4B3A)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  backgroundColor: otp.join('').length === 6 ? 'var(--color-veg, #2ECC71)' : 'rgba(46, 204, 113, 0.35)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: otp.join('').length === 6 && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verify & Continue to Onboarding</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={12} />
                <span>Back to mobile number entry</span>
              </button>
            </form>
          )}

          {/* Security & Disclaimer Footer */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#9CA3AF'
            }}
          >
            <Lock size={12} color="#9CA3AF" />
            <span>End-to-end encrypted Supabase Auth • Indian Telecom DLT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
