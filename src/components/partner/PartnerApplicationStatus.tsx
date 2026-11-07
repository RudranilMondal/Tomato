import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Store,
  Mail,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  User,
  MapPin,
  Landmark,
  FileCheck
} from 'lucide-react';

export type ApplicationStatusType = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

interface PartnerApplicationStatusProps {
  onBack: () => void;
  onOpenWizard?: () => void;
}

interface DemoApplicationData {
  referenceId: string;
  restaurantName: string;
  restaurantType: string;
  businessName: string;
  submissionDate: string;
  contactEmail: string;
  contactPhone: string;
  outletLocation: string;
  fssaiNumber: string;
  accountNumberMasked: string;
  status: ApplicationStatusType;
  rejectionReason?: string;
}

const DEFAULT_DEMO_APPLICATION: DemoApplicationData = {
  referenceId: 'TOM-DEMO-84920',
  restaurantName: 'Royal Biryani & Kebabs (Demo)',
  restaurantType: 'Dine-In & Delivery (Restaurant)',
  businessName: 'Royal Foods Hospitality LLP (Demo)',
  submissionDate: 'Nov 6, 2026, 04:30 PM (Demo)',
  contactEmail: 'partner.onboarding@royalfoods.in (Demo)',
  contactPhone: '+91 98765 43210 (Demo)',
  outletLocation: 'Indiranagar, Bengaluru, Karnataka - 560038',
  fssaiNumber: '11223344556677 (Demo)',
  accountNumberMasked: '•••• •••• •••• 5821',
  status: 'Under Review',
  rejectionReason:
    'The uploaded FSSAI License document scan was blurry or cropped at the corner, and the validity date entered did not match the official FSSAI national registry. Please re-upload a clear scanned certificate copy.'
};

