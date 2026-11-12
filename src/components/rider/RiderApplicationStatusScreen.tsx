import React from 'react';
import {
  Clock,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  RotateCcw,
  LogIn,
  ArrowRight,
  Bike,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { RiderOnboardingStatus, RiderOnboardingApplication } from '../../types';

interface RiderApplicationStatusScreenProps {
  status: RiderOnboardingStatus;
  application?: RiderOnboardingApplication | null;
  onResume: () => void;
  onResubmit: () => void;
  onSwitchAccount: () => void;
  onRefresh?: () => void;
}

export const RiderApplicationStatusScreen: React.FC<RiderApplicationStatusScreenProps> = ({
  status,
  application,
  onResume,
  onResubmit,
  onSwitchAccount,
  onRefresh
}) => {
  const isActionRequired = status === 'action_required';
  const isRejected = status === 'rejected';
  const isUnderReview = status === 'under_review' || status === 'submitted' || status === 'in_review';
  const isDraft = status === 'draft';

  const reason = application?.rejectionReason || application?.resubmissionNote || 'Documents require updated clarity.';

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
      {/* Top Header */}
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
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 75, 58, 0.15)',
              border: '1px solid rgba(255, 75, 58, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #FF4B3A)'
            }}
          >
            <Bike size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>Application Status</div>
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Ref: {application?.applicationRef || application?.id || 'APP-RDR-PENDING'}
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchAccount}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#D1D5DB',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <LogIn size={12} />
          <span>Switch Account</span>
        </button>
      </div>

      {/* Main Status Hero Banner */}
      <div
        style={{
          borderRadius: '16px',
          padding: '24px 20px',
          backgroundColor: isActionRequired
            ? 'rgba(245, 158, 11, 0.08)'
            : isRejected
            ? 'rgba(239, 68, 68, 0.08)'
            : 'rgba(59, 130, 246, 0.08)',
          border: `1px solid ${
            isActionRequired
              ? 'rgba(245, 158, 11, 0.35)'
              : isRejected
              ? 'rgba(239, 68, 68, 0.35)'
              : 'rgba(59, 130, 246, 0.3)'
          }`,
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isActionRequired
              ? 'rgba(245, 158, 11, 0.18)'
              : isRejected
              ? 'rgba(239, 68, 68, 0.18)'
              : 'rgba(59, 130, 246, 0.18)',
            color: isActionRequired ? '#F59E0B' : isRejected ? '#EF4444' : '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}
        >
          {isActionRequired ? (
            <AlertCircle size={28} />
          ) : isRejected ? (
            <ShieldAlert size={28} />
          ) : (
            <Clock size={28} />
          )}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '6px' }}>
          {isActionRequired
            ? 'Action Required: Resubmit Documents'
            : isRejected
            ? 'Application Rejected'
            : isDraft
            ? 'Application Draft Saved'
            : 'Application Under Review'}
        </h2>

        <p
          style={{
            fontSize: '12px',
            color: '#D1D5DB',
            lineHeight: 1.5,
            marginBottom: '16px',
            maxWidth: '320px',
            margin: '0 auto 16px auto'
          }}
        >
          {isActionRequired
            ? 'Our verification team reviewed your application and noted items that require your correction.'
            : isRejected
            ? 'Your application could not be approved at this time. Please review the explanation below.'
            : isDraft
            ? 'You have an incomplete registration application. Resume now to complete verification.'
            : 'Our fleet operations team is reviewing your documents and vehicle details. Verification typically takes 2 to 4 hours.'}
        </p>

        {/* Feedback / Reason Box for Action Required or Rejected */}
        {(isActionRequired || isRejected) && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: isActionRequired
                ? 'rgba(245, 158, 11, 0.12)'
                : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${
                isActionRequired ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'
              }`,
              color: isActionRequired ? '#FDE68A' : '#FECACA',
              fontSize: '12px',
              textAlign: 'left',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertCircle size={14} />
              <span>Reviewer Feedback:</span>
            </div>
            <div style={{ lineHeight: 1.4 }}>{reason}</div>
          </div>
        )}

        {/* Action Button */}
        {isActionRequired ? (
          <button
            onClick={onResubmit}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#F59E0B',
              color: '#000000',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={16} />
            <span>Update Documents & Resubmit</span>
          </button>
        ) : isDraft ? (
          <button
            onClick={onResume}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary, #FF4B3A)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>Resume Application</span>
            <ArrowRight size={16} />
          </button>
        ) : isRejected ? (
          <button
            onClick={onResubmit}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} />
            <span>Submit Revised Application</span>
          </button>
        ) : (
          <div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={14} />
                <span>Check Status</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submitted Application Summary Card */}
      {application && (
        <div
          style={{
            borderRadius: '14px',
            backgroundColor: '#1E1E24',
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
              justifyContent: 'space-between'
            }}
          >
            <span>Application Summary</span>
            <span
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: isActionRequired
                  ? 'rgba(245, 158, 11, 0.2)'
                  : isRejected
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(59, 130, 246, 0.2)',
                color: isActionRequired ? '#F59E0B' : isRejected ? '#EF4444' : '#60A5FA',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}
            >
              {status.replace('_', ' ')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
              <span>Applicant Name:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{application.fullName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
              <span>Registered Mobile:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{application.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
              <span>Vehicle Type:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{application.vehicleType || 'Motorcycle'}</span>
            </div>
            {application.vehicleNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
                <span>Vehicle Reg Number:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{application.vehicleNumber}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
              <span>Operating Region:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                {application.city || 'Bengaluru'}
                {application.district ? `, ${application.district}` : ''}
                {application.state ? ` (${application.state})` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF' }}>
              <span>Submitted:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{application.submittedAt || 'Today'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tracking */}
      {application?.timeline && application.timeline.length > 0 && (
        <div
          style={{
            borderRadius: '14px',
            backgroundColor: '#1E1E24',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
            Verification Activity Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {application.timeline.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '11px',
                  borderLeft: '2px solid rgba(255, 75, 58, 0.4)',
                  paddingLeft: '10px',
                  marginLeft: '4px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{item.action}</div>
                  {item.note && <div style={{ color: '#9CA3AF', marginTop: '1px' }}>{item.note}</div>}
                  <div style={{ color: '#6B7280', fontSize: '10px', marginTop: '2px' }}>
                    {item.timestamp} {item.by ? `• ${item.by}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
