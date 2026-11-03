import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  X,
  User,
  ShieldCheck,
  Bike,
  CreditCard,
  Award,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  HeartPulse,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Zap,
  Building2,
  Download,
  Share2,
  Check,
  Edit2,
  Save,
  ShieldAlert,
  Flame,
  ThumbsUp
} from 'lucide-react';

interface RiderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderProfileModal: React.FC<RiderProfileModalProps> = ({ isOpen, onClose }) => {
  const { allRiderApplications, riderEarningsToday, riderTripsToday } = useTomattto();
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'vehicle' | 'bank'>('overview');
  const [showAccNumber, setShowAccNumber] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedDocZoom, setSelectedDocZoom] = useState<{ title: string; url: string } | null>(null);

  // Use the active or latest approved application, or fallback to default
  const activeApp = allRiderApplications.find((a) => a.status === 'approved') || allRiderApplications[0];

  // Editable fields state
  const [emergencyName, setEmergencyName] = useState('Sunita Singh');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 97412 88419');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard?.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSaveEmergencyContact = () => {
    setIsEditingContact(false);
    setSavedSuccessMsg('Emergency contact details updated successfully!');
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  const applicant = {
    name: activeApp?.fullName || 'Vikram Singh',
    id: activeApp?.id ? activeApp.id.replace('APP-', 'TOM-') : 'TOM-RDR-8921',
    avatar: activeApp?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    phone: activeApp?.phone || '+91 98451 92831',
    email: activeApp?.email || 'vikram.singh@example.com',
    dob: activeApp?.dob || '1998-05-14',
    bloodGroup: activeApp?.bloodGroup || 'O+',
    gender: activeApp?.gender || 'Male',
    address: activeApp?.residentialAddress || '14/B, 2nd Cross, Old Airport Road, Kodihalli, Bengaluru, Karnataka 560008',
    bank: activeApp?.bankDetails || {
      accountHolderName: 'Vikram Singh',
      bankName: 'HDFC Bank (Indiranagar 100ft Road)',
      accountNumber: '50100482914821',
      ifscCode: 'HDFC0000140',
      upiId: 'vikram.singh@okhdfcbank'
    },
    docs: activeApp?.documents || {
      aadhaarFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      aadhaarBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      panFront: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      panBack: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      drivingLicenseFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      drivingLicenseBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2C2C35 0%, #17171C 100%)',
            padding: '20px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            position: 'relative'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#A5A5B2',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2.5px solid var(--color-primary)',
                boxShadow: '0 4px 12px rgba(255, 75, 58, 0.3)',
                flexShrink: 0
              }}
            >
              <img src={applicant.avatar} alt={applicant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{applicant.name}</h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: 'rgba(46, 204, 113, 0.15)',
                    color: 'var(--color-veg)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Verified Partner</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11px', color: '#A5A5B2' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {applicant.id}
                </span>
                <span>•</span>
                <span>Bengaluru Central Hub</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F39C12', fontWeight: 700 }}>
                  <Star size={11} fill="#F39C12" />
                  <span>4.9 (842 Trips)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '12px'
            }}
          >
            {[
              { id: 'overview', label: 'Overview & Stats', icon: Award },
              { id: 'personal', label: 'Personal KYC', icon: User },
              { id: 'vehicle', label: 'Vehicle & Docs', icon: Bike },
              { id: 'bank', label: 'Bank & Payouts', icon: CreditCard }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#FFFFFF' : '#A5A5B2',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccessMsg && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(46, 204, 113, 0.15)',
              color: 'var(--color-veg)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Check size={14} />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Tab Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
          className="no-scrollbar"
        >
          {/* TAB 1: OVERVIEW & PERFORMANCE STATS */}
          {activeTab === 'overview' && (
            <>
              {/* Daily / Lifetime Performance Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#A5A5B2', fontWeight: 700 }}>TODAY'S EARNINGS</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '2px' }}>
                    ₹{riderEarningsToday}
                  </div>
                  <span style={{ fontSize: '10px', color: '#8E8E93' }}>{riderTripsToday} deliveries done</span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#A5A5B2', fontWeight: 700 }}>ON-TIME RATE</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#3498DB', marginTop: '2px' }}>
                    98.6%
                  </div>
                  <span style={{ fontSize: '10px', color: '#8E8E93' }}>Avg 18m delivery</span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#A5A5B2', fontWeight: 700 }}>ACCEPTANCE RATE</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#F39C12', marginTop: '2px' }}>
                    96.2%
                  </div>
                  <span style={{ fontSize: '10px', color: '#8E8E93' }}>Tier 1 Fleet Status</span>
                </div>
              </div>

              {/* Badges & Customer Feedback */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} color="#F39C12" />
                  <span>Customer Praise & Fleet Honors</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🌟</span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>Polite & Courteous</div>
                      <div style={{ fontSize: '10px', color: '#A5A5B2' }}>420 customer tags</div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>⚡</span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>Lightning Fast</div>
                      <div style={{ fontSize: '10px', color: '#A5A5B2' }}>389 customer tags</div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🍱</span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>Careful Handling</div>
                      <div style={{ fontSize: '10px', color: '#A5A5B2' }}>312 customer tags</div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🌧️</span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700 }}>Monsoon Warrior</div>
                      <div style={{ fontSize: '10px', color: '#A5A5B2' }}>Rain surge champion</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance & Shield Cover */}
              <div
                style={{
                  backgroundColor: 'rgba(46, 204, 113, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  border: '1px solid rgba(46, 204, 113, 0.2)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(46, 204, 113, 0.15)',
                    color: 'var(--color-veg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-veg)' }}>
                    Tomattto Shield Rider Insurance: ₹5,00,000
                  </h4>
                  <p style={{ fontSize: '11px', color: '#D1D5DB', marginTop: '2px', lineHeight: 1.5 }}>
                    Active 24/7 medical & accidental coverage while on shift. Policy #TS-99214 underwritten by ICICI Lombard.
                    Includes OPD consultation and hospitalization cover.
                  </p>
                </div>
              </div>

              {/* Operating Preferences & Gear */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  fontSize: '11px'
                }}
              >
                <div>
                  <span style={{ color: '#A5A5B2' }}>Primary Hub:</span>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Indiranagar Central Hub</div>
                </div>
                <div>
                  <span style={{ color: '#A5A5B2' }}>Preferred Shifts:</span>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Lunch (12-3 PM) & Dinner (7-11 PM)</div>
                </div>
                <div>
                  <span style={{ color: '#A5A5B2' }}>Tomattto Bag & Gear:</span>
                  <div style={{ fontWeight: 700, color: 'var(--color-veg)', marginTop: '2px' }}>✓ Issued (Insulated Thermal Bag)</div>
                </div>
                <div>
                  <span style={{ color: '#A5A5B2' }}>Partner Since:</span>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>March 2023 (1.5 Years)</div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PERSONAL KYC DETAILS */}
          {activeTab === 'personal' && (
            <>
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--color-primary)" />
                  <span>Personal Identity & Contact Information</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Full Legal Name:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>{applicant.name}</div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Registered Mobile:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{applicant.phone}</span>
                      <CheckCircle2 size={12} color="var(--color-veg)" />
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Email Address:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>{applicant.email}</div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Date of Birth:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>{applicant.dob} (Age 28)</div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Gender:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>{applicant.gender}</div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Blood Group:</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                      {applicant.bloodGroup} (Emergency Ready)
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Current Residential Address:</span>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '3px', fontSize: '12px', lineHeight: 1.5 }}>
                    📍 {applicant.address}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Card (Editable) */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HeartPulse size={14} color="#E74C3C" />
                    <span>Emergency SOS Contact (In Case of Accidents)</span>
                  </div>

                  {!isEditingContact ? (
                    <button
                      onClick={() => setIsEditingContact(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveEmergencyContact}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-veg)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Save size={12} />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {isEditingContact ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{emergencyName} ({emergencyRelation})</div>
                      <div style={{ color: '#A5A5B2', fontSize: '11px', marginTop: '2px' }}>📞 {emergencyPhone}</div>
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        backgroundColor: 'rgba(231, 76, 60, 0.15)',
                        color: '#FF6B6B',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700
                      }}
                    >
                      Instant SOS Alert Contact
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 3: VEHICLE & VERIFICATION DOCUMENTS */}
          {activeTab === 'vehicle' && (
            <>
              {/* Vehicle Specs */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bike size={14} color="var(--color-primary)" />
                  <span>Registered Transport Vehicle</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Vehicle Model & Make:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Honda Shine 125cc (Disc)</div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Registration Plate (RC):</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px', fontFamily: 'monospace' }}>
                      KA 03 EN 4592
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>RC Fitness Validity:</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-veg)', marginTop: '2px' }}>
                      Valid till 22 Mar 2029
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Insurance Policy:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px', fontSize: '11px', fontFamily: 'monospace' }}>
                      ICICI-LOMB-99201481
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Pollution (PUC) Status:</span>
                    <div style={{ fontWeight: 700, color: 'var(--color-veg)', marginTop: '2px' }}>
                      Active (Exp: 14 Jan 2027)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Fuel Type:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Petrol (E20 Compliant)</div>
                  </div>
                </div>
              </div>

              {/* 6 KYC Scanned Documents Gallery */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="var(--color-veg)" />
                  <span>Government Identification Documents (6/6 Verified Scans)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {[
                    { title: 'Aadhaar Card Front', url: applicant.docs.aadhaarFront },
                    { title: 'Aadhaar Card Back', url: applicant.docs.aadhaarBack },
                    { title: 'PAN Card Front', url: applicant.docs.panFront },
                    { title: 'PAN Card Back', url: applicant.docs.panBack },
                    { title: 'Driving License Front', url: applicant.docs.drivingLicenseFront },
                    { title: 'Driving License Back', url: applicant.docs.drivingLicenseBack }
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#D1D5DB' }}>{doc.title}</span>
                      <div
                        style={{
                          height: '80px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#000',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedDocZoom({ title: doc.title, url: doc.url || '' })}
                      >
                        {doc.url ? (
                          <img src={doc.url} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A5A5B2', fontSize: '10px' }}>
                            Scan
                          </div>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <Eye size={16} color="#FFF" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: 'var(--color-veg)', fontSize: '9px', fontWeight: 800 }}>
                        <CheckCircle2 size={10} />
                        <span>UIDAI/RTO Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 4: BANK & PAYOUTS */}
          {activeTab === 'bank' && (
            <>
              {/* Bank Account Details */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="var(--color-veg)" />
                  <span>Bank Account for Direct IMPS/NEFT Settlements</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Account Holder Name:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      {applicant.bank.accountHolderName}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Bank Name & Branch:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      {applicant.bank.bankName}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>Account Number:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#FFFFFF' }}>
                        {showAccNumber
                          ? applicant.bank.accountNumber
                          : `•••• •••• •••• ${applicant.bank.accountNumber.slice(-4)}`}
                      </span>
                      <button
                        onClick={() => setShowAccNumber(!showAccNumber)}
                        style={{ background: 'transparent', border: 'none', color: '#A5A5B2', cursor: 'pointer', padding: 0 }}
                      >
                        {showAccNumber ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#A5A5B2', fontSize: '11px' }}>IFSC Code:</span>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', marginTop: '2px', fontFamily: 'monospace' }}>
                      {applicant.bank.ifscCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* UPI Daily Instant Payouts */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} color="var(--color-primary)" />
                  <span>Instant Daily Payout UPI ID</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(46, 204, 113, 0.15)',
                        color: 'var(--color-veg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      UPI
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{applicant.bank.upiId}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-veg)', fontWeight: 600 }}>
                        ✓ Auto-credited every night at 11:30 PM IST
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyUpi(applicant.bank.upiId)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: copiedUpi ? 'var(--color-veg)' : 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedUpi ? <Check size={12} /> : null}
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Payout Policy Details */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  color: '#A5A5B2',
                  lineHeight: 1.6
                }}
              >
                <strong style={{ color: '#FFFFFF' }}>Payout Schedule & Terms:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>Trip earnings, monsoon surges, and customer tips are calculated at the end of each shift.</li>
                  <li>Zero processing fee on daily automatic NEFT/UPI bank deposits.</li>
                  <li>Weekly incentive bonuses (Target trips & peak hour milestones) credit every Monday.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#17171C',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '11px', color: '#A5A5B2' }}>
            Tomattto Delivery Fleet • Partner Portal v2.4
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Document Zoom Modal */}
      {selectedDocZoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedDocZoom(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h4 style={{ fontSize: '13px', fontWeight: 800 }}>{selectedDocZoom.title}</h4>
              <button
                onClick={() => setSelectedDocZoom(null)}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#0D0D11', display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedDocZoom.url}
                alt={selectedDocZoom.title}
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
