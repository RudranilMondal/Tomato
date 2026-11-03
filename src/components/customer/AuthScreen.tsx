import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  ArrowLeft,
  Smartphone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
  MapPin
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginUser, setCustomerScreen, user } = useTomattto();

  const [authStep, setAuthStep] = useState<'phone' | 'otp' | 'details' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  // Delivery location inputs for phone login profile completion
  const [buildingInput, setBuildingInput] = useState('');
  const [streetInput, setStreetInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (authStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, otpTimer]);

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('otp');
      setOtpTimer(30);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    setOtp(['1', '2', '3', '4']);
    setErrorMsg('');
  };

  const handleVerifyOtp = () => {
    const entered = otp.join('');
    if (entered.length < 4) {
      setErrorMsg('Please enter the 4-digit verification code');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Advance to Profile Setup step to ask for Name and Email
      setAuthStep('details');
    }, 500);
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!buildingInput.trim()) {
      setErrorMsg('Please enter your building, flat or house name');
      return;
    }
    if (!areaInput.trim()) {
      setErrorMsg('Please enter your area or locality (e.g. Indiranagar)');
      return;
    }
    const cleanPin = pincodeInput.replace(/\D/g, '');
    if (cleanPin.length < 6) {
      setErrorMsg('Please enter a valid 6-digit pincode (e.g. 560038)');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const fullAddress = [
      buildingInput.trim(),
      streetInput.trim(),
      `${areaInput.trim()} - ${cleanPin}`
    ]
      .filter(Boolean)
      .join(', ');

    setTimeout(() => {
      setIsLoading(false);
      loginUser({
        name: nameInput.trim(),
        phone: `+91 ${phoneNumber || '98765 43210'}`,
        address: fullAddress
      });
    }, 500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@') || !emailInput.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginUser({
        email: emailInput,
        name: nameInput.trim() || emailInput.split('@')[0]
      });
    }, 600);
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginUser({
        name: provider === 'Google' ? 'Alex Rivera (Google)' : 'Alex Rivera (Apple)',
        email: `alex.${provider.toLowerCase()}@example.com`
      });
    }, 500);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        overflowY: 'auto'
      }}
      className="no-scrollbar"
    >
      {/* Top Header / Skip */}
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <button
          onClick={() => {
            if (authStep === 'details') {
              setAuthStep('otp');
              setErrorMsg('');
            } else if (authStep === 'otp' || authStep === 'email') {
              setAuthStep('phone');
              setErrorMsg('');
            } else {
              setCustomerScreen('home');
            }
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-main)'
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>🍅</span>
          <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
            Tomattto
          </span>
        </div>

        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            padding: '4px 8px'
          }}
        >
          Skip
        </button>
      </div>

      {/* Main Body */}
      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Hero Banner Icon & Tagline */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                marginBottom: '14px',
                boxShadow: '0 8px 24px var(--color-primary-glow)'
              }}
            >
              🍅
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1.2 }}>
              {authStep === 'otp'
                ? 'Enter 4-Digit OTP'
                : authStep === 'details'
                ? 'Complete Your Profile'
                : authStep === 'email'
                ? 'Continue with Email'
                : "India's #1 Food App"}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              {authStep === 'otp'
                ? `Verification code sent to +91 ${phoneNumber || '98765 43210'}`
                : authStep === 'details'
                ? 'Welcome! Tell us your name and delivery address to start ordering'
                : authStep === 'email'
                ? 'Sign in or create your Tomattto account'
                : 'Log in or sign up to unlock exclusive offers & live tracking'}
            </p>
          </div>

          {/* STEP 1: Phone Login */}
          {authStep === 'phone' && (
            <form onSubmit={handleSendOtp}>
              {/* Phone Input Box */}
              <div
                style={{
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface-muted)',
                  marginBottom: '14px',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🇮🇳</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main)' }}>+91</span>
                </div>
                <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--color-border)' }} />
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setErrorMsg('');
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-text-main)'
                  }}
                />
              </div>

              {errorMsg && (
                <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginBottom: '12px', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'default' : 'pointer'
                }}
              >
                <span>{isLoading ? 'Sending Code...' : 'Continue with OTP'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {authStep === 'otp' && (
            <div>
              {/* 4 Digit Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '54px',
                      height: '56px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: digit ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      fontSize: '22px',
                      fontWeight: 800,
                      textAlign: 'center',
                      color: 'var(--color-text-main)',
                      outline: 'none'
                    }}
                  />
                ))}
              </div>

              {/* Quick Fill Demo Helper */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={13} />
                  <span>Auto-Fill Demo Code: 1234</span>
                </button>
              </div>

              {errorMsg && (
                <p style={{ fontSize: '12px', color: 'var(--color-primary)', textAlign: 'center', marginBottom: '12px', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </p>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'default' : 'pointer'
                }}
              >
                <CheckCircle2 size={18} />
                <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
              </button>

              {/* Resend Timer */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                {otpTimer > 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Didn't receive code? Resend in <b>{otpTimer}s</b>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setOtpTimer(30);
                      setErrorMsg('');
                    }}
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-primary)'
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Complete Profile (Name & Email) */}
          {authStep === 'details' && (
            <form onSubmit={handleCompleteProfile}>
              {/* Verified Phone Chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    +91 {phoneNumber || '98765 43210'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-veg)',
                    backgroundColor: 'var(--color-veg-bg)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>Verified</span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                {/* Full Name */}
                <div
                  style={{
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-muted)'
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    YOUR FULL NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name (e.g. Rahul Sharma)"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      setErrorMsg('');
                    }}
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontWeight: 700,
                      marginTop: '4px',
                      color: 'var(--color-text-main)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Location Section Heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <MapPin size={15} color="var(--color-primary)" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Delivery Address
                  </span>
                </div>

                {/* Building / Flat Name */}
                <div
                  style={{
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-muted)'
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    BUILDING / FLAT / HOUSE NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Lotus Residency"
                    value={buildingInput}
                    onChange={(e) => {
                      setBuildingInput(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginTop: '4px',
                      color: 'var(--color-text-main)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Street Address */}
                <div
                  style={{
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-muted)'
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    STREET ADDRESS (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12th Main Road, Near Park"
                    value={streetInput}
                    onChange={(e) => {
                      setStreetInput(e.target.value);
                      setErrorMsg('');
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginTop: '4px',
                      color: 'var(--color-text-main)',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Area & Pincode Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                  {/* Area */}
                  <div
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-surface-muted)'
                    }}
                  >
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      AREA / LOCALITY *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar"
                      value={areaInput}
                      onChange={(e) => {
                        setAreaInput(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        fontWeight: 600,
                        marginTop: '4px',
                        color: 'var(--color-text-main)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Pincode */}
                  <div
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-surface-muted)'
                    }}
                  >
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      PINCODE *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 560038"
                      value={pincodeInput}
                      onChange={(e) => {
                        setPincodeInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setErrorMsg('');
                      }}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        fontWeight: 600,
                        marginTop: '4px',
                        color: 'var(--color-text-main)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginBottom: '12px', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'default' : 'pointer'
                }}
              >
                <span>{isLoading ? 'Creating Profile...' : 'Complete & Continue'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 4: Email Login */}
          {authStep === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-muted)'
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block' }}>
                    YOUR FULL NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Souvik Mukherjee"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginTop: '4px',
                      color: 'var(--color-text-main)'
                    }}
                  />
                </div>

                <div
                  style={{
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-muted)'
                  }}
                >
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMsg('');
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginTop: '4px',
                      color: 'var(--color-text-main)'
                    }}
                  />
                </div>
              </div>

              {errorMsg && (
                <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginBottom: '12px', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '15px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'default' : 'pointer'
                }}
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In with Email'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Social Logins Divider (on phone and email screens) */}
          {authStep !== 'otp' && authStep !== 'details' && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text-main)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Email / Switch button */}
                {authStep === 'phone' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('email');
                      setErrorMsg('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-text-main)'
                    }}
                  >
                    <Mail size={16} color="var(--color-text-muted)" />
                    <span>Continue with Email</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('phone');
                      setErrorMsg('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-text-main)'
                    }}
                  >
                    <Smartphone size={16} color="var(--color-text-muted)" />
                    <span>Continue with Phone Number</span>
                  </button>
                )}

                {/* Continue as Guest */}
                <button
                  type="button"
                  onClick={() => {
                    loginUser({ name: 'Guest User', phone: '+91 99999 88888' });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-border)',
                    backgroundColor: 'var(--color-surface-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    marginTop: '4px'
                  }}
                >
                  <UserCheck size={14} />
                  <span>Continue as Guest Demo Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div style={{ textAlign: 'center', marginTop: '28px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            By continuing, you agree to Tomattto's{' '}
            <span style={{ color: 'var(--color-text-main)', fontWeight: 700, textDecoration: 'underline' }}>
              Terms of Service
            </span>{' '}
            &{' '}
            <span style={{ color: 'var(--color-text-main)', fontWeight: 700, textDecoration: 'underline' }}>
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
