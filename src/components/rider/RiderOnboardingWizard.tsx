import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { RiderOnboardingApplication, RiderKycDocuments, RiderBankDetails } from '../../types';
import {
  ShieldCheck,
  User,
  FileText,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  Building2,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';

interface RiderOnboardingWizardProps {
  onSwitchToAdmin?: () => void;
}

const DEFAULT_SAMPLE_DOCS: RiderKycDocuments = {
  aadhaarFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  aadhaarBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  panFront: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  panBack: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
  drivingLicenseFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  drivingLicenseBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
};

export const RiderOnboardingWizard: React.FC<RiderOnboardingWizardProps> = ({ onSwitchToAdmin }) => {
  const {
    riderOnboardingStatus,
    submitRiderOnboarding,
    resetRiderOnboarding,
    allRiderApplications
  } = useTomattto();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Step 1: Personal KYC Form State
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-'>('B+');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1999-08-15');

  // Step 2: KYC Documents State
  const [documents, setDocuments] = useState<RiderKycDocuments>({
    aadhaarFront: null,
    aadhaarBack: null,
    panFront: null,
    panBack: null,
    drivingLicenseFront: null,
    drivingLicenseBack: null
  });

  // Step 3: Financial Details State
  const [bankDetails, setBankDetails] = useState<RiderBankDetails>({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [confirmAccNumber, setConfirmAccNumber] = useState('');

  // Auto-fill sample data for rapid testing
  const handleAutoFill = () => {
    setFullName('Arjun Sharma');
    setPhone('+91 98765 43210');
    setEmail('arjun.sharma.delivery@gmail.com');
    setAddress('Flat 304, Green Glen Layout, Bellandur, Bengaluru 560103');
    setBloodGroup('O+');
    setGender('Male');
    setDob('1997-11-20');
    setProfilePhoto('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80');

    setDocuments(DEFAULT_SAMPLE_DOCS);

    setBankDetails({
      accountHolderName: 'Arjun Sharma',
      bankName: 'State Bank of India (Bellandur Branch)',
      accountNumber: '39482019482',
      ifscCode: 'SBIN0014283',
      upiId: 'arjun.sharma@oksbi'
    });
    setConfirmAccNumber('39482019482');
    setFormErrors({});
  };

  // Image upload simulator via HTML file reader
  const handleFileUpload = (key: keyof RiderKycDocuments, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setDocuments((prev) => ({
          ...prev,
          [key]: e.target?.result as string
        }));
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfilePhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full Name as per Government ID is required';
    if (!phone.trim()) errors.phone = 'Active 10-digit mobile number is required';
    if (!address.trim()) errors.address = 'Current residential address is required';
    if (!dob) errors.dob = 'Date of birth is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!documents.aadhaarFront) errors.aadhaarFront = 'Aadhaar Front photo is required';
    if (!documents.aadhaarBack) errors.aadhaarBack = 'Aadhaar Back photo is required';
    if (!documents.panFront) errors.panFront = 'PAN Card Front photo is required';
    if (!documents.panBack) errors.panBack = 'PAN Card Back photo is required';
    if (!documents.drivingLicenseFront) errors.drivingLicenseFront = 'Driving License Front photo is required';
    if (!documents.drivingLicenseBack) errors.drivingLicenseBack = 'Driving License Back photo is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!bankDetails.accountHolderName.trim()) errors.accountHolderName = 'Account Holder Name is required';
    if (!bankDetails.bankName.trim()) errors.bankName = 'Bank Name is required';
    if (!bankDetails.accountNumber.trim()) errors.accountNumber = 'Account Number is required';
    if (confirmAccNumber.trim() !== bankDetails.accountNumber.trim()) {
      errors.confirmAccNumber = 'Account Numbers do not match';
    }
    if (!bankDetails.ifscCode.trim()) errors.ifscCode = 'IFSC Code is required';
    if (!bankDetails.upiId.trim()) errors.upiId = 'UPI ID is required for daily payouts';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Application
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    submitRiderOnboarding({
      fullName: fullName.trim(),
      profilePhoto,
      phone: phone.trim(),
      email: email.trim() || undefined,
      residentialAddress: address.trim(),
      bloodGroup,
      gender,
      dob,
      documents,
      bankDetails
    });
  };

  // Find most recent application if under review or rejected
  const recentApp = allRiderApplications[0];

  // ==========================================
  // VIEW 1: UNDER REVIEW / VERIFICATION UNDER PROCESS
  // ==========================================
  if (riderOnboardingStatus === 'under_review') {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#131317',
          color: '#FFFFFF',
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%'
        }}
        className="no-scrollbar"
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Pulsing radar icon */}
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: 'rgba(243, 156, 18, 0.2)',
                animation: 'pulse 2s infinite'
              }}
            />
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(243, 156, 18, 0.25)',
                color: '#F39C12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2
              }}
            >
              <Clock size={32} />
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              backgroundColor: 'rgba(243, 156, 18, 0.15)',
              color: '#F39C12',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(243, 156, 18, 0.3)',
              display: 'inline-block',
              marginBottom: '12px'
            }}
          >
            KYC Verification Under Process
          </span>

          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>
            We're Verifying Your Profile
          </h2>

          <p style={{ fontSize: '13px', color: '#A5A5B2', lineHeight: 1.6, marginBottom: '22px' }}>
            Welcome to the Tomattto Delivery Fleet! 🛵 Your identity documents, Aadhaar, PAN card, driving license,
            and bank payout details have been safely submitted to our Admin Operations Center.
          </p>

          {/* Verification Step Timeline */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '22px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div style={{ color: 'var(--color-veg)', marginTop: '2px' }}>
                <CheckCircle2 size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Documents Submitted</div>
                <div style={{ fontSize: '11px', color: '#A5A5B2' }}>
                  6/6 Mandatory documents & bank details received.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div style={{ color: '#F39C12', marginTop: '2px' }}>
                <Clock size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F39C12' }}>
                  Fleet Ops Admin Review (In Progress)
                </div>
                <div style={{ fontSize: '11px', color: '#A5A5B2' }}>
                  Officers are validating UIDAI, RTO license & bank penny drop.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#6B7280', marginTop: '2px' }}>
                <Lock size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF' }}>
                  Terminal Activation & Order Dispatch
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Unlocks automatically the instant Admin clicks "Approve".
                </div>
              </div>
            </div>
          </div>

          {/* Application Details Summary */}
          {recentApp && (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px dashed rgba(255,255,255,0.1)',
                textAlign: 'left',
                fontSize: '12px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#A5A5B2' }}>Applicant:</span>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{recentApp.fullName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#A5A5B2' }}>Application Ref:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {recentApp.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#A5A5B2' }}>Phone:</span>
                <span style={{ color: '#FFFFFF' }}>{recentApp.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#A5A5B2' }}>Bank Payout UPI:</span>
                <span style={{ color: 'var(--color-veg)', fontWeight: 600 }}>{recentApp.bankDetails.upiId}</span>
              </div>
            </div>
          )}

          {/* Direct shortcut to Admin HQ for quick testing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                if (onSwitchToAdmin) {
                  onSwitchToAdmin();
                } else {
                  alert('Switch to the Admin panel in the top bar to inspect and approve this application!');
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <ShieldCheck size={16} />
              <span>Open Admin Panel to Approve ➔</span>
            </button>

            <button
              onClick={resetRiderOnboarding}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#A5A5B2',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} />
              <span>Cancel & Edit Application Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: REJECTED STATE
  // ==========================================
  if (riderOnboardingStatus === 'rejected') {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#131317',
          color: '#FFFFFF',
          overflowY: 'auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            padding: '28px 24px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              color: '#E74C3C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
            Application Requires Attention
          </h2>
          <p style={{ fontSize: '13px', color: '#A5A5B2', marginBottom: '16px' }}>
            Our compliance team encountered an issue while reviewing your documents.
          </p>

          <div
            style={{
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#FF6B6B',
              textAlign: 'left',
              marginBottom: '20px'
            }}
          >
            <strong>Reason for rejection:</strong>{' '}
            {recentApp?.rejectionReason || 'Driving license / Aadhaar photo was blurry or obscured. Please upload crisp images.'}
          </div>

          <button
            onClick={resetRiderOnboarding}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800
            }}
          >
            Re-Upload Documents & Resubmit
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ONBOARDING APPLICATION FORM (3 STEPS)
  // ==========================================
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#131317',
        color: '#FFFFFF',
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      className="no-scrollbar"
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Onboarding Header Banner */}
        <div
          style={{
            backgroundColor: '#1E1E24',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 75, 58, 0.15)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Tomattto Rider Onboarding
                </h1>
                <p style={{ fontSize: '12px', color: '#A5A5B2', margin: '2px 0 0' }}>
                  Join India's fastest delivery fleet • Earn up to ₹35,000/month + Incentives
                </p>
              </div>
            </div>

            {/* Quick Demo Pre-fill Button */}
            <button
              type="button"
              onClick={handleAutoFill}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(46, 204, 113, 0.15)',
                color: 'var(--color-veg)',
                border: '1px solid rgba(46, 204, 113, 0.3)',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} />
              <span>⚡ Auto-fill Sample KYC</span>
            </button>
          </div>

          {/* Stepper Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              marginTop: '18px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '14px'
            }}
          >
            {[
              { num: 1, label: '1. Personal KYC', icon: User },
              { num: 2, label: '2. Documents', icon: FileText },
              { num: 3, label: '3. Bank & Payouts', icon: CreditCard }
            ].map((s) => {
              const Icon = s.icon;
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num === 1) setStep(1);
                    if (s.num === 2 && validateStep1()) setStep(2);
                    if (s.num === 3 && validateStep1() && validateStep2()) setStep(3);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCurrent
                      ? 'rgba(255, 75, 58, 0.15)'
                      : isDone
                      ? 'rgba(46, 204, 113, 0.1)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${
                      isCurrent
                        ? 'var(--color-primary)'
                        : isDone
                        ? 'var(--color-veg)'
                        : 'rgba(255,255,255,0.06)'
                    }`,
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: isCurrent
                        ? 'var(--color-primary)'
                        : isDone
                        ? 'var(--color-veg)'
                        : 'rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isDone ? '✓' : s.num}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isCurrent ? '#FFFFFF' : isDone ? 'var(--color-veg)' : '#A5A5B2',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: PERSONAL KYC */}
        {step === 1 && (
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Step 1: Personal KYC & Contact Information
            </h3>
            <p style={{ fontSize: '12px', color: '#A5A5B2', marginBottom: '20px' }}>
              Please enter your legal identity details as printed on your government documents.
            </p>

            {/* Profile Photo Picker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--color-primary)',
                  flexShrink: 0,
                  position: 'relative'
                }}
              >
                <img src={profilePhoto} alt="Rider Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>
                  Rider Profile Photo (Front-facing selfie)
                </label>
                <span style={{ fontSize: '11px', color: '#A5A5B2', display: 'block', marginBottom: '8px' }}>
                  Clear face without helmet, sunglasses, or mask.
                </span>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={13} />
                  <span>Upload / Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleProfilePhotoUpload(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.fullName ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.fullName && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.fullName}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Mobile Phone (Active for OTPs) *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98451 92831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.phone ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.phone && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.phone}
                  </span>
                )}
              </div>

              {/* Email (Optional) */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Email Address <span style={{ color: '#A5A5B2' }}>(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rider@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Date of Birth (Minimum 18 yrs) *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.dob ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    colorScheme: 'dark'
                  }}
                />
                {formErrors.dob && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.dob}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Gender *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: gender === g ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: '#FFFFFF',
                        border: `1px solid ${gender === g ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Blood Group (For Emergency Kit) *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#1E1E24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                >
                  {(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const).map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                Permanent / Current Residential Address *
              </label>
              <textarea
                rows={3}
                placeholder="House/Flat number, Building, Street, Landmark, City & Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${formErrors.address ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
              {formErrors.address && (
                <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                  {formErrors.address}
                </span>
              )}
            </div>

            {/* Next Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                style={{
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <span>Proceed to Documents</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENTS UPLOAD */}
        {step === 2 && (
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
                  Step 2: Upload Verification Documents
                </h3>
                <p style={{ fontSize: '12px', color: '#A5A5B2' }}>
                  Upload clear photos of both Front & Back sides for Aadhaar, PAN Card, and Driving License.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDocuments(DEFAULT_SAMPLE_DOCS);
                  setFormErrors({});
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} color="#F39C12" />
                <span>Fill Demo Docs</span>
              </button>
            </div>

            {/* Document Pairs Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. AADHAAR CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🪪</span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                      Aadhaar Card (UIDAI Verified)
                    </h4>
                    <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Front with photo & Back with address</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <DocUploadCard
                    title="Aadhaar Front Side *"
                    previewUrl={documents.aadhaarFront}
                    error={formErrors.aadhaarFront}
                    onFileSelect={(f) => handleFileUpload('aadhaarFront', f)}
                  />
                  <DocUploadCard
                    title="Aadhaar Back Side *"
                    previewUrl={documents.aadhaarBack}
                    error={formErrors.aadhaarBack}
                    onFileSelect={(f) => handleFileUpload('aadhaarBack', f)}
                  />
                </div>
              </div>

              {/* 2. PAN CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>💳</span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>PAN Card (Tax Identification)</h4>
                    <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Front showing PAN number & Back barcode</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <DocUploadCard
                    title="PAN Front Side *"
                    previewUrl={documents.panFront}
                    error={formErrors.panFront}
                    onFileSelect={(f) => handleFileUpload('panFront', f)}
                  />
                  <DocUploadCard
                    title="PAN Back Side *"
                    previewUrl={documents.panBack}
                    error={formErrors.panBack}
                    onFileSelect={(f) => handleFileUpload('panBack', f)}
                  />
                </div>
              </div>

              {/* 3. DRIVING LICENSE */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🚗</span>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                      Commercial Driving License (MCWG / LMV)
                    </h4>
                    <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Valid two-wheeler license with active validity</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <DocUploadCard
                    title="Driving License Front *"
                    previewUrl={documents.drivingLicenseFront}
                    error={formErrors.drivingLicenseFront}
                    onFileSelect={(f) => handleFileUpload('drivingLicenseFront', f)}
                  />
                  <DocUploadCard
                    title="Driving License Back *"
                    previewUrl={documents.drivingLicenseBack}
                    error={formErrors.drivingLicenseBack}
                    onFileSelect={(f) => handleFileUpload('drivingLicenseBack', f)}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                style={{
                  padding: '11px 24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <span>Proceed to Financial Details</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL & BANKING DETAILS */}
        {step === 3 && (
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Step 3: Financial Details & Daily Payouts
            </h3>
            <p style={{ fontSize: '12px', color: '#A5A5B2', marginBottom: '20px' }}>
              Your earnings, surge incentives, and customer tips are credited daily to this bank account or UPI ID.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* Account Holder Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Bank Account Holder Name *
                </label>
                <input
                  type="text"
                  placeholder="Should match legal KYC name"
                  value={bankDetails.accountHolderName}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.accountHolderName ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.accountHolderName && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.accountHolderName}
                  </span>
                )}
              </div>

              {/* Bank Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Bank Name & Branch *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, Indiranagar"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.bankName ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.bankName && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.bankName}
                  </span>
                )}
              </div>

              {/* IFSC Code */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  IFSC Code (11 characters) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000140"
                  value={bankDetails.ifscCode}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.ifscCode ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    textTransform: 'uppercase'
                  }}
                />
                {formErrors.ifscCode && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.ifscCode}
                  </span>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Account Number *
                </label>
                <input
                  type="password"
                  placeholder="Enter Bank Account Number"
                  value={bankDetails.accountNumber}
                  onChange={(e) =>
                    setBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.accountNumber ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.accountNumber && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.accountNumber}
                  </span>
                )}
              </div>

              {/* Confirm Account Number */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Confirm Account Number *
                </label>
                <input
                  type="text"
                  placeholder="Re-enter Bank Account Number"
                  value={confirmAccNumber}
                  onChange={(e) => setConfirmAccNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.confirmAccNumber ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.confirmAccNumber && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.confirmAccNumber}
                  </span>
                )}
              </div>

              {/* UPI ID */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB', display: 'block', marginBottom: '5px' }}>
                  Instant Payout UPI ID (GPay / PhonePe / Paytm) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile@okaxis or name@okhdfcbank"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails((prev) => ({ ...prev, upiId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${formErrors.upiId ? '#E74C3C' : 'rgba(255,255,255,0.1)'}`,
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
                {formErrors.upiId && (
                  <span style={{ fontSize: '10px', color: '#E74C3C', marginTop: '3px', display: 'block' }}>
                    {formErrors.upiId}
                  </span>
                )}
              </div>
            </div>

            {/* Terms & Declarations */}
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(46, 204, 113, 0.05)',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}
            >
              <CheckCircle2 size={18} color="var(--color-veg)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '11px', color: '#D1D5DB', lineHeight: 1.5 }}>
                I hereby declare that all uploaded government documents (Aadhaar, PAN & Driving License) and banking
                details are authentic and belong to me. I agree to the Tomattto Fleet Partner Code of Conduct and
                authorize safety background checks.
              </div>
            </div>

            {/* Stepper Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Submit for Verification ➔</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Reusable Document Upload Card
interface DocUploadCardProps {
  title: string;
  previewUrl: string | null;
  error?: string;
  onFileSelect: (file: File) => void;
}

const DocUploadCard: React.FC<DocUploadCardProps> = ({ title, previewUrl, error, onFileSelect }) => {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${error ? '#E74C3C' : previewUrl ? 'rgba(46, 204, 113, 0.4)' : 'rgba(255,255,255,0.1)'}`,
        backgroundColor: previewUrl ? 'rgba(46, 204, 113, 0.04)' : 'rgba(255,255,255,0.02)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>{title}</span>
        {previewUrl ? (
          <span style={{ fontSize: '10px', color: 'var(--color-veg)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={12} />
            Uploaded
          </span>
        ) : (
          <span style={{ fontSize: '10px', color: '#F39C12', fontWeight: 600 }}>Required</span>
        )}
      </div>

      {previewUrl ? (
        <div style={{ height: '100px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          <img src={previewUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              fontSize: '10px',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>Verified Scan</span>
            <label style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              Change
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>
      ) : (
        <label
          style={{
            height: '90px',
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            backgroundColor: 'rgba(255,255,255,0.01)'
          }}
        >
          <UploadCloud size={20} color="#A5A5B2" />
          <span style={{ fontSize: '11px', color: '#D1D5DB', fontWeight: 600 }}>Choose image or photo</span>
          <span style={{ fontSize: '9px', color: '#8E8E93' }}>JPG, PNG or PDF scan</span>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
            }}
          />
        </label>
      )}

      {error && <span style={{ fontSize: '10px', color: '#E74C3C' }}>{error}</span>}
    </div>
  );
};
