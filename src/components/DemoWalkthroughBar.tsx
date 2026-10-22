import React from 'react';
import { useTomattto } from '../context/TomatttoContext';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

const STEPS_INFO = [
  {
    title: '1. Animated Splash & Onboarding',
    desc: 'Notice the custom logo animation and 3-slide value proposition carousel.'
  },
  {
    title: '2. Customer Home Feed',
    desc: 'Dynamic promo banners, cuisine pills, quick filters, and nearby restaurant rails.'
  },
  {
    title: '3. Instant Search & Typo-tolerance',
    desc: 'Search for biryani, pizza, or burgers with instant real-time suggestions.'
  },
  {
    title: '4. Restaurant Menu & Customisation',
    desc: 'Sticky category tabs, veg/non-veg tags, and bottom sheet for size & add-ons.'
  },
  {
    title: '5. Cart & Smart Checkout',
    desc: 'Apply coupon TOMATTTO50, select tip, add delivery instructions, and see bill summary.'
  },
  {
    title: '6. Live GPS Rider Order Tracking',
    desc: 'Interactive live map with moving delivery partner marker, ETA, and status stepper.'
  },
  {
    title: '7. Restaurant Partner Kitchen Board',
    desc: 'Incoming order alert with sound chime, accept button, and live prep time toggle.'
  },
  {
    title: '8. Delivery Rider Partner View',
    desc: 'Shift toggle, accept delivery offer of ₹65, in-app navigation, and OTP verification.'
  },
  {
    title: '9. Admin Operations Panel',
    desc: 'Executive GMV dashboard, sales charts, live orders monitor, and restaurant approvals.'
  }
];

export const DemoWalkthroughBar: React.FC = () => {
  const { demoStep, isDemoActive, nextDemoStep, prevDemoStep, stopDemo } = useTomattto();

  if (!isDemoActive || demoStep === 0) return null;

  const currentInfo = STEPS_INFO[demoStep - 1] || STEPS_INFO[0];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        backgroundColor: '#1E1E24',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
        maxWidth: '90vw',
        width: '680px'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Sparkles size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              letterSpacing: '0.05em'
            }}
          >
            Step {demoStep} of {STEPS_INFO.length}
          </span>
          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentInfo.title}
          </h4>
        </div>
        <p style={{ fontSize: '12px', color: '#A5A5B2', margin: '2px 0 0', lineHeight: 1.3 }}>
          {currentInfo.desc}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={prevDemoStep}
          disabled={demoStep === 1}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: demoStep === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
            color: demoStep === 1 ? '#6E6E82' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: demoStep === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={nextDemoStep}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--color-primary-glow)'
          }}
        >
          <span>{demoStep === STEPS_INFO.length ? 'Finish' : 'Next'}</span>
          <ChevronRight size={16} />
        </button>

        <button
          onClick={stopDemo}
          title="Exit Demo Mode"
          style={{
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#A5A5B2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
