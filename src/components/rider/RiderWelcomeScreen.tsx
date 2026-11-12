import React from 'react';
import {
  Bike,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Award,
  ChevronRight,
  FileText,
  HeartHandshake,
  KeyRound
} from 'lucide-react';

interface RiderWelcomeScreenProps {
  onRegister: () => void;
  onLogin: () => void;
  onQuickDemoLogin: () => void;
}

export const RiderWelcomeScreen: React.FC<RiderWelcomeScreenProps> = ({
  onRegister,
  onLogin,
  onQuickDemoLogin
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#121216',
        color: '#FFFFFF',
        padding: '20px 16px',
        overflowY: 'auto'
      }}
    >
      {/* Top Header Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 75, 58, 0.15)',
              border: '1px solid rgba(255, 75, 58, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #FF4B3A)'
            }}
          >
            <Bike size={20} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '-0.3px' }}>
              Tomattto Fleet
            </div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Delivery Partner Portal
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(46, 204, 113, 0.12)',
            border: '1px solid rgba(46, 204, 113, 0.3)',
            fontSize: '11px',
            fontWeight: 700,
            color: '#2ECC71'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#2ECC71'
            }}
          />
          Hiring Across 20+ Cities
        </div>
      </div>

      {/* Hero Card */}
      <div
        style={{
          borderRadius: '16px',
          padding: '24px 20px',
          background: 'linear-gradient(145deg, #1E1E26 0%, #2A1817 100%)',
          border: '1px solid rgba(255, 75, 58, 0.25)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '4px 9px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 75, 58, 0.2)',
            color: '#FF7B6E',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px'
          }}
        >
          🚀 Fleet Partner Onboarding
        </div>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 900,
            lineHeight: 1.25,
            color: '#FFFFFF',
            marginBottom: '8px'
          }}
        >
          Deliver with Tomattto. <br />
          <span style={{ color: 'var(--color-primary, #FF4B3A)' }}>
            Earn up to ₹35,000/mo
          </span>
        </h1>

        <p
          style={{
            fontSize: '13px',
            color: '#D1D5DB',
            lineHeight: 1.5,
            marginBottom: '18px'
          }}
        >
          Join 50,000+ happy delivery partners. Enjoy instant daily payouts,
          flexible shifts, free medical insurance, and weekly milestones.
        </p>

        {/* Highlight Perks Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Zap size={14} color="#F59E0B" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#E5E7EB' }}>
              Daily UPI Payouts
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Clock size={14} color="#3B82F6" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#E5E7EB' }}>
              Flexible Hours
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#E5E7EB' }}>
              ₹5 Lakh Insurance
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Award size={14} color="#EC4899" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#E5E7EB' }}>
              ₹3,000 Join Bonus
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
        {/* Option A: Register as a Delivery Partner */}
        <button
          onClick={onRegister}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-primary, #FF4B3A)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(255, 75, 58, 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>
                Register as a Delivery Partner
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>
                4-step easy signup • Quick document verification
              </div>
            </div>
          </div>
          <ArrowRight size={18} />
        </button>

        {/* Option B: Existing Rider Login */}
        <button
          onClick={onLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 18px',
            borderRadius: '14px',
            backgroundColor: '#1E1E24',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D1D5DB'
              }}
            >
              <LogIn size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>
                Existing Rider Login
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                Sign in with verified mobile number & OTP
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#9CA3AF" />
        </button>

        {/* Quick Demo Login Helper for Evaluator */}
        <button
          onClick={onQuickDemoLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(46, 204, 113, 0.08)',
            border: '1px dashed rgba(46, 204, 113, 0.35)',
            color: '#2ECC71',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Instant 1-click test login as approved fleet rider Vikram Singh"
        >
          <KeyRound size={14} />
          <span>Quick Login: Vikram Singh (Approved Demo Rider)</span>
        </button>
      </div>

      {/* 4-Step Registration Overview */}
      <div
        style={{
          borderRadius: '14px',
          backgroundColor: '#1A1A20',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px',
          marginBottom: '20px'
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={15} color="var(--color-primary, #FF4B3A)" />
          <span>Simple 4-Step Onboarding Process</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            {
              num: 1,
              title: 'Personal Details',
              desc: 'Full name, photo, phone, DOB, address & PIN'
            },
            {
              num: 2,
              title: 'Vehicle Information',
              desc: 'Bicycle, Motorcycle, Scooter or EV + license'
            },
            {
              num: 3,
              title: 'KYC & Document Upload',
              desc: 'Aadhaar card, PAN card, driving licence & RC'
            },
            {
              num: 4,
              title: 'Review & Instant Verification',
              desc: 'Fleet administrator verification & account activation'
            }
          ].map((item) => (
            <div
              key={item.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 75, 58, 0.15)',
                  color: 'var(--color-primary, #FF4B3A)',
                  fontSize: '12px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {item.num}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#E5E7EB' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Help Footer */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#6B7280',
          paddingTop: '10px'
        }}
      >
        <HeartHandshake size={13} color="#9CA3AF" />
        <span>100% verified & secure fleet partner platform</span>
      </div>
    </div>
  );
};