export const PartnerApplicationStatus: React.FC<PartnerApplicationStatusProps> = ({
  onBack,
  onOpenWizard
}) => {
  // Allow user to toggle between different statuses to view all demo states
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatusType>('Under Review');
  const [appData] = useState<DemoApplicationData>(DEFAULT_DEMO_APPLICATION);

  const timelineSteps: { id: ApplicationStatusType; title: string; desc: string }[] = [
    { id: 'Draft', title: 'Draft', desc: 'Application initiated' },
    { id: 'Submitted', title: 'Submitted', desc: 'Docs received' },
    { id: 'Under Review', title: 'Under Review', desc: 'FSSAI & KYC check' },
    { id: 'Approved', title: 'Approved', desc: 'Terminal live' }
  ];

  // Helper to determine step position
  const getStepState = (stepId: ApplicationStatusType) => {
    if (currentStatus === 'Rejected') {
      if (stepId === 'Draft' || stepId === 'Submitted') return 'completed';
      if (stepId === 'Under Review') return 'rejected';
      return 'upcoming';
    }

    const order: ApplicationStatusType[] = ['Draft', 'Submitted', 'Under Review', 'Approved'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const getStatusBadgeStyle = (status: ApplicationStatusType) => {
    switch (status) {
      case 'Draft':
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          border: '#D1D5DB',
          icon: <Clock size={14} />
        };
      case 'Submitted':
        return {
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#93C5FD',
          icon: <FileText size={14} />
        };
      case 'Under Review':
        return {
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FCD34D',
          icon: <RefreshCw size={14} className="animate-spin" />
        };
      case 'Approved':
        return {
          bg: '#ECFDF5',
          color: '#047857',
          border: '#6EE7B7',
          icon: <CheckCircle2 size={14} />
        };
      case 'Rejected':
        return {
          bg: '#FEE2E2',
          color: '#B91C1C',
          border: '#FCA5A5',
          icon: <AlertTriangle size={14} />
        };
    }
  };

  const statusStyle = getStatusBadgeStyle(currentStatus);

  return (
    <div
      style={{
        backgroundColor: '#F8F9FA',
        minHeight: '100%',
        color: '#1E1E24',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '40px'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ height: '20px', width: '1px', backgroundColor: '#E5E7EB' }} />

          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 900, color: '#111827', margin: 0 }}>
              Application Status
            </h1>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Track your restaurant partnership application.
            </p>
          </div>
        </div>

        {/* Demo Mode Notice Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              border: '1px solid #BFDBFE'
            }}
          >
            DEMO MODE • FRONTEND ONLY
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '960px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {/* Interactive Demo State Switcher */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#374151' }}>
              Preview Status State (Demo):
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'] as ApplicationStatusType[]).map((st) => {
              const isSelected = currentStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCurrentStatus(st)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid #D1D5DB',
                    backgroundColor: isSelected ? '#FFF5F4' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary)' : '#4B5563',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Main Application Status Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid #F3F4F6'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  RESTAURANT PARTNER ONBOARDING
                </span>
                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>•</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>
                  {appData.referenceId}
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 }}>
                {appData.restaurantName}
              </h2>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>
                Submission Date: <b>{appData.submissionDate}</b>
              </p>
            </div>

            {/* Current Status Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                border: `1.5px solid ${statusStyle.border}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              {statusStyle.icon}
              <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.02em' }}>
                {currentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* 2. Status Progress Timeline */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#374151', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Onboarding Progress Timeline
            </h3>

            {/* Responsive Stepper Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                position: 'relative'
              }}
            >
              {timelineSteps.map((step, idx) => {
                const state = getStepState(step.id);
                const isCompleted = state === 'completed';
                const isActive = state === 'active';
                const isRejected = state === 'rejected';

                let iconNode = <span>{idx + 1}</span>;
                let circleBg = '#E5E7EB';
                let circleColor = '#6B7280';
                let cardBg = '#FAFAFA';
                let cardBorder = '#F3F4F6';
                let titleColor = '#4B5563';

                if (isCompleted) {
                  iconNode = <CheckCircle2 size={18} color="#FFFFFF" />;
                  circleBg = '#10B981';
                  circleColor = '#FFFFFF';
                  cardBg = '#F0FDF4';
                  cardBorder = '#A7F3D0';
                  titleColor = '#065F46';
                } else if (isActive) {
                  iconNode = <span>{idx + 1}</span>;
                  circleBg = 'var(--color-primary)';
                  circleColor = '#FFFFFF';
                  cardBg = '#FFF5F4';
                  cardBorder = 'var(--color-primary)';
                  titleColor = 'var(--color-primary)';
                } else if (isRejected) {
                  iconNode = <AlertTriangle size={18} color="#FFFFFF" />;
                  circleBg = '#EF4444';
                  circleColor = '#FFFFFF';
                  cardBg = '#FEF2F2';
                  cardBorder = '#F87171';
                  titleColor = '#991B1B';
                }

                return (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: cardBg,
                      border: `1.5px solid ${cardBorder}`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: circleBg,
                        color: circleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {iconNode}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: titleColor,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {step.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
                        {isCompleted
                          ? 'Completed'
                          : isActive
                          ? 'Current Stage'
                          : isRejected
                          ? 'Changes Needed'
                          : step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Review Information Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1.5px solid ${statusStyle.border}`,
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              {currentStatus === 'Draft' && <Clock size={22} />}
              {currentStatus === 'Submitted' && <FileText size={22} />}
              {currentStatus === 'Under Review' && <RefreshCw size={22} className="animate-spin" />}
              {currentStatus === 'Approved' && <ShieldCheck size={22} />}
              {currentStatus === 'Rejected' && <AlertTriangle size={22} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {currentStatus === 'Draft' && 'Application Draft in Progress'}
                  {currentStatus === 'Submitted' && 'Application Submitted & Queued'}
                  {currentStatus === 'Under Review' && 'Application Under Compliance Review'}
                  {currentStatus === 'Approved' && 'Application Approved — Welcome to Tomattto!'}
                  {currentStatus === 'Rejected' && 'Application Requires Changes'}
                </h3>
              </div>

              {/* Exact required review info messages */}
              <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                {currentStatus === 'Draft' &&
                  'Complete and submit your application to begin the review process.'}
                {currentStatus === 'Submitted' &&
                  'Your application has been submitted and is waiting for review.'}
                {currentStatus === 'Under Review' &&
                  'Our team is currently reviewing your application.'}
                {currentStatus === 'Approved' &&
                  'Your application has been approved. Further onboarding instructions will follow.'}
                {currentStatus === 'Rejected' &&
                  'Your application requires changes. Please review the feedback provided.'}
              </p>

              {/* Status specific detailed guidance notes */}
              {currentStatus === 'Under Review' && (
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginTop: '14px',
                    fontSize: '12px',
                    color: '#92400E',
                    lineHeight: 1.45
                  }}
                >
                  <b>Current Checkpoints:</b> FSSAI license authenticity validation and bank settlement account clearance are currently being processed by our compliance team. Typical turnaround is 24 to 48 business hours. You will receive updates at <b>{appData.contactEmail}</b>.
                </div>
              )}

              {currentStatus === 'Approved' && (
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginTop: '14px',
                    fontSize: '12px',
                    color: '#065F46',
                    lineHeight: 1.45
                  }}
                >
                  <b>Next Steps:</b> Your digital Merchant Partner Agreement has been dispatched to your email. Your kitchen order receiving terminal has been provisioned. Please complete your initial menu dish setup to begin accepting live orders.
                </div>
              )}

              {/* If status is Rejected, display demo rejection reason */}
              {currentStatus === 'Rejected' && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginTop: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertCircle size={15} color="#DC2626" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B' }}>
                      Feedback from Compliance Reviewer (Demo):
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#B91C1C', margin: 0, lineHeight: 1.45 }}>
                    "{appData.rejectionReason}"
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={onOpenWizard}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Update Application Details
                    </button>
                  </div>
                </div>
              )}

              {currentStatus === 'Draft' && onOpenWizard && (
                <div style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={onOpenWizard}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Resume Application Wizard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Application Details Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F3F4F6'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Store size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Application Details
                </h3>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  Submitted information snapshot for reference
                </p>
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                padding: '3px 8px',
                borderRadius: '6px'
              }}
            >
              Demo Record
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Restaurant Name
              </span>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0' }}>
                {appData.restaurantName}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Restaurant Type
              </span>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '3px 0 0' }}>
                {appData.restaurantType}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Legal Business Name
              </span>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '3px 0 0' }}>
                {appData.businessName}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Application Submission Date
              </span>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                {appData.submissionDate}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contact Email
              </span>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '3px 0 0' }}>
                {appData.contactEmail}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Outlet Location
              </span>
              <p style={{ fontSize: '13px', color: '#374151', margin: '3px 0 0', lineHeight: 1.4 }}>
                {appData.outletLocation}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                FSSAI License Reference
              </span>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace' }}>
                {appData.fssaiNumber}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Payout Destination
              </span>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: '3px 0 0', fontFamily: 'monospace' }}>
                {appData.accountNumberMasked}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Support & Assistance Box */}
        <div
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={18} color="#4B5563" />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Have questions about your restaurant application?
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
                Our merchant support team is available Mon–Sat (9 AM – 8 PM) to assist you.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid #D1D5DB',
                cursor: 'pointer'
              }}
            >
              Return to Partner Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
