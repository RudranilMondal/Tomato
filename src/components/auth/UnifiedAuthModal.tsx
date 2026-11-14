import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { supabase } from '../../lib/supabase';
import {
  isDemoAuthEnabled,
  requestDemoOtp,
  verifyDemoOtp,
  DEMO_OTP_CODE,
  DEMO_OTP_BANNER_TEXT,
  DemoAuthRole
} from '../../lib/demoAuth';
import {
  X,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  Store,
  Bike,
  Smartphone,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'customer' | 'restaurant_owner' | 'rider';
  title?: string;
  subtitle?: string;
  onSuccess?: (authResult: { user: any; role: string; restaurantId?: string }) => void;
  onSwitchToRegister?: () => void;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  isOpen,
  onClose,
  role,
  title,
  subtitle,
  onSuccess,
  onSwitchToRegister
}) => {
  const {
    loginUser,
    loginDemoRider,
    loginPartner,
    allRestaurantApplications,
    restaurants,
    allRiderApplications,
    initializeRiderProfile
  } = useTomattto();

  const demoActive = isDemoAuthEnabled();
  const [authMode] = useState<'demo' | 'supabase'>(demoActive ? 'demo' : 'supabase');

  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  // Reset modal state whenever modal opens or re-opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setOtp(['', '', '', '', '', '']);
      setErrorMsg('');
      setInfoMsg('');
      setOauthNotice(null);
      setTimer(30);
      setIsLoading(false);
    }
  }, [isOpen, role]);

  // Countdown timer for OTP
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

  // Default labels and icon per portal role
  const roleConfig = {
    customer: {
      defaultTitle: 'Sign in to Tomattto',
      defaultSubtitle: 'Access saved addresses, live tracking & orders',
      icon: <Smartphone size={22} color="var(--color-primary)" />,
      badge: 'Customer Account',
      registerPrompt: "Don't have an account?",
      registerAction: 'Sign up now'
    },
    restaurant_owner: {
      defaultTitle: 'Restaurant Partner Login',
      defaultSubtitle: 'Manage live orders, menu catalog, store hours & payouts',
      icon: <Store size={22} color="var(--color-primary)" />,
      badge: 'Merchant Partner Portal',
      registerPrompt: 'Want to list your outlet on Tomattto?',
      registerAction: 'Become a Restaurant Partner'
    },
    rider: {
      defaultTitle: 'Delivery Fleet Partner Login',
      defaultSubtitle: 'Accept high-yield trips, daily earnings & tier rewards',
      icon: <Bike size={22} color="var(--color-primary)" />,
      badge: 'Rider Fleet Network',
      registerPrompt: 'Want to earn with Tomattto delivery fleet?',
      registerAction: 'Join Fleet Onboarding'
    }
  }[role];

  // Send OTP handler (Real Supabase Phone Auth)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setOauthNotice(null);

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
        // Real Supabase error display (e.g., Twilio not configured, rate limited, invalid number)
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

  // OTP Box Change handler
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`unified-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`unified-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP handler (Exclusively uses real Supabase Phone OTP)
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    setErrorMsg('');
    setInfoMsg('');

    if (token.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);

    try {
      // Real Supabase SMS Verification exclusively
      if (!supabase) {
        setErrorMsg('Supabase client is unavailable.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms'
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid or expired OTP code.');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Handle Role Specific Dispatch
        if (role === 'restaurant_owner') {
          const { data: restList } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', data.user.id);

          const { data: appList } = await supabase
            .from('restaurant_partner_applications')
            .select('*')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false });

          const matchingRest = restList && restList.length > 0 ? (restList[0] as any) : undefined;
          const matchingApp = appList && appList.length > 0 ? (appList[0] as any) : undefined;

          let status: any = 'not_registered';
          if (matchingRest) {
            status = matchingRest.is_open ? 'approved' : 'suspended';
          } else if (matchingApp) {
            status = matchingApp.status;
          }

          loginPartner({
            user: {
              id: data.user.id,
              phone: formattedPhone,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || 'Partner Owner'
            },
            status,
            restaurant: matchingRest,
            restaurants: restList as any,
            application: matchingApp
          });
        } else if (role === 'rider') {
          await initializeRiderProfile(
            data.user.id,
            data.user.phone || formattedPhone,
            fullName.trim() || undefined
          );
          const { data: riderProfile } = await supabase
            .from('riders')
            .select('*')
            .eq('profile_id', data.user.id)
            .maybeSingle();

          if (!riderProfile) {
            const { data: riderApp } = await supabase
              .from('rider_applications')
              .select('*')
              .eq('user_id', data.user.id)
              .maybeSingle();

            if (!riderApp) {
              setInfoMsg('Authentication verified. Complete rider onboarding to start accepting deliveries.');
            }
          }
        } else {
          loginUser({
            phone: formattedPhone,
            name: data.user.user_metadata?.full_name || 'Valued Customer'
          });
        }

        setIsLoading(false);
        onClose();
        onSuccess?.({ user: data.user, role });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during verification';
      setErrorMsg(message);
      setIsLoading(false);
    }
  };

  // Real Email Magic Link Authentication via Supabase
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setOauthNotice(null);

    if (!emailInput.includes('@') || !emailInput.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    if (!supabase) {
      setErrorMsg('Supabase client unavailable.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailInput,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to send login link to email.');
        setIsLoading(false);
        return;
      }

      setInfoMsg(`A secure magic login link has been dispatched to ${emailInput}. In local development, check Mailpit at http://127.0.0.1:54324.`);
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred with email sign-in.');
      setIsLoading(false);
    }
  };

  // Real Google OAuth Authentication via Supabase
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setOauthNotice(null);
    setIsLoading(true);

    if (!supabase) {
      setErrorMsg('Supabase client unavailable.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        // Document required setup if provider is disabled in Supabase console
        setOauthNotice(
          `Google OAuth Provider Setup Notice: ${error.message}. To enable Google sign-in: 1) Open Supabase Dashboard -> Authentication -> Providers -> Google, 2) Enter Client ID & Secret, 3) Set Redirect URI: ${window.location.origin}`
        );
        setIsLoading(false);
      }
    } catch (err: any) {
      setOauthNotice(`OAuth initiation error: ${err?.message || 'Failed to connect to Google provider.'}`);
      setIsLoading(false);
    }
  };

  // Explicit, Isolated Dev-Only Instant Login Handler
  const handleExplicitDevLogin = () => {
    setIsLoading(true);
    if (role === 'restaurant_owner') {
      loginPartner({
        user: {
          id: 'demo-rest-owner-99',
          phone: '+919876543210',
          fullName: 'Behrouz Biryani (Owner)'
        },
        status: 'approved',
        restaurant: restaurants[0],
        restaurants: [restaurants[0]]
      });
    } else if (role === 'rider') {
      loginDemoRider();
    } else {
      loginUser({
        phone: '+919876543210',
        name: 'Ananya Sharma (Customer)'
      });
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '460px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {roleConfig.icon}
            </div>
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.04em'
                }}
              >
                {roleConfig.badge}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                {title || roleConfig.defaultTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Method Switch Tabs (Phone vs Email) */}
        {step === 'input' && (
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-muted)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('phone');
                setErrorMsg('');
                setInfoMsg('');
              }}
              style={{
                flex: 1,
                padding: '11px 16px',
                fontSize: '13px',
                fontWeight: 800,
                backgroundColor: activeTab === 'phone' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'phone' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === 'phone' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Phone size={14} />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setErrorMsg('');
                setInfoMsg('');
              }}
              style={{
                flex: 1,
                padding: '11px 16px',
                fontSize: '13px',
                fontWeight: 800,
                backgroundColor: activeTab === 'email' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'email' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === 'email' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Mail size={14} />
              <span>Email Link</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Subtitle */}
          {step === 'input' && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
              {subtitle || roleConfig.defaultSubtitle}
            </p>
          )}

          {/* Error & Info Messages */}
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid rgba(231, 76, 60, 0.3)',
                color: '#E74C3C',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                border: '1px solid rgba(46, 204, 113, 0.3)',
                color: 'var(--color-veg)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{infoMsg}</span>
            </div>
          )}

          {oauthNotice && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(243, 156, 18, 0.12)',
                border: '1px solid rgba(243, 156, 18, 0.4)',
                color: '#D97706',
                fontSize: '12px',
                lineHeight: '1.5'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '4px' }}>
                <Info size={15} />
                <span>OAuth Configuration Notice</span>
              </div>
              <div>{oauthNotice}</div>
            </div>
          )}

          {/* STEP 1: Phone input */}
          {step === 'input' && activeTab === 'phone' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  REGISTERED INDIAN MOBILE NUMBER
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface)',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-surface-muted)',
                      borderRight: '1px solid var(--color-border)',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--color-text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, ''));
                      setErrorMsg('');
                    }}
                    placeholder="98765 43210"
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      letterSpacing: '0.04em'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || cleanPhone.length !== 10}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: cleanPhone.length === 10 ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                  color: cleanPhone.length === 10 ? '#FFFFFF' : 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: cleanPhone.length === 10 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: cleanPhone.length === 10 ? 'var(--shadow-glow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Phone</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 1: Email Input */}
          {step === 'input' && activeTab === 'email' && (
            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  BUSINESS / REGISTERED EMAIL ADDRESS
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface)',
                    padding: '0 12px'
                  }}
                >
                  <Mail size={16} color="var(--color-text-muted)" style={{ marginRight: '8px' }} />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="partner@yourrestaurant.com"
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text-main)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailInput.includes('@')}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: emailInput.includes('@') ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                  color: emailInput.includes('@') ? '#FFFFFF' : 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: emailInput.includes('@') ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: emailInput.includes('@') ? 'var(--shadow-glow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Processing Email Login...</span>
                  </>
                ) : (
                  <>
                    <span>Send Login Link</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Sign-In (Google) */}
          {step === 'input' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Code sent to:</span>{' '}
                  <strong style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>{formattedPhone}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Change Number
                </button>
              </div>

              {/* 6 Digit Inputs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`unified-otp-${idx}`}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '48px',
                      height: '52px',
                      borderRadius: 'var(--radius-sm)',
                      border: digit ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'var(--color-text-main)',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join('').length !== 6}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: otp.join('').length === 6 ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                  color: otp.join('').length === 6 ? '#FFFFFF' : 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: otp.join('').length === 6 ? 'var(--shadow-glow)' : 'none'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <CheckCircle2 size={15} />
                  </>
                )}
              </button>

              {/* Resend Timer */}
              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {timer > 0 ? (
                  <span>Resend code in <strong>{timer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Explicit, Isolated Dev-Only Instant Login Section */}
          {demoActive && step === 'input' && (
            <div
              style={{
                marginTop: '4px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 75, 58, 0.06)',
                border: '1.5px dashed var(--color-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={13} />
                  ⚡ Quick Demo Login (Dev Only)
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Bypasses SMS Gateway</span>
              </div>
              <button
                type="button"
                onClick={handleExplicitDevLogin}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <span>Instant Demo Login as {role === 'restaurant_owner' ? 'Restaurant Owner' : role === 'rider' ? 'Delivery Fleet Rider' : 'Customer'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Bottom Registration Prompt */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              flexWrap: 'wrap'
            }}
          >
            <span>{roleConfig.registerPrompt}</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister?.();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {roleConfig.registerAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
