import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { supabase } from '../../lib/supabase';
import { Restaurant, RestaurantPartnerApplication } from '../../types';
import { maskPan, maskAadhaar, maskBankAccount } from '../../lib/masking';
import { CreateCouponModal } from './CreateCouponModal';
import { RestaurantManageModal } from './RestaurantManageModal';
import { LiveOperationsMapModal } from './LiveOperationsMapModal';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Store,
  Tag,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  MapPin,
  Activity,
  Download,
  Bike,
  LifeBuoy,
  UserCheck,
  PhoneCall,
  Check,
  AlertCircle,
  Sparkles,
  Wallet,
  AlertTriangle,
  CloudRain,
  Server,
  Cpu,
  Eye,
  X,
  FileText,
  CreditCard,
  RotateCcw,
  ShieldAlert,
  RefreshCw,
  GraduationCap,
  Award,
  Camera
} from 'lucide-react';

interface SupportTicket {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  issue: string;
  category: 'Food Quality' | 'Missing Item' | 'Delivery Delay' | 'Packaging';
  claimAmount: number;
  status: 'Open' | 'Resolved';
  time: string;
}

export const AdminApp: React.FC = () => {
  const {
    restaurants,
    allOrders,
    currentOrder,
    coupons,
    walletBalance,
    creditRefund,
    updateRestaurantCommission,
    toggleRestaurantStatus,
    allRiderApplications,
    approveRiderKyc,
    rejectRiderKyc,
    requestResubmissionRiderKyc,
    allRestaurantApplications,
    isAppsLoading,
    appsError,
    fetchAdminRestaurantApplications,
    approveRestaurantApplication,
    rejectRestaurantApplication,
    requestResubmissionRestaurantApplication,
    verifyRestaurantDocument,
    verifyRiderQualification,
    verifyRiderDocument,
    tierConfigurations,
    updateTierConfig,
    selfieVerifications,
    refreshAllApplications
  } = useTomattto();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'restaurants' | 'riders' | 'customers' | 'tickets' | 'coupons'>('overview');
  const [restaurantSubView, setRestaurantSubView] = useState<'onboarded' | 'applications'>('onboarded');
  const [riderFilter, setRiderFilter] = useState<'all' | 'under_review' | 'action_required' | 'approved' | 'rejected'>('all');
  const [inspectedRiderApp, setInspectedRiderApp] = useState<any | null>(null);
  const [resubmitModalAppId, setResubmitModalAppId] = useState<string | null>(null);
  const [resubmitReasonText, setResubmitReasonText] = useState('');
  const [rejectModalAppId, setRejectModalAppId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [selectedManageRestaurant, setSelectedManageRestaurant] = useState<Restaurant | null>(null);
  const [isLiveMapOpen, setIsLiveMapOpen] = useState(false);
  const [isMonsoonSurge, setIsMonsoonSurge] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);
  const [kycSuccessMsg, setKycSuccessMsg] = useState<string | null>(null);
  const [restSuccessMsg, setRestSuccessMsg] = useState<string | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  const handlePreviewDoc = async (
    title: string,
    rawUrlOrPath?: string | null,
    bucket: 'rider-kyc-documents' | 'partner-kyc-documents' = 'rider-kyc-documents'
  ) => {
    if (!rawUrlOrPath) return;
    if (rawUrlOrPath.startsWith('http') || rawUrlOrPath.startsWith('data:') || rawUrlOrPath.startsWith('blob:')) {
      setSelectedDocPreview({ title, url: rawUrlOrPath });
      return;
    }
    // If it's a Supabase storage path, generate temporary signed URL
    if (supabase) {
      try {
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(rawUrlOrPath, 3600);
        if (data?.signedUrl) {
          setSelectedDocPreview({ title, url: data.signedUrl });
          return;
        }
      } catch (e) {
        console.warn('Error generating signed URL:', e);
      }
    }
    setSelectedDocPreview({ title, url: rawUrlOrPath });
  };

  const handleDownloadDoc = async (
    rawUrlOrPath?: string | null,
    fileName: string = 'document',
    bucket: 'rider-kyc-documents' | 'partner-kyc-documents' = 'partner-kyc-documents'
  ) => {
    if (!rawUrlOrPath) return;
    let downloadUrl = rawUrlOrPath;
    if (!rawUrlOrPath.startsWith('http') && !rawUrlOrPath.startsWith('data:') && !rawUrlOrPath.startsWith('blob:') && supabase) {
      try {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(rawUrlOrPath, 3600);
        if (data?.signedUrl) {
          downloadUrl = data.signedUrl;
        }
      } catch (e) {
        console.warn('Error creating download URL:', e);
      }
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Restaurant Partner Applications State
  const [restaurantAppFilter, setRestaurantAppFilter] = useState<'all' | 'pending' | 'action_required' | 'approved' | 'rejected'>('all');
  const [inspectedRestaurantApp, setInspectedRestaurantApp] = useState<RestaurantPartnerApplication | null>(null);
  const [resubmitRestModalAppId, setResubmitRestModalAppId] = useState<string | null>(null);
  const [resubmitRestReasonText, setResubmitRestReasonText] = useState('');
  const [rejectRestModalAppId, setRejectRestModalAppId] = useState<string | null>(null);
  const [rejectRestReasonText, setRejectRestReasonText] = useState('');
  const [isRefreshingApps, setIsRefreshingApps] = useState(false);

  // Rider Qualification Verification Rejection State
  const [qualRejectModalAppId, setQualRejectModalAppId] = useState<string | null>(null);
  const [qualRejectReasonText, setQualRejectReasonText] = useState('');

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-401',
      orderId: 'TOM-8921',
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98765 43210',
      restaurantName: 'Meghana Foods',
      issue: 'Paneer Biryani delivered cold and spicy oil leaked in packaging',
      category: 'Food Quality',
      claimAmount: 180,
      status: 'Open',
      time: '12 mins ago'
    },
    {
      id: 'TCK-398',
      orderId: 'TOM-8845',
      customerName: 'Ananya Sen',
      customerPhone: '+91 98112 34567',
      restaurantName: 'Truffles',
      issue: 'Extra Peri Peri Mayo dip was missing from burger combo',
      category: 'Missing Item',
      claimAmount: 60,
      status: 'Open',
      time: '34 mins ago'
    },
    {
      id: 'TCK-392',
      orderId: 'TOM-8712',
      customerName: 'Rohan Mehta',
      customerPhone: '+91 99201 88291',
      restaurantName: 'Leon Grill',
      issue: 'Delivery delayed by 32 minutes during peak rain',
      category: 'Delivery Delay',
      claimAmount: 120,
      status: 'Resolved',
      time: '2 hours ago'
    }
  ]);

  const handleApproveRefund = (ticket: SupportTicket) => {
    creditRefund(ticket.claimAmount, `${ticket.category} on #${ticket.orderId}`);
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: 'Resolved' } : t))
    );
    setRefundSuccessMsg(`Approved ₹${ticket.claimAmount} instant wallet refund for ${ticket.customerName}!`);
    setTimeout(() => setRefundSuccessMsg(null), 4000);
  };

  const combinedOrders = allOrders.length > 0 ? allOrders : (currentOrder ? [currentOrder] : []);

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Restaurant', 'Items Count', 'Total (INR)', 'Payment Method', 'Status', 'Date'];
    const rows = combinedOrders.map((ord) => [
      ord.id,
      ord.customerName || 'Rahul Sharma',
      ord.restaurant.name,
      ord.items.length,
      ord.totalAmount,
      ord.paymentMethod.toUpperCase(),
      ord.status.toUpperCase(),
      ord.createdAt || '29 Oct 2026'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tomattto_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportSettlementsCSV = () => {
    const headers = ['Restaurant ID', 'Restaurant Name', 'Take Rate', 'Estimated GMV (INR)', 'Platform Fee (INR)', 'Net Settlement Due (INR)', 'Status'];
    const rows = restaurants.map((r) => {
      const gmv = Math.round(r.costForTwo * 5.4);
      const comm = Math.round(gmv * ((r.commissionRate || 20) / 100));
      const net = gmv - comm;
      return [
        r.id,
        r.name,
        `${r.commissionRate || 20}%`,
        gmv,
        comm,
        net,
        r.status || 'Active'
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tomattto_Settlements_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        paddingBottom: '40px'
      }}
    >
      {/* Top Admin Bar */}
      <div
        style={{
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              🍅
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Tomattto HQ Operations Console</h2>
              <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Live Ops • City: Bengaluru Central</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {/* Weather / Monsoon Surge Toggle */}
            <button
              onClick={() => setIsMonsoonSurge(!isMonsoonSurge)}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isMonsoonSurge ? 'rgba(52, 152, 219, 0.25)' : 'rgba(255,255,255,0.08)',
                color: isMonsoonSurge ? '#3498DB' : '#A5A5B2',
                border: `1px solid ${isMonsoonSurge ? '#3498DB' : 'rgba(255,255,255,0.1)'}`,
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <CloudRain size={13} color={isMonsoonSurge ? '#3498DB' : '#A5A5B2'} />
              <span>{isMonsoonSurge ? 'Monsoon Surge ON (+₹25)' : 'Rain Surge'}</span>
            </button>

            <button
              onClick={() => setIsLiveMapOpen(true)}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 75, 58, 0.2)',
                color: '#FF6B6B',
                border: '1px solid #FF6B6B',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Activity size={13} />
              <span>Live Ops Map</span>
            </button>

            <div
              className="no-scrollbar"
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                maxWidth: '100%',
                paddingBottom: '2px'
              }}
            >
              {(() => {
                const pendingKycCount = allRiderApplications.filter((a) => a.status === 'under_review').length;
                return [
                  { id: 'overview', label: 'Dashboard' },
                  { id: 'orders', label: 'Live Orders' },
                  { id: 'restaurants', label: `Restaurants (${restaurants.length})` },
                  { id: 'riders', label: pendingKycCount > 0 ? `⚡ Riders & KYC (${pendingKycCount} Pending)` : 'Riders & KYC' },
                  { id: 'customers', label: 'Customers (5)' },
                  { id: 'tickets', label: `Support & Refunds (${tickets.filter((t) => t.status === 'Open').length})` },
                  { id: 'coupons', label: `Coupons (${coupons.length})` }
                ];
              })().map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monsoon Rain Surge Alert Banner */}
        {isMonsoonSurge && (
          <div
            style={{
              marginTop: '12px',
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              border: '1px solid #3498DB',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#3498DB',
              fontWeight: 700
            }}
          >
            <CloudRain size={16} />
            <span>🌧️ Monsoon Surge Mode ACTIVE: Delivery partner payout boosted by +₹25/trip, customer delivery ETA extended by +15 mins automatically.</span>
          </div>
        )}
      </div>

      {/* Admin Content Area */}
      <div style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Refund Success Alert Banner */}
        {refundSuccessMsg && (
          <div
            style={{
              marginBottom: '18px',
              backgroundColor: 'rgba(46, 204, 113, 0.15)',
              border: '1.5px solid var(--color-veg)',
              color: 'var(--color-veg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 700,
              animation: 'fadeIn 0.2s ease-in'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{refundSuccessMsg}</span>
          </div>
        )}
        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              {[
                {
                  title: 'Today’s GMV',
                  value: '₹1,48,250',
                  change: '+18.4% vs last week',
                  icon: <DollarSign size={20} color="var(--color-primary)" />,
                  color: 'var(--color-primary-light)'
                },
                {
                  title: 'Total Orders',
                  value: '312 orders',
                  change: '+12% completion rate',
                  icon: <ShoppingBag size={20} color="#27AE60" />,
                  color: 'var(--color-veg-bg)'
                },
                {
                  title: 'Active Riders Online',
                  value: '48 riders',
                  change: 'Avg ETA: 21 mins',
                  icon: <Users size={20} color="#2980B9" />,
                  color: 'rgba(41, 128, 185, 0.15)'
                },
                {
                  title: 'Platform Commission',
                  value: '₹26,685',
                  change: '18% take-rate',
                  icon: <TrendingUp size={20} color="#D35400" />,
                  color: 'rgba(211, 84, 0, 0.15)'
                }
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {kpi.title}
                    </span>
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: kpi.color,
                        display: 'flex'
                      }}
                    >
                      {kpi.icon}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px' }}>{kpi.value}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700 }}>
                    <ArrowUpRight size={14} />
                    <span>{kpi.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sales Hourly Peak Chart Visual */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Hourly Demand & Order Peaks (Live)</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Lunch (12:30 PM - 2:30 PM) & Dinner (7:30 PM - 10:30 PM) surges
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={exportSettlementsCSV}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      color: 'var(--color-text-main)',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer'
                    }}
                    title="Export Merchant Settlements to CSV"
                  >
                    <Download size={13} color="var(--color-primary)" />
                    <span>Export Settlements CSV</span>
                  </button>

                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-veg)', backgroundColor: 'var(--color-veg-bg)', padding: '5px 10px', borderRadius: '4px' }}>
                    SURGE: 1.0x (Normal)
                  </span>
                </div>
              </div>

              {/* CSS Bar Chart */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: '140px',
                  gap: '8px',
                  paddingTop: '20px'
                }}
              >
                {[
                  { hour: '9 AM', count: 18, height: '20%' },
                  { hour: '11 AM', count: 42, height: '40%' },
                  { hour: '12 PM', count: 86, height: '80%' },
                  { hour: '1 PM', count: 98, height: '95%', peak: true },
                  { hour: '2 PM', count: 74, height: '70%' },
                  { hour: '4 PM', count: 32, height: '30%' },
                  { hour: '6 PM', count: 54, height: '50%' },
                  { hour: '8 PM', count: 110, height: '100%', peak: true },
                  { hour: '9 PM', count: 92, height: '85%' },
                  { hour: '10 PM', count: 40, height: '38%' }
                ].map((bar, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 700, color: bar.peak ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                      {bar.count}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '40px',
                        height: bar.height,
                        backgroundColor: bar.peak ? 'var(--color-primary)' : 'rgba(255, 75, 58, 0.35)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{bar.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure & Platform Real-Time Telemetry */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={16} color="var(--color-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Platform SLA & Cloud Infrastructure Health</h4>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-veg)', backgroundColor: 'var(--color-veg-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                  ● ALL SYSTEMS OPERATIONAL (99.98%)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'API Edge Latency', val: '22 ms', sub: 'p99 < 45ms', color: 'var(--color-veg)' },
                  { label: 'Active WebSockets', val: '428 conn', sub: 'Riders & Kitchens', color: 'var(--color-primary)' },
                  { label: 'Database Throughput', val: '4,820 QPS', sub: 'Postgres & Redis cache', color: '#2980B9' },
                  { label: 'Payment Gateway SLA', val: '99.85%', sub: 'Razorpay UPI & Cards', color: 'var(--color-veg)' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border-subtle)'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>{item.label}</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: item.color, marginTop: '2px' }}>{item.val}</div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Orders Monitor Table */}
        {activeTab === 'orders' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800 }}>Live Operations Monitor</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Tracking all active and recent customer dispatches
                </p>
              </div>

              <button
                onClick={exportOrdersCSV}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-main)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer'
                }}
              >
                <Download size={13} color="var(--color-primary)" />
                <span>Export Orders (.CSV)</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px' }}>Order ID</th>
                    <th style={{ padding: '10px' }}>Customer</th>
                    <th style={{ padding: '10px' }}>Restaurant</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Payment</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedOrders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 800 }}>#{ord.id}</td>
                      <td style={{ padding: '12px 10px' }}>{ord.customerName}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>{ord.restaurant.name}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>₹{ord.totalAmount}</td>
                      <td style={{ padding: '12px 10px' }}>{ord.paymentMethod.toUpperCase()}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: 'var(--color-veg-bg)',
                            color: 'var(--color-veg)'
                          }}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Restaurants Directory & Partner Applications */}
        {activeTab === 'restaurants' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Restaurant Success Banner */}
            {restSuccessMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(46, 204, 113, 0.15)',
                  border: '1px solid var(--color-veg)',
                  color: 'var(--color-veg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>{restSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setRestSuccessMsg(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-veg)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Sub-Navigation: Onboarded Restaurants vs Partner Applications & KYC */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '14px',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                data-testid="onboarded-restaurants-tab"
                onClick={() => setRestaurantSubView('onboarded')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: restaurantSubView === 'onboarded' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: restaurantSubView === 'onboarded' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: restaurantSubView === 'onboarded' ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  cursor: 'pointer',
                  boxShadow: restaurantSubView === 'onboarded' ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <Store size={16} />
                <span>Onboarded Restaurants ({restaurants.length})</span>
              </button>

              <button
                type="button"
                data-testid="restaurant-applications-tab"
                onClick={() => setRestaurantSubView('applications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: restaurantSubView === 'applications' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: restaurantSubView === 'applications' ? '#FFFFFF' : 'var(--color-text-main)',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: restaurantSubView === 'applications' ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  cursor: 'pointer',
                  boxShadow: restaurantSubView === 'applications' ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <FileText size={16} />
                <span>Restaurant Applications & KYC ({allRestaurantApplications.length})</span>
                {allRestaurantApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length > 0 ? (
                  <span
                    style={{
                      backgroundColor: restaurantSubView === 'applications' ? '#FFFFFF' : 'var(--color-primary)',
                      color: restaurantSubView === 'applications' ? 'var(--color-primary)' : '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {allRestaurantApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length} Pending
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: restaurantSubView === 'applications' ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-surface-muted)',
                      color: restaurantSubView === 'applications' ? '#FFFFFF' : 'var(--color-text-muted)',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    0
                  </span>
                )}
              </button>
            </div>

            {/* VIEW A: Existing Onboarded Restaurants Directory (Preserved Exactly) */}
            {restaurantSubView === 'onboarded' && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>
                  Onboarded Restaurant Partners ({restaurants.length})
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                  {restaurants.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedManageRestaurant(r)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={r.coverImage} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 800 }}>{r.name}</h5>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              backgroundColor: r.status === 'suspended' ? 'rgba(231, 76, 60, 0.15)' : 'var(--color-veg-bg)',
                              color: r.status === 'suspended' ? '#E74C3C' : 'var(--color-veg)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            {r.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{r.address}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                            {r.commissionRate || 18}% Take-Rate
                          </span>
                          <span>•</span>
                          <span>{r.categories.reduce((sum, cat) => sum + cat.items.length, 0)} Dishes</span>
                          <span>•</span>
                          <span>{r.rating} ★ ({r.ratingCount || 120})</span>
                          <span>•</span>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>Manage Menu & Store ➔</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW B: Restaurant Applications & KYC Document Verification */}
            {restaurantSubView === 'applications' && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Store size={20} color="var(--color-primary)" />
                      <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                        Restaurant Partner Applications & KYC Verification
                      </h4>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: 'rgba(255, 75, 58, 0.15)',
                          color: 'var(--color-primary)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        {allRestaurantApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length} Pending
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                      Verify regulatory documents (Business PAN, FSSAI License, GSTIN, Settlement Bank Proof) and provision active store terminals.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Realtime Active Pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(46, 204, 113, 0.12)',
                        border: '1px solid rgba(46, 204, 113, 0.3)',
                        color: 'var(--color-veg)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-veg)',
                          boxShadow: '0 0 6px var(--color-veg)'
                        }}
                      />
                      <span>Realtime Active</span>
                    </div>

                    {/* Manual Refresh Button */}
                    <button
                      onClick={async () => {
                        setIsRefreshingApps(true);
                        await refreshAllApplications();
                        setTimeout(() => setIsRefreshingApps(false), 500);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface)',
                        border: '1.5px solid var(--color-border)',
                        color: 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <RefreshCw size={13} className={isRefreshingApps || isAppsLoading ? 'animate-spin' : ''} />
                      <span>Refresh Applications</span>
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    { id: 'all', label: `All (${allRestaurantApplications.length})` },
                    {
                      id: 'pending',
                      label: `Pending (${allRestaurantApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length})`
                    },
                    {
                      id: 'action_required',
                      label: `Action Required (${allRestaurantApplications.filter(a => a.status === 'action_required').length})`
                    },
                    {
                      id: 'approved',
                      label: `Approved (${allRestaurantApplications.filter(a => a.status === 'approved').length})`
                    },
                    {
                      id: 'rejected',
                      label: `Rejected (${allRestaurantApplications.filter(a => a.status === 'rejected').length})`
                    }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRestaurantAppFilter(f.id as any)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: restaurantAppFilter === f.id ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: restaurantAppFilter === f.id ? '#FFFFFF' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: restaurantAppFilter === f.id ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: restaurantAppFilter === f.id ? 'var(--shadow-glow)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Loading State */}
                {isAppsLoading && (
                  <div
                    style={{
                      padding: '48px 24px',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px dashed var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    <RefreshCw size={28} className="animate-spin" color="var(--color-primary)" />
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      Loading restaurant partner applications...
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Querying database and verifying regulatory KYC documents.
                    </div>
                  </div>
                )}

                {/* Error Banner with Retry */}
                {!isAppsLoading && appsError && (
                  <div
                    style={{
                      padding: '16px 20px',
                      backgroundColor: 'rgba(231, 76, 60, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-nonveg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      marginBottom: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AlertTriangle size={22} color="var(--color-nonveg)" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-nonveg)' }}>
                          Unable to fetch restaurant applications
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {appsError}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => fetchAdminRestaurantApplications()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-nonveg)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {/* Applications List or Empty States */}
                {!isAppsLoading && !appsError && allRestaurantApplications.length === 0 && (
                  <div
                    data-testid="empty-restaurant-applications"
                    style={{
                      padding: '56px 24px',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1.5px dashed var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxWidth: '620px',
                      margin: '16px auto'
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <Store size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                      No restaurant applications received yet.
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6', maxWidth: '460px', margin: '0 0 20px' }}>
                      Submitted restaurant partner applications and compliance documents from the onboarding wizard will appear here in real time.
                    </p>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)'
                      }}
                    >
                      <Activity size={14} color="var(--color-veg)" />
                      <span>Listening for incoming partner applications on realtime sync channel</span>
                    </div>
                  </div>
                )}

                {!isAppsLoading && !appsError && allRestaurantApplications.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {allRestaurantApplications
                      .filter((app) => {
                        if (restaurantAppFilter === 'all') return true;
                        if (restaurantAppFilter === 'pending') return app.status === 'submitted' || app.status === 'under_review';
                        return app.status === restaurantAppFilter;
                      }).length === 0 ? (
                        <div
                          style={{
                            padding: '36px 20px',
                            textAlign: 'center',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--color-border)',
                            color: 'var(--color-text-muted)'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>
                            No restaurant applications found with status &ldquo;{restaurantAppFilter}&rdquo;.
                          </div>
                        </div>
                      ) : (
                        allRestaurantApplications
                          .filter((app) => {
                            if (restaurantAppFilter === 'all') return true;
                            if (restaurantAppFilter === 'pending') return app.status === 'submitted' || app.status === 'under_review';
                            return app.status === restaurantAppFilter;
                          })
                          .map((app) => {
                        const isPending = app.status === 'submitted' || app.status === 'under_review';
                        const isActionRequired = app.status === 'action_required';
                        const isApproved = app.status === 'approved';
                        const isRejected = app.status === 'rejected';

                        // Document presence checks
                        const hasPan = Boolean(app.documents?.panDoc);
                        const hasFssai = Boolean(app.documents?.fssaiDoc);
                        const hasBank = Boolean(app.documents?.chequeDoc);
                        const isFssaiExpired = Boolean(app.fssaiExpiryDate && new Date(app.fssaiExpiryDate).getTime() < Date.now());
                        const hasRejectedDoc =
                          app.documentStatuses?.panDoc === 'rejected' ||
                          app.documentStatuses?.fssaiDoc === 'rejected' ||
                          app.documentStatuses?.chequeDoc === 'rejected' ||
                          (app.hasGst && app.documentStatuses?.gstDoc === 'rejected');

                        const blockerReasons: string[] = [];
                        if (!hasPan) blockerReasons.push('Business PAN Card missing');
                        if (!hasFssai) blockerReasons.push('FSSAI License document missing');
                        if (!hasBank) blockerReasons.push('Bank Proof / Cancelled Cheque missing');
                        if (isFssaiExpired) blockerReasons.push(`FSSAI License expired on ${app.fssaiExpiryDate}`);
                        if (app.documentStatuses?.panDoc === 'rejected') blockerReasons.push('Business PAN marked as rejected');
                        if (app.documentStatuses?.fssaiDoc === 'rejected') blockerReasons.push('FSSAI License marked as rejected');
                        if (app.documentStatuses?.chequeDoc === 'rejected') blockerReasons.push('Bank Proof marked as rejected');
                        if (app.hasGst && app.documentStatuses?.gstDoc === 'rejected') blockerReasons.push('GST Certificate marked as rejected');

                        const isApprovalBlocked = blockerReasons.length > 0;

                        return (
                          <div
                            key={app.id}
                            style={{
                              borderRadius: 'var(--radius-md)',
                              border: isPending
                                ? '2px solid rgba(243, 156, 18, 0.5)'
                                : '1px solid var(--color-border)',
                              backgroundColor: isPending ? 'rgba(243, 156, 18, 0.03)' : 'var(--color-surface-muted)',
                              padding: '18px',
                              boxShadow: isPending ? '0 0 12px rgba(243, 156, 18, 0.15)' : 'none'
                            }}
                          >
                            {/* Top Bar: Restaurant & Owner Details */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                gap: '12px',
                                borderBottom: '1px solid var(--color-border)',
                                paddingBottom: '14px',
                                marginBottom: '14px'
                              }}
                            >
                              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div
                                  style={{
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '2px solid var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)',
                                    fontWeight: 900,
                                    fontSize: '20px',
                                    flexShrink: 0
                                  }}
                                >
                                  {app.logoUrl ? (
                                    <img src={app.logoUrl} alt={app.restaurantName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    app.restaurantName.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{app.restaurantName}</h4>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontFamily: 'monospace',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        color: 'var(--color-primary)',
                                        fontWeight: 700
                                      }}
                                    >
                                      {app.applicationRef || app.id}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                        color: 'var(--color-text-muted)'
                                      }}
                                    >
                                      {app.restaurantType || 'Dine-In & Delivery'}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: '10px',
                                      fontSize: '11px',
                                      color: 'var(--color-text-muted)',
                                      marginTop: '5px'
                                    }}
                                  >
                                    <span>👤 Owner: <strong>{app.ownerName || app.managerName || 'Partner'}</strong></span>
                                    <span>📞 <strong>{app.phone}</strong></span>
                                    {app.email && <span>✉️ {app.email}</span>}
                                    <span>🏙️ <strong>{app.city}</strong>{app.state ? `, ${app.state}` : ''} {app.pincode ? `- ${app.pincode}` : ''}</span>
                                    <span>⏰ {app.openingTime || '10:00 AM'} - {app.closingTime || '11:00 PM'}</span>
                                    {app.cuisines && app.cuisines.length > 0 && (
                                      <span>🍽️ <strong>{app.cuisines.join(', ')}</strong></span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                                    📍 <em>{app.address || `${app.city}, ${app.state || ''}`}</em> {app.landmark ? `(Near ${app.landmark})` : ''} • Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'Recent'}
                                  </div>
                                </div>
                              </div>

                              {/* Application Status Badge */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    padding: '5px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: isPending
                                      ? 'rgba(243, 156, 18, 0.2)'
                                      : isApproved
                                      ? 'var(--color-veg-bg)'
                                      : isActionRequired
                                      ? 'rgba(245, 158, 11, 0.2)'
                                      : 'rgba(231, 76, 60, 0.15)',
                                    color: isPending
                                      ? '#F39C12'
                                      : isApproved
                                      ? 'var(--color-veg)'
                                      : isActionRequired
                                      ? '#F59E0B'
                                      : '#E74C3C',
                                    border: `1px solid ${
                                      isPending
                                        ? 'rgba(243, 156, 18, 0.4)'
                                        : isApproved
                                        ? 'rgba(46, 204, 113, 0.4)'
                                        : isActionRequired
                                        ? 'rgba(245, 158, 11, 0.4)'
                                        : 'rgba(231, 76, 60, 0.4)'
                                    }`
                                  }}
                                >
                                  {isPending
                                    ? '⏳ PENDING COMPLIANCE REVIEW'
                                    : isApproved
                                    ? '✓ APPROVED & STORE ACTIVATED'
                                    : isActionRequired
                                    ? '⚠️ ACTION REQUIRED (RESUBMISSION)'
                                    : '✕ APPLICATION REJECTED'}
                                </span>
                              </div>
                            </div>

                            {/* Middle: Regulatory Documents Verification Grid (4 Document Slots) */}
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <FileText size={14} color="var(--color-primary)" />
                                  <span>Submitted Regulatory & Compliance Documents (4 Verification Slots)</span>
                                </div>
                                {isFssaiExpired && (
                                  <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                                    ⚠️ FSSAI License Expired
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                  gap: '12px'
                                }}
                              >
                                {[
                                  {
                                    key: 'panDoc' as const,
                                    title: 'Business PAN Card',
                                    docName: app.documents?.panDocName || 'Business PAN',
                                    url: app.documents?.panDoc,
                                    status: app.documentStatuses?.panDoc,
                                    extra: maskPan(app.panNumberMasked || app.panNumber) || 'Masked for Security',
                                    isRequired: true
                                  },
                                  {
                                    key: 'fssaiDoc' as const,
                                    title: 'FSSAI License',
                                    docName: app.documents?.fssaiDocName || 'FSSAI Certificate',
                                    url: app.documents?.fssaiDoc,
                                    status: app.documentStatuses?.fssaiDoc,
                                    extra: app.fssaiLicenseNumber || app.fssaiNumber ? `Lic: ${app.fssaiLicenseNumber || app.fssaiNumber}` : 'Pending validation',
                                    expiryDate: app.fssaiExpiryDate,
                                    isExpired: isFssaiExpired,
                                    isRequired: true
                                  },
                                  {
                                    key: 'gstDoc' as const,
                                    title: 'GST Certificate',
                                    docName: app.documents?.gstDocName || 'GSTIN Certificate',
                                    url: app.documents?.gstDoc,
                                    status: app.documentStatuses?.gstDoc,
                                    extra: app.hasGst || app.gstRegistered ? (app.gstin ? `GSTIN: ${app.gstin}` : 'Registered') : 'Unregistered / Exempt',
                                    isRequired: Boolean(app.hasGst || app.gstRegistered)
                                  },
                                  {
                                    key: 'chequeDoc' as const,
                                    title: 'Bank Proof / Cheque',
                                    docName: app.documents?.chequeDocName || 'Cancelled Cheque',
                                    url: app.documents?.chequeDoc,
                                    status: app.documentStatuses?.chequeDoc,
                                    extra: app.bankName ? `${app.bankName} (${app.bankAccountNumberMasked || 'Masked'})` : 'Settlement Account',
                                    isRequired: true
                                  },
                                  {
                                    key: 'aadhaarFront' as const,
                                    title: 'Aadhaar Card (Front) *',
                                    docName: 'Aadhaar Front',
                                    url: app.documents?.aadhaarFront || (app as any).partnerKycDocuments?.aadhaarFront,
                                    status: (app.documentStatuses as any)?.aadhaarFront,
                                    extra: 'Owner Photo & Date of Birth',
                                    isRequired: true
                                  },
                                  {
                                    key: 'aadhaarBack' as const,
                                    title: 'Aadhaar Card (Back) *',
                                    docName: 'Aadhaar Back',
                                    url: app.documents?.aadhaarBack || (app as any).partnerKycDocuments?.aadhaarBack,
                                    status: (app.documentStatuses as any)?.aadhaarBack,
                                    extra: 'Residential Address & QR Code',
                                    isRequired: true
                                  },
                                  {
                                    key: 'personalPanFront' as const,
                                    title: 'Personal PAN (Front) *',
                                    docName: 'Personal PAN Front',
                                    url: app.documents?.personalPanFront || (app as any).partnerKycDocuments?.personalPanFront,
                                    status: (app.documentStatuses as any)?.personalPanFront,
                                    extra: 'Owner PAN & Signature',
                                    isRequired: true
                                  },
                                  {
                                    key: 'personalPanBack' as const,
                                    title: 'Personal PAN (Back) *',
                                    docName: 'Personal PAN Back',
                                    url: app.documents?.personalPanBack || (app as any).partnerKycDocuments?.personalPanBack,
                                    status: (app.documentStatuses as any)?.personalPanBack,
                                    extra: 'Official Issuance & Security',
                                    isRequired: true
                                  }
                                ].map((doc) => {
                                  const isExempt = !doc.isRequired;
                                  const docStatus = isExempt
                                    ? 'Not Required'
                                    : doc.isExpired
                                    ? 'Expired'
                                    : doc.status === 'verified'
                                    ? 'Verified'
                                    : doc.status === 'rejected'
                                    ? 'Rejected'
                                    : doc.url
                                    ? 'Uploaded'
                                    : 'Missing';

                                  return (
                                    <div
                                      key={doc.key}
                                      style={{
                                        backgroundColor: 'var(--color-surface)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: `1px solid ${
                                          docStatus === 'Expired' || docStatus === 'Rejected'
                                            ? 'rgba(239, 68, 68, 0.4)'
                                            : docStatus === 'Verified'
                                            ? 'rgba(46, 204, 113, 0.4)'
                                            : 'var(--color-border)'
                                        }`,
                                        padding: '10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-main)' }}>{doc.title}</span>
                                        <span
                                          style={{
                                            fontSize: '9px',
                                            fontWeight: 800,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            backgroundColor:
                                              docStatus === 'Verified'
                                                ? 'var(--color-veg-bg)'
                                                : docStatus === 'Rejected' || docStatus === 'Expired'
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : docStatus === 'Not Required'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : 'rgba(243, 156, 18, 0.15)',
                                            color:
                                              docStatus === 'Verified'
                                                ? 'var(--color-veg)'
                                                : docStatus === 'Rejected' || docStatus === 'Expired'
                                                ? '#EF4444'
                                                : docStatus === 'Not Required'
                                                ? '#9CA3AF'
                                                : '#F39C12'
                                          }}
                                        >
                                          {docStatus === 'Verified' && '✓ Verified'}
                                          {docStatus === 'Rejected' && '✕ Rejected'}
                                          {docStatus === 'Expired' && '⚠️ Expired'}
                                          {docStatus === 'Uploaded' && 'Uploaded'}
                                          {docStatus === 'Missing' && 'Missing'}
                                          {docStatus === 'Not Required' && 'Not Required'}
                                        </span>
                                      </div>

                                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                        {doc.extra}
                                        {doc.expiryDate && (
                                          <div style={{ color: doc.isExpired ? '#EF4444' : 'var(--color-text-muted)' }}>
                                            Exp: {doc.expiryDate}
                                          </div>
                                        )}
                                      </div>

                                      {/* Preview box */}
                                      <div
                                        style={{
                                          height: '75px',
                                          borderRadius: '6px',
                                          overflow: 'hidden',
                                          backgroundColor: 'rgba(0,0,0,0.3)',
                                          position: 'relative',
                                          cursor: doc.url ? 'pointer' : 'default',
                                          border: '1px solid rgba(255,255,255,0.06)'
                                        }}
                                        onClick={() => {
                                          if (doc.url) handlePreviewDoc(`${app.restaurantName} - ${doc.title}`, doc.url, 'partner-kyc-documents');
                                        }}
                                      >
                                        {isExempt ? (
                                          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', color: '#9CA3AF' }}>
                                            <ShieldCheck size={20} />
                                            <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px' }}>Exempted</span>
                                          </div>
                                        ) : doc.url ? (
                                          doc.url.startsWith('data:image/') || doc.url.startsWith('http') ? (
                                            <>
                                              <img src={doc.url} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                              <div
                                                style={{
                                                  position: 'absolute',
                                                  inset: 0,
                                                  backgroundColor: 'rgba(0,0,0,0.35)',
                                                  opacity: 0,
                                                  transition: 'opacity 0.2s',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  color: '#FFFFFF'
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                              >
                                                <Eye size={18} />
                                              </div>
                                            </>
                                          ) : (
                                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', gap: '4px' }}>
                                              <FileText size={22} />
                                              <span style={{ fontSize: '9px', fontWeight: 700 }}>Inspect Document</span>
                                            </div>
                                          )
                                        ) : (
                                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: '10px', fontWeight: 700 }}>
                                            Document Missing
                                          </div>
                                        )}
                                      </div>

                                      {/* Slot Document Controls */}
                                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                        {doc.url && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownloadDoc(doc.url, `${app.restaurantName}_${doc.key}.pdf`, 'partner-kyc-documents');
                                            }}
                                            title="Download Document"
                                            style={{
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              backgroundColor: 'var(--color-surface)',
                                              color: 'var(--color-text-main)',
                                              border: '1px solid var(--color-border)',
                                              fontSize: '10px',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                          >
                                            <Download size={11} />
                                          </button>
                                        )}
                                        {doc.url && !isExempt && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                await verifyRestaurantDocument(app.id, doc.key, 'verified');
                                              }}
                                              style={{
                                                flex: 1,
                                                padding: '4px',
                                                borderRadius: '4px',
                                                backgroundColor: doc.status === 'verified' ? 'var(--color-veg)' : 'rgba(46, 204, 113, 0.15)',
                                                color: doc.status === 'verified' ? '#FFFFFF' : 'var(--color-veg)',
                                                border: '1px solid rgba(46, 204, 113, 0.3)',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                              }}
                                            >
                                              ✓ Verify
                                            </button>
                                            <button
                                              type="button"
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                const reason = window.prompt(`Enter mandatory rejection reason for ${doc.title}:`);
                                                if (reason === null) return;
                                                if (!reason.trim()) {
                                                  alert('A rejection reason is mandatory to reject this document.');
                                                  return;
                                                }
                                                await verifyRestaurantDocument(app.id, doc.key, 'rejected', reason.trim());
                                              }}
                                              style={{
                                                flex: 1,
                                                padding: '4px',
                                                borderRadius: '4px',
                                                backgroundColor: doc.status === 'rejected' ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
                                                color: doc.status === 'rejected' ? '#FFFFFF' : '#EF4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                              }}
                                            >
                                              ✕ Reject
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Financial & Banking Information Strip */}
                            <div
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px dashed var(--color-border)',
                                padding: '12px 14px',
                                marginBottom: '14px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '10px',
                                fontSize: '11px'
                              }}
                            >
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>Legal Entity:</span>{' '}
                                <strong>{app.legalBusinessName || app.legalEntityName || app.restaurantName}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>Business Type:</span>{' '}
                                <strong>{app.businessType || 'Sole Proprietorship'}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>Masked PAN:</span>{' '}
                                <strong style={{ fontFamily: 'monospace' }}>{maskPan(app.panNumberMasked || app.panNumber) || 'N/A'}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>Settlement Bank:</span>{' '}
                                <strong>{app.bankName || app.bankDetails?.bankName || 'HDFC Bank'}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>Account No:</span>{' '}
                                <strong style={{ fontFamily: 'monospace' }}>{app.bankAccountNumberMasked || app.bankDetails?.accountNumber || '••••5821'}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>IFSC Code:</span>{' '}
                                <strong style={{ fontFamily: 'monospace' }}>{app.bankIfscCode || app.bankDetails?.ifscCode || 'HDFC0001234'}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--color-text-muted)' }}>Payout Schedule:</span>{' '}
                                <strong style={{ color: 'var(--color-veg)' }}>{app.payoutFrequency ? app.payoutFrequency.toUpperCase() : 'WEEKLY'}</strong>
                              </div>
                            </div>

                            {/* Approval Blocker Notice */}
                            {isApprovalBlocked && !isApproved && (
                              <div
                                style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#EF4444',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '10px 14px',
                                  marginBottom: '14px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <AlertTriangle size={16} />
                                <div>
                                  <span>Approval Blocked: </span>
                                  <span style={{ fontWeight: 600 }}>{blockerReasons.join(' • ')}</span>
                                </div>
                              </div>
                            )}

                            {/* Action Decision Controls */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => setInspectedRestaurantApp(app)}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--color-surface)',
                                  color: 'var(--color-text-main)',
                                  border: '1.5px solid var(--color-border)',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <Eye size={13} />
                                <span>Inspect Full Application</span>
                              </button>

                              {!isApproved && (
                                <button
                                  type="button"
                                  disabled={isApprovalBlocked}
                                  title={isApprovalBlocked ? `Approval blocked: ${blockerReasons.join(', ')}` : 'Approve application and activate restaurant'}
                                  onClick={async () => {
                                    if (isApprovalBlocked) return;
                                    const res = await approveRestaurantApplication(app.id);
                                    if (res.success) {
                                      setRestSuccessMsg(`Application for ${app.restaurantName} approved! Restaurant is now onboarded.`);
                                    } else {
                                      alert(res.error || 'Failed to approve restaurant application.');
                                    }
                                  }}
                                  style={{
                                    padding: '9px 18px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: isApprovalBlocked ? 'rgba(255,255,255,0.08)' : 'var(--color-veg)',
                                    color: isApprovalBlocked ? '#6B7280' : '#FFFFFF',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: isApprovalBlocked ? 'none' : 'var(--shadow-sm)',
                                    cursor: isApprovalBlocked ? 'not-allowed' : 'pointer',
                                    border: 'none',
                                    opacity: isApprovalBlocked ? 0.6 : 1
                                  }}
                                >
                                  <CheckCircle2 size={15} />
                                  <span>Approve Partner & Activate Store</span>
                                </button>
                              )}

                              {!isRejected && !isApproved && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setResubmitRestModalAppId(app.id);
                                      setResubmitRestReasonText('Uploaded regulatory documents are unclear or FSSAI validity could not be validated. Please re-upload clear certificates.');
                                    }}
                                    style={{
                                      padding: '8px 14px',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                      color: '#F59E0B',
                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <RotateCcw size={13} />
                                    <span>Request Resubmission</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectRestModalAppId(app.id);
                                      setRejectRestReasonText('Ineligible business licenses or invalid statutory registrations.');
                                    }}
                                    style={{
                                      padding: '8px 14px',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: 'rgba(231, 76, 60, 0.15)',
                                      color: '#E74C3C',
                                      border: '1px solid rgba(231, 76, 60, 0.4)',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                  >
                                    <span>Reject Application</span>
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-veg)', fontSize: '12px', fontWeight: 800 }}>
                                  <CheckCircle2 size={16} />
                                  <span>Restaurant Approved • Store Active on Platform</span>
                                </div>
                              )}

                              {isActionRequired && (
                                <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 700 }}>
                                  Resubmission Requested: {app.rejectionReason}
                                </div>
                              )}

                              {isRejected && (
                                <div style={{ color: '#E74C3C', fontSize: '12px', fontWeight: 700 }}>
                                  Rejection Reason: {app.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      )}

        {/* Tab 4: Coupons CMS */}
        {activeTab === 'coupons' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800 }}>
                  Active Promotional Discount Codes
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Discounts automatically applied during customer checkout
                </p>
              </div>

              <button
                onClick={() => setIsCreateCouponOpen(true)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Plus size={15} />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {coupons.map((c) => (
                <div
                  key={c.code}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-muted)',
                    border: '1.5px dashed var(--color-primary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {c.code}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: 'var(--color-veg-bg)', color: 'var(--color-veg)', padding: '2px 6px', borderRadius: '4px' }}>
                      ACTIVE
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '4px', fontWeight: 600 }}>
                    {c.title} • {c.description}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    Min order: ₹{c.minOrderValue} • Max discount: ₹{c.maxDiscount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Rider Fleet Operations & KYC Onboarding Verification */}
        {activeTab === 'riders' && (
          <div>
            {/* KYC Approval Success Banner */}
            {kycSuccessMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(46, 204, 113, 0.15)',
                  border: '1px solid var(--color-veg)',
                  color: 'var(--color-veg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>{kycSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setKycSuccessMsg(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-veg)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Rider Onboarding KYC Verification Queue */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 75, 58, 0.15)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                      Rider Onboarding KYC Approvals ({allRiderApplications.length})
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Inspect personal KYC, 6 verification documents (Aadhaar, PAN, DL), and bank details to approve driver accounts.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(243, 156, 18, 0.15)',
                      color: '#F39C12',
                      fontWeight: 800,
                      border: '1px solid rgba(243, 156, 18, 0.3)'
                    }}
                  >
                    ⏳ {allRiderApplications.filter((a) => a.status === 'under_review').length} Pending Verification
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(46, 204, 113, 0.15)',
                      color: 'var(--color-veg)',
                      fontWeight: 800
                    }}
                  >
                    ✓ {allRiderApplications.filter((a) => a.status === 'approved').length} Active Fleet
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(46, 204, 113, 0.12)',
                      border: '1px solid rgba(46, 204, 113, 0.3)',
                      color: 'var(--color-veg)',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-veg)',
                        boxShadow: '0 0 6px var(--color-veg)'
                      }}
                    />
                    <span>Realtime Active</span>
                  </div>

                  <button
                    onClick={async () => {
                      setIsRefreshingApps(true);
                      await refreshAllApplications();
                      setTimeout(() => setIsRefreshingApps(false), 500);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={12} className={isRefreshingApps ? 'animate-spin' : ''} />
                    <span>Sync Applications</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { id: 'all', label: `All (${allRiderApplications.length})` },
                  {
                    id: 'under_review',
                    label: `Pending (${allRiderApplications.filter((a) => a.status === 'under_review' || a.status === 'submitted' || a.status === 'in_review').length})`
                  },
                  {
                    id: 'action_required',
                    label: `Action Required (${allRiderApplications.filter((a) => a.status === 'action_required').length})`
                  },
                  {
                    id: 'approved',
                    label: `Approved (${allRiderApplications.filter((a) => a.status === 'approved').length})`
                  },
                  {
                    id: 'rejected',
                    label: `Rejected (${allRiderApplications.filter((a) => a.status === 'rejected').length})`
                  }
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => setRiderFilter(flt.id as any)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      border: riderFilter === flt.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: riderFilter === flt.id ? 'rgba(255, 75, 58, 0.15)' : 'var(--color-surface)',
                      color: riderFilter === flt.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              {/* Applications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {allRiderApplications.filter((app) => {
                  if (riderFilter === 'all') return true;
                  if (riderFilter === 'under_review') return app.status === 'under_review' || app.status === 'submitted' || app.status === 'in_review';
                  return app.status === riderFilter;
                }).map((app) => {
                  const isPending = app.status === 'under_review' || app.status === 'submitted' || app.status === 'in_review';
                  const isActionRequired = app.status === 'action_required';
                  const isApproved = app.status === 'approved';
                  const isRejected = app.status === 'rejected';

                  return (
                    <div
                      key={app.id}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        border: isPending
                          ? '2px solid rgba(243, 156, 18, 0.5)'
                          : '1px solid var(--color-border)',
                        backgroundColor: isPending ? 'rgba(243, 156, 18, 0.03)' : 'var(--color-surface-muted)',
                        padding: '18px',
                        boxShadow: isPending ? '0 0 12px rgba(243, 156, 18, 0.15)' : 'none'
                      }}
                    >
                      {/* Top Bar: Applicant Info & Status */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '12px',
                          borderBottom: '1px solid var(--color-border)',
                          paddingBottom: '14px',
                          marginBottom: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '2px solid var(--color-primary)',
                              flexShrink: 0
                            }}
                          >
                            <img
                              src={app.profilePhoto}
                              alt={app.fullName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{app.fullName}</h4>
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontFamily: 'monospace',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255,255,255,0.08)',
                                  color: 'var(--color-text-muted)'
                                }}
                              >
                                {app.id}
                              </span>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '10px',
                                fontSize: '11px',
                                color: 'var(--color-text-muted)',
                                marginTop: '4px'
                              }}
                            >
                              <span>📞 {app.phone}</span>
                              {app.email && <span>✉️ {app.email}</span>}
                              <span>🏙️ <strong>{app.city || 'Bengaluru'}</strong>{app.district ? `, ${app.district}` : ''}{app.state ? ` (${app.state})` : ''}{app.pincode ? ` - ${app.pincode}` : ''}</span>
                              <span>
                                {app.vehicleType === 'Bicycle' ? '🚲 Bicycle' : `🛵 Bike (${app.vehicleNumber || 'KA 03 EN 4592'})`}
                              </span>
                              <span>🩸 Blood: <strong>{app.bloodGroup}</strong></span>
                              <span>⚧ Gender: {app.gender}</span>
                              <span>🎂 DOB: {app.dob}</span>
                              {app.emergencyContactPhone && (
                                <span>🚨 Emergency: {app.emergencyContactName} ({app.emergencyContactPhone})</span>
                              )}
                            </div>

                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                              📍 <em>{app.residentialAddress}</em> • Submitted: {app.submittedAt}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isPending
                                ? 'rgba(243, 156, 18, 0.2)'
                                : isApproved
                                ? 'var(--color-veg-bg)'
                                : 'rgba(231, 76, 60, 0.15)',
                              color: isPending ? '#F39C12' : isApproved ? 'var(--color-veg)' : '#E74C3C',
                              border: `1px solid ${
                                isPending
                                  ? 'rgba(243, 156, 18, 0.4)'
                                  : isApproved
                                  ? 'rgba(46, 204, 113, 0.4)'
                                  : 'rgba(231, 76, 60, 0.4)'
                              }`
                            }}
                          >
                            {isPending
                              ? '⏳ PENDING KYC VERIFICATION'
                              : isApproved
                              ? '✓ APPROVED & ACTIVE ON FLEET'
                              : '✕ APPLICATION REJECTED'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: 8 Documents Preview Grid */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} color="var(--color-primary)" />
                            <span>Submitted Verification Documents (8 Document Slots)</span>
                          </div>
                          {app.vehicleType === 'Bicycle' && (
                            <span style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700, backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                              🚲 Bicycle Partner (DL & RC Exempt)
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                            gap: '10px'
                          }}
                        >
                          {[
                            { title: 'Aadhaar Front', url: app.documents?.aadhaarFront },
                            { title: 'Aadhaar Back', url: app.documents?.aadhaarBack },
                            { title: 'PAN Front', url: app.documents?.panFront },
                            { title: 'PAN Back', url: app.documents?.panBack },
                            { title: 'DL Front', url: app.documents?.drivingLicenseFront, isExempt: app.vehicleType === 'Bicycle' },
                            { title: 'DL Back', url: app.documents?.drivingLicenseBack, isExempt: app.vehicleType === 'Bicycle' },
                            { title: 'Vehicle RC', url: app.documents?.vehicleRc, isExempt: app.vehicleType === 'Bicycle' },
                            { title: 'Bank Proof / Cheque', url: app.documents?.bankProof }
                          ].map((doc, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}
                            >
                              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                {doc.title}
                              </div>
                              <div
                                style={{
                                  height: '80px',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                  backgroundColor: 'rgba(0,0,0,0.2)',
                                  position: 'relative',
                                  cursor: doc.url ? 'pointer' : 'default'
                                }}
                                onClick={() => {
                                  if (doc.url) handlePreviewDoc(`${app.fullName} - ${doc.title}`, doc.url, 'rider-kyc-documents');
                                }}
                              >
                                {doc.isExempt ? (
                                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(46, 204, 113, 0.08)', padding: '4px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '18px' }}>🚲</span>
                                    <span style={{ fontSize: '9px', color: 'var(--color-veg)', fontWeight: 700, marginTop: '2px' }}>Exempted</span>
                                  </div>
                                ) : doc.url ? (
                                  <>
                                    <img src={doc.url} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div
                                      style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF'
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                    >
                                      <Eye size={18} />
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C', fontSize: '10px' }}>
                                    Missing
                                  </div>
                                )}
                              </div>
                              <span style={{ fontSize: '9px', color: doc.isExempt ? '#9CA3AF' : 'var(--color-veg)', fontWeight: 700, textAlign: 'center' }}>
                                {doc.isExempt ? 'Not Required' : '✓ Uploaded'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial & Banking Information Box */}
                      <div
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px dashed var(--color-border)',
                          padding: '12px 14px',
                          marginBottom: '16px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '10px',
                          fontSize: '11px'
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Account Holder:</span>{' '}
                          <strong>{app.bankDetails.accountHolderName}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Bank & Branch:</span>{' '}
                          <strong>{app.bankDetails.bankName}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Account No:</span>{' '}
                          <strong style={{ fontFamily: 'monospace' }}>{app.bankDetails.accountNumber}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>IFSC Code:</span>{' '}
                          <strong style={{ fontFamily: 'monospace' }}>{app.bankDetails.ifscCode}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)' }}>Daily Payout UPI:</span>{' '}
                          <strong style={{ color: 'var(--color-veg)' }}>{app.bankDetails.upiId}</strong>
                        </div>
                      </div>

                      {/* Action Decision Controls */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Inspect full details & KYC documents */}
                        <button
                          onClick={() => setInspectedRiderApp(app)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            border: '1px solid var(--color-border)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Eye size={13} />
                          <span>Inspect Application</span>
                        </button>

                        {(isPending || isActionRequired) && (
                          <>
                            <button
                              onClick={() => {
                                setResubmitModalAppId(app.id);
                                setResubmitReasonText('Document photos are unclear or license expired. Please re-upload clear photos.');
                              }}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#F59E0B',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <RotateCcw size={13} />
                              <span>Request Resubmission</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectModalAppId(app.id);
                                setRejectReasonText('Ineligible vehicle or duplicate registration profile.');
                              }}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(231, 76, 60, 0.15)',
                                color: '#E74C3C',
                                border: '1px solid rgba(231, 76, 60, 0.4)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Reject Application
                            </button>

                            <button
                              onClick={() => {
                                approveRiderKyc(app.id);
                                setKycSuccessMsg(`Approved ${app.fullName}! Rider terminal is activated and ready.`);
                                setTimeout(() => setKycSuccessMsg(null), 5000);
                              }}
                              style={{
                                padding: '9px 18px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-veg)',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: 'var(--shadow-sm)',
                                cursor: 'pointer'
                              }}
                            >
                              <CheckCircle2 size={15} />
                              <span>Approve & Activate Profile</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-veg)', fontSize: '12px', fontWeight: 800 }}>
                            <CheckCircle2 size={16} />
                            <span>Fleet Approved • Profile Activated</span>
                          </div>
                        )}

                        {isActionRequired && (
                          <div style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 700 }}>
                            Resubmission Requested: {app.rejectionReason || app.resubmissionNote}
                          </div>
                        )}

                        {isRejected && (
                          <div style={{ color: '#E74C3C', fontSize: '12px', fontWeight: 700 }}>
                            Rejection Reason: {app.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIDER TIER SYSTEM & COMPLIANCE OPERATIONS */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                      Delivery Rider Tier & Compliance Engine
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Manage Bronze, Silver & Gold performance tiers, duty selfie audit logs, and tier payout incentives.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(205, 127, 50, 0.15)',
                      color: '#E09A55',
                      fontWeight: 800,
                      border: '1px solid rgba(205, 127, 50, 0.3)'
                    }}
                  >
                    🥉 Bronze: 1 Active
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(192, 192, 192, 0.15)',
                      color: '#E5E7EB',
                      fontWeight: 800,
                      border: '1px solid rgba(192, 192, 192, 0.3)'
                    }}
                  >
                    🥈 Silver: 2 Active
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#FBBF24',
                      fontWeight: 800,
                      border: '1px solid rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    🥇 Gold: 2 Active
                  </span>
                </div>
              </div>

              {/* 3 Tier Configuration Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                {/* Bronze Card */}
                <div style={{ backgroundColor: 'rgba(205, 127, 50, 0.06)', borderRadius: '12px', border: '1px solid rgba(205, 127, 50, 0.25)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>🥉</span>
                      <strong style={{ fontSize: '14px', color: '#E09A55' }}>BRONZE TIER</strong>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(205, 127, 50, 0.2)', color: '#E09A55' }}>
                      Default Entry
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Criteria: <strong>0h • 0 orders • Default</strong></div>
                    <div>Payout: <strong>₹40 Base + ₹12/km + ₹10 Surge (1.00x)</strong></div>
                    <div>Tier Incentive: <strong>₹0 / order</strong></div>
                    <div>Selfie Policy: <strong>Random every 1-2h / order-linked</strong></div>
                  </div>
                </div>

                {/* Silver Card */}
                <div style={{ backgroundColor: 'rgba(192, 192, 192, 0.06)', borderRadius: '12px', border: '1px solid rgba(192, 192, 192, 0.25)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>🥈</span>
                      <strong style={{ fontSize: '14px', color: '#E5E7EB' }}>SILVER TIER</strong>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(192, 192, 192, 0.2)', color: '#E5E7EB' }}>
                      +1.05x Multiplier
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Criteria: <strong>50h • 100 orders • 4.6★ Rating</strong></div>
                    <div>Payout: <strong>₹45 Base + ₹14/km + ₹15 Surge (1.05x)</strong></div>
                    <div>Tier Incentive: <strong>+₹15 / order</strong></div>
                    <div>Selfie Policy: <strong>Periodic every 4 hours</strong></div>
                  </div>
                </div>

                {/* Gold Card */}
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>🥇</span>
                      <strong style={{ fontSize: '14px', color: '#FBBF24' }}>GOLD TIER</strong>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24' }}>
                      +1.10x Multiplier
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Criteria: <strong>150h • 300 orders • 4.8★ Rating</strong></div>
                    <div>Payout: <strong>₹55 Base + ₹16/km + ₹20 Surge (1.10x)</strong></div>
                    <div>Tier Incentive: <strong>+₹30 / order</strong></div>
                    <div>Selfie Policy: <strong>Duty start & end mandatory</strong></div>
                  </div>
                </div>
              </div>

              {/* Duty Selfie Verification Audit Log */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={15} color="var(--color-primary)" />
                    <strong style={{ fontSize: '13px' }}>Duty Selfie Compliance Audit Log ({selfieVerifications.length})</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    Automatic 10-minute grace period enforcement
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selfieVerifications.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#000000',
                            flexShrink: 0,
                            cursor: log.selfieUrl ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (log.selfieUrl) handlePreviewDoc('Rider Duty Selfie', log.selfieUrl, 'rider-kyc-documents');
                          }}
                        >
                          {log.selfieUrl ? (
                            <img src={log.selfieUrl} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                              <Camera size={14} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#FFFFFF' }}>Rider: Vikram Singh (Approved)</strong>
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                textTransform: 'uppercase',
                                color: '#9CA3AF'
                              }}
                            >
                              {(log.triggerReason || log.verificationType || 'duty_start').replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '2px' }}>
                            Prompted: {new Date(log.triggeredAt || log.promptedAt || Date.now()).toLocaleTimeString()} • Verified: {log.verifiedAt ? new Date(log.verifiedAt).toLocaleTimeString() : 'Pending'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              log.status === 'verified'
                                ? 'rgba(46, 204, 113, 0.15)'
                                : log.status === 'missed'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(243, 156, 18, 0.15)',
                            color:
                              log.status === 'verified'
                                ? 'var(--color-veg)'
                                : log.status === 'missed'
                                ? '#EF4444'
                                : '#F39C12',
                            textTransform: 'uppercase'
                          }}
                        >
                          {log.status === 'verified' ? '✓ Verified' : log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Delivery Rider Fleet Live Ops</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Active shifts, battery levels, live order assignments, and driver ratings in Bengaluru Central.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(46, 204, 113, 0.15)', color: 'var(--color-veg)', fontWeight: 800 }}>
                  ● 3 Delivering
                </span>
                <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(243, 156, 18, 0.15)', color: '#F39C12', fontWeight: 800 }}>
                  ● 1 Idle / Available
                </span>
                <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(127, 140, 141, 0.15)', color: '#95A5A6', fontWeight: 800 }}>
                  ● 1 On Break
                </span>
              </div>
            </div>

            {/* Riders Table */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflowX: 'auto',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ minWidth: '720px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 1fr',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-surface-muted)',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase'
                  }}
                >
                  <div>Rider Details</div>
                <div>Vehicle & Hub</div>
                <div>Status</div>
                <div>Trips Today</div>
                <div>Rating</div>
                <div style={{ textAlign: 'right' }}>Battery / Quick Call</div>
              </div>

              {[
                {
                  id: 'RDR-101',
                  name: 'Vikram Singh',
                  phone: '+91 98451 92831',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'KA 03 EN 4592 (Honda Shine)',
                  hub: 'Indiranagar Hub',
                  status: 'Delivering',
                  activeOrder: 'TOM-8921',
                  trips: 14,
                  rating: 4.9,
                  battery: 88
                },
                {
                  id: 'RDR-102',
                  name: 'Rajesh Kumar',
                  phone: '+91 97412 83921',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'KA 05 MN 1289 (Bajaj Pulsar)',
                  hub: 'Koramangala 5th Block',
                  status: 'Idle / Available',
                  activeOrder: null,
                  trips: 11,
                  rating: 4.8,
                  battery: 74
                },
                {
                  id: 'RDR-103',
                  name: 'Amit Gowda',
                  phone: '+91 99001 23412',
                  avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'KA 01 TR 7721 (TVS Apache)',
                  hub: 'MG Road Metro',
                  status: 'Delivering',
                  activeOrder: 'TOM-8845',
                  trips: 18,
                  rating: 4.95,
                  battery: 62
                },
                {
                  id: 'RDR-104',
                  name: 'Mohammed Faiz',
                  phone: '+91 98862 34151',
                  avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'KA 04 EL 9081 (Ather 450X EV)',
                  hub: 'Domlur Flyover',
                  status: 'On Break',
                  activeOrder: null,
                  trips: 9,
                  rating: 4.7,
                  battery: 45
                },
                {
                  id: 'RDR-105',
                  name: 'Suresh Reddy',
                  phone: '+91 96112 45892',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'KA 51 JJ 3341 (Hero Splendor)',
                  hub: 'HSR Layout Sector 2',
                  status: 'Delivering',
                  activeOrder: 'TOM-8712',
                  trips: 16,
                  rating: 4.85,
                  battery: 91
                }
              ].map((rider) => (
                <div
                  key={rider.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 1fr',
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    alignItems: 'center',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{rider.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{rider.phone}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{rider.vehicle}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{rider.hub}</div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          rider.status === 'Delivering'
                            ? 'rgba(46, 204, 113, 0.15)'
                            : rider.status === 'Idle / Available'
                            ? 'rgba(243, 156, 18, 0.15)'
                            : 'rgba(127, 140, 141, 0.15)',
                        color:
                          rider.status === 'Delivering'
                            ? 'var(--color-veg)'
                            : rider.status === 'Idle / Available'
                            ? '#F39C12'
                            : '#95A5A6'
                      }}
                    >
                      {rider.status}
                    </span>
                    {rider.activeOrder && (
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                        Order #{rider.activeOrder}
                      </div>
                    )}
                  </div>

                  <div style={{ fontWeight: 700 }}>{rider.trips} orders</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#D35400' }}>
                    <span>{rider.rating}</span>
                    <span style={{ fontSize: '10px' }}>★</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: rider.battery > 50 ? 'var(--color-veg)' : '#E74C3C' }}>
                      🔋 {rider.battery}%
                    </span>
                    <a
                      href={`tel:${rider.phone}`}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-main)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Call Delivery Partner"
                    >
                      <PhoneCall size={13} />
                    </a>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Customer Accounts Directory */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Customer Directory & Wallets</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  User profiles, loyalty membership tiers, lifetime GMV spent, and Tomattto Cash balances.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 75, 58, 0.1)', color: 'var(--color-primary)', fontWeight: 800 }}>
                  VIP Gold Users: 1,240
                </span>
              </div>
            </div>

            {/* Customers Table */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflowX: 'auto',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ minWidth: '720px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.2fr 1fr',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-surface-muted)',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase'
                  }}
                >
                  <div>Customer Name & Contact</div>
                <div>Membership Tier</div>
                <div>Total Orders</div>
                <div>Lifetime GMV</div>
                <div>Tomattto Cash Wallet</div>
                <div style={{ textAlign: 'right' }}>Status</div>
              </div>

              {[
                {
                  id: 'CUST-001',
                  name: 'Rahul Sharma (Current User)',
                  email: 'rahul.sharma@example.com',
                  phone: '+91 98765 43210',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
                  tier: 'Tomattto Gold VIP',
                  tierColor: '#F39C12',
                  ordersCount: 28,
                  lifetimeGmv: 14290,
                  walletAmount: walletBalance, // live synced from context
                  status: 'Active'
                },
                {
                  id: 'CUST-002',
                  name: 'Ananya Sen',
                  email: 'ananya.sen@example.com',
                  phone: '+91 98112 34567',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
                  tier: 'Tomattto Gold VIP',
                  tierColor: '#F39C12',
                  ordersCount: 42,
                  lifetimeGmv: 21850,
                  walletAmount: 420,
                  status: 'Active'
                },
                {
                  id: 'CUST-003',
                  name: 'Rohan Mehta',
                  email: 'rohan.m@gmail.com',
                  phone: '+91 99201 88291',
                  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
                  tier: 'Standard Member',
                  tierColor: '#7F8C8D',
                  ordersCount: 8,
                  lifetimeGmv: 3450,
                  walletAmount: 50,
                  status: 'Active'
                },
                {
                  id: 'CUST-004',
                  name: 'Sneha Iyer',
                  email: 'sneha.iyer@outlook.com',
                  phone: '+91 98450 11234',
                  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
                  tier: 'Tomattto Gold VIP',
                  tierColor: '#F39C12',
                  ordersCount: 35,
                  lifetimeGmv: 19100,
                  walletAmount: 290,
                  status: 'Active'
                },
                {
                  id: 'CUST-005',
                  name: 'Vikram Patel',
                  email: 'vikram.p@yahoo.com',
                  phone: '+91 97123 44556',
                  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
                  tier: 'Standard Member',
                  tierColor: '#7F8C8D',
                  ordersCount: 12,
                  lifetimeGmv: 5600,
                  walletAmount: 120,
                  status: 'Active'
                }
              ].map((cust) => (
                <div
                  key={cust.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1.2fr 1fr',
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    alignItems: 'center',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={cust.avatar}
                      alt={cust.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{cust.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{cust.email} • {cust.phone}</div>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: `${cust.tierColor}20`,
                        color: cust.tierColor
                      }}
                    >
                      {cust.tier}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700 }}>{cust.ordersCount} orders</div>

                  <div style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>
                    ₹{cust.lifetimeGmv.toLocaleString('en-IN')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--color-veg)' }}>
                    <Wallet size={14} />
                    <span>₹{cust.walletAmount}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(46, 204, 113, 0.15)',
                        color: 'var(--color-veg)'
                      }}
                    >
                      {cust.status}
                    </span>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Support Tickets & Instant Refunds */}
        {activeTab === 'tickets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Support Complaint Tickets & Instant Refunds</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Approve 1-click instant wallet compensation for cold food, missing items, or delivery delays.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(231, 76, 60, 0.15)', color: '#E74C3C', fontWeight: 800 }}>
                  {tickets.filter((t) => t.status === 'Open').length} Open Tickets
                </span>
                <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(46, 204, 113, 0.15)', color: 'var(--color-veg)', fontWeight: 800 }}>
                  {tickets.filter((t) => t.status === 'Resolved').length} Resolved
                </span>
              </div>
            </div>

            {/* Tickets Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        #{t.id}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-surface-muted)',
                          color: 'var(--color-text-muted)'
                        }}
                      >
                        Order #{t.orderId}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            t.status === 'Open' ? 'rgba(231, 76, 60, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                          color: t.status === 'Open' ? '#E74C3C' : 'var(--color-veg)'
                        }}
                      >
                        {t.status === 'Open' ? '⚠️ OPEN' : '✓ RESOLVED'}
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t.time}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '16px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-main)' }}>
                        {t.customerName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t.customerPhone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                        From: {t.restaurantName}
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          backgroundColor: 'rgba(255, 75, 58, 0.1)',
                          color: 'var(--color-primary)',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {t.category}
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '4px', lineHeight: 1.4 }}>
                        "{t.issue}"
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Claim Amount:{' '}
                        <b style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>₹{t.claimAmount}</b>
                      </span>

                      {t.status === 'Open' ? (
                        <button
                          onClick={() => handleApproveRefund(t)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-veg)',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <Check size={14} />
                          <span>Approve Refund to Wallet (₹{t.claimAmount})</span>
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: 'var(--color-veg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Refund Credited to Wallet</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateCouponOpen}
        onClose={() => setIsCreateCouponOpen(false)}
      />

      {/* Restaurant Commission, Profile & Menu Management Modal */}
      <RestaurantManageModal
        restaurant={restaurants.find((r) => r.id === selectedManageRestaurant?.id) || selectedManageRestaurant}
        onClose={() => setSelectedManageRestaurant(null)}
        onUpdateCommission={updateRestaurantCommission}
        onToggleStatus={toggleRestaurantStatus}
      />

      {/* Live Operations City Map Modal */}
      <LiveOperationsMapModal
        isOpen={isLiveMapOpen}
        onClose={() => setIsLiveMapOpen(false)}
      />

      {/* KYC Document Zoom / Inspection Modal */}
      {selectedDocPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedDocPreview(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '680px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#17171C'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--color-primary)" />
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedDocPreview.title}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', backgroundColor: '#0D0D11' }}>
              {selectedDocPreview.url.toLowerCase().includes('.pdf') || selectedDocPreview.title.toLowerCase().includes('pdf') ? (
                <iframe
                  src={selectedDocPreview.url}
                  title={selectedDocPreview.title}
                  style={{
                    width: '100%',
                    height: '70vh',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              ) : (
                <img
                  src={selectedDocPreview.url}
                  alt={selectedDocPreview.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}
                />
              )}
            </div>

            <div
              style={{
                padding: '12px 18px',
                backgroundColor: '#17171C',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700 }}>
                ✓ High Resolution OCR Scanned Document
              </span>
              <button
                onClick={() => setSelectedDocPreview(null)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmission Request Modal */}
      {resubmitModalAppId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setResubmitModalAppId(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F59E0B', marginBottom: '12px' }}>
              <RotateCcw size={20} />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Request Document Resubmission
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '14px', lineHeight: 1.5 }}>
              Specify the exact documents that require re-upload or correction by the applicant.
            </p>
            <textarea
              rows={3}
              value={resubmitReasonText}
              onChange={(e) => setResubmitReasonText(e.target.value)}
              placeholder="e.g. Driving Licence front photo is blurry. Please upload a clear photo."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                marginBottom: '18px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setResubmitModalAppId(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resubmitReasonText.trim()}
                onClick={() => {
                  if (resubmitModalAppId && resubmitReasonText.trim()) {
                    requestResubmissionRiderKyc(resubmitModalAppId, resubmitReasonText.trim());
                    setResubmitModalAppId(null);
                    setResubmitReasonText('');
                  }
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#F59E0B',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Send Resubmission Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalAppId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setRejectModalAppId(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '12px' }}>
              <ShieldAlert size={20} />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Reject Rider Application
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '14px', lineHeight: 1.5 }}>
              Enter the mandatory rejection explanation. This will be visible to the applicant.
            </p>
            <textarea
              rows={3}
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              placeholder="e.g. Duplicate application or failed background criteria."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                marginBottom: '18px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectModalAppId(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReasonText.trim()}
                onClick={() => {
                  if (rejectModalAppId && rejectReasonText.trim()) {
                    rejectRiderKyc(rejectModalAppId, rejectReasonText.trim());
                    setRejectModalAppId(null);
                    setRejectReasonText('');
                  }
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspected Rider Application Modal */}
      {inspectedRiderApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setInspectedRiderApp(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#17171C'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={inspectedRiderApp.profilePhoto}
                  alt={inspectedRiderApp.fullName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {inspectedRiderApp.fullName}
                  </h4>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    Ref: {inspectedRiderApp.applicationRef || inspectedRiderApp.id} • Status: {inspectedRiderApp.status}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectedRiderApp(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Personal & Operating Details */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Personal Information
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: '#9CA3AF' }}>Phone:</span> <strong>{inspectedRiderApp.phone}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Email:</span> <strong>{inspectedRiderApp.email || 'N/A'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>DOB:</span> <strong>{inspectedRiderApp.dob}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Gender:</span> <strong>{inspectedRiderApp.gender}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Blood Group:</span> <strong>{inspectedRiderApp.bloodGroup}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>City:</span> <strong>{inspectedRiderApp.city || 'Bengaluru'}</strong></div>
                  <div>
                    <span style={{ color: '#9CA3AF' }}>District / State:</span>{' '}
                    <strong>
                      {inspectedRiderApp.district || inspectedRiderApp.metadata?.district ? `${inspectedRiderApp.district || inspectedRiderApp.metadata?.district}, ` : ''}
                      {inspectedRiderApp.state || inspectedRiderApp.metadata?.state || 'N/A'}
                      {inspectedRiderApp.pincode || inspectedRiderApp.metadata?.pincode ? ` - ${inspectedRiderApp.pincode || inspectedRiderApp.metadata?.pincode}` : ''}
                    </strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#9CA3AF' }}>Address:</span> <strong>{inspectedRiderApp.residentialAddress}</strong>
                  </div>
                </div>
              </div>

              {/* Vehicle & Emergency Details */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Vehicle & Emergency Information
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: '#9CA3AF' }}>Vehicle Type:</span> <strong>{inspectedRiderApp.vehicleType || 'Motorcycle'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Model:</span> <strong>{inspectedRiderApp.vehicleModel || 'Standard'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Plate Number:</span> <strong>{inspectedRiderApp.vehicleNumber || 'N/A'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Driving Licence:</span> <strong>{inspectedRiderApp.drivingLicenseNumber || 'N/A'}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#9CA3AF' }}>Emergency Contact:</span> <strong>{inspectedRiderApp.emergencyContactPhone || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* KYC Documents Previews with Individual Verification Controls */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Uploaded Verification Documents (Aadhaar & PAN Front/Back Mandatory)
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {[
                    { key: 'aadhaarFront', label: 'Aadhaar Card Front *', url: inspectedRiderApp.documents?.aadhaarFront, isRequired: true },
                    { key: 'aadhaarBack', label: 'Aadhaar Card Back *', url: inspectedRiderApp.documents?.aadhaarBack, isRequired: true },
                    { key: 'panFront', label: 'Personal PAN Front *', url: inspectedRiderApp.documents?.panFront, isRequired: true },
                    { key: 'panBack', label: 'Personal PAN Back *', url: inspectedRiderApp.documents?.panBack, isRequired: true },
                    { key: 'drivingLicenseFront', label: 'Driving Licence Front *', url: inspectedRiderApp.documents?.drivingLicenseFront, isRequired: inspectedRiderApp.vehicleType !== 'Bicycle' },
                    { key: 'vehicleRc', label: 'Vehicle RC *', url: inspectedRiderApp.documents?.vehicleRc, isRequired: inspectedRiderApp.vehicleType !== 'Bicycle' },
                    { key: 'bankProof', label: 'Bank Settlement Proof *', url: inspectedRiderApp.documents?.bankProof, isRequired: true },
                    { key: 'qualificationProof', label: 'Qualification Proof', url: inspectedRiderApp.documents?.qualificationProof, isRequired: false }
                  ].map((doc) => {
                    const status = inspectedRiderApp.documentStatuses?.[doc.key] || (doc.url ? 'uploaded' : 'missing');
                    return (
                      <div
                        key={doc.key}
                        style={{
                          borderRadius: '8px',
                          border: `1px solid ${status === 'verified' ? 'rgba(46, 204, 113, 0.4)' : status === 'rejected' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                          backgroundColor: '#101014',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#D1D5DB' }}>{doc.label}</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: status === 'verified' ? 'rgba(46, 204, 113, 0.2)' : status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)',
                              color: status === 'verified' ? 'var(--color-veg)' : status === 'rejected' ? '#EF4444' : '#9CA3AF'
                            }}
                          >
                            {status === 'verified' ? '✓ Verified' : status === 'rejected' ? '✕ Rejected' : doc.url ? 'Uploaded' : 'Missing'}
                          </span>
                        </div>

                        <div
                          onClick={() => {
                            if (doc.url) handlePreviewDoc(doc.label, doc.url, 'rider-kyc-documents');
                          }}
                          style={{
                            height: '70px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            position: 'relative',
                            cursor: doc.url ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {doc.url ? (
                            doc.url.startsWith('data:image/') || doc.url.startsWith('http') ? (
                              <img src={doc.url} alt={doc.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#60A5FA', gap: '2px' }}>
                                <FileText size={20} />
                                <span style={{ fontSize: '9px' }}>Preview</span>
                              </div>
                            )
                          ) : (
                            <div style={{ color: '#EF4444', fontSize: '10px' }}>Not attached</div>
                          )}
                        </div>

                        {doc.url && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={async () => {
                                await verifyRiderDocument(inspectedRiderApp.id, doc.key as any, 'verified');
                                setInspectedRiderApp((prev: any) => ({
                                  ...prev,
                                  documentStatuses: { ...(prev?.documentStatuses || {}), [doc.key]: 'verified' }
                                }));
                              }}
                              style={{
                                flex: 1,
                                padding: '3px',
                                borderRadius: '4px',
                                backgroundColor: status === 'verified' ? 'var(--color-veg)' : 'rgba(46, 204, 113, 0.15)',
                                color: status === 'verified' ? '#FFFFFF' : 'var(--color-veg)',
                                border: '1px solid rgba(46, 204, 113, 0.3)',
                                fontSize: '9px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Verify
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const reason = window.prompt(`Enter mandatory rejection reason for ${doc.label}:`);
                                if (reason === null) return;
                                if (!reason.trim()) { alert('Rejection reason is mandatory.'); return; }
                                await verifyRiderDocument(inspectedRiderApp.id, doc.key as any, 'rejected', reason.trim());
                                setInspectedRiderApp((prev: any) => ({
                                  ...prev,
                                  documentStatuses: { ...(prev?.documentStatuses || {}), [doc.key]: 'rejected' }
                                }));
                              }}
                              style={{
                                flex: 1,
                                padding: '3px',
                                borderRadius: '4px',
                                backgroundColor: status === 'rejected' ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
                                color: status === 'rejected' ? '#FFFFFF' : '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '9px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Educational Qualification Verification Section */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={16} color="var(--color-primary)" />
                    <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                      Educational Qualification Verification
                    </h5>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor:
                        inspectedRiderApp.education?.qualificationStatus === 'verified'
                          ? 'rgba(46, 204, 113, 0.2)'
                          : inspectedRiderApp.education?.qualificationStatus === 'rejected'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(59, 130, 246, 0.2)',
                      color:
                        inspectedRiderApp.education?.qualificationStatus === 'verified'
                          ? 'var(--color-veg)'
                          : inspectedRiderApp.education?.qualificationStatus === 'rejected'
                          ? '#EF4444'
                          : '#60A5FA',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}
                  >
                    {inspectedRiderApp.education?.qualificationStatus
                      ? inspectedRiderApp.education.qualificationStatus.toUpperCase()
                      : 'PENDING'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Highest Qualification:</span>{' '}
                    <strong>{inspectedRiderApp.education?.highestQualification || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Degree / Field:</span>{' '}
                    <strong>{inspectedRiderApp.education?.qualificationName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Institution / Board:</span>{' '}
                    <strong>{inspectedRiderApp.education?.institutionName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Year of Completion:</span>{' '}
                    <strong>{inspectedRiderApp.education?.completionYear || 'N/A'}</strong>
                  </div>
                  {inspectedRiderApp.education?.additionalQualification && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#9CA3AF' }}>Additional Certifications:</span>{' '}
                      <strong>{inspectedRiderApp.education.additionalQualification}</strong>
                    </div>
                  )}
                  {inspectedRiderApp.education?.qualificationRejectionReason && (
                    <div style={{ gridColumn: 'span 2', color: '#FECACA', backgroundColor: 'rgba(239,68,68,0.1)', padding: '6px 8px', borderRadius: '4px', fontSize: '11px' }}>
                      <strong>Rejection Note:</strong> {inspectedRiderApp.education.qualificationRejectionReason}
                    </div>
                  )}
                </div>

                {/* Qualification Proof Preview & Review Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {inspectedRiderApp.documents?.qualificationProof ? (
                      <button
                        type="button"
                        onClick={() => handlePreviewDoc('Qualification Proof', inspectedRiderApp.documents.qualificationProof, 'rider-kyc-documents')}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#60A5FA',
                          border: '1px solid rgba(96, 165, 250, 0.3)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={12} />
                        <span>Preview Certificate</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#6B7280', fontStyle: 'italic' }}>
                        No physical document proof attached
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        await verifyRiderQualification(inspectedRiderApp.id, 'verified');
                        setInspectedRiderApp((prev: any) => ({
                          ...prev,
                          education: {
                            ...prev?.education,
                            qualificationStatus: 'verified',
                            qualificationRejectionReason: undefined
                          }
                        }));
                        setKycSuccessMsg(`Qualification verified for application #${inspectedRiderApp.applicationRef || inspectedRiderApp.id}`);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        color: 'var(--color-veg)',
                        border: '1px solid var(--color-veg)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Mark Verified
                    </button>
                    <button
                      type="button"
                      onClick={() => setQualRejectModalAppId(inspectedRiderApp.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reject Qualification
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setInspectedRiderApp(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspected Restaurant Application Modal */}
      {inspectedRestaurantApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setInspectedRestaurantApp(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                  {inspectedRestaurantApp.restaurantName}
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-primary)' }}>
                    Ref: {inspectedRestaurantApp.applicationRef || inspectedRestaurantApp.id}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>•</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    Type: {inspectedRestaurantApp.restaurantType || 'Dine-In & Delivery'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectedRestaurantApp(null)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Business & Location Info */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Outlet & Contact Details
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: '#9CA3AF' }}>Owner:</span> <strong>{inspectedRestaurantApp.ownerName}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Mobile:</span> <strong>{inspectedRestaurantApp.phone}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Email:</span> <strong>{inspectedRestaurantApp.email}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>City & State:</span> <strong>{inspectedRestaurantApp.city}, {inspectedRestaurantApp.state} - {inspectedRestaurantApp.pincode}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#9CA3AF' }}>Full Address:</span> <strong>{inspectedRestaurantApp.address} {inspectedRestaurantApp.landmark ? `(Near ${inspectedRestaurantApp.landmark})` : ''}</strong>
                  </div>
                  {inspectedRestaurantApp.cuisineTypes && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#9CA3AF' }}>Cuisines:</span> <strong>{inspectedRestaurantApp.cuisineTypes.join(', ')}</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Operating Hours:</span> <strong>{inspectedRestaurantApp.openingTime || '10:00'} - {inspectedRestaurantApp.closingTime || '23:00'}</strong>
                  </div>
                </div>
              </div>

              {/* Legal & Regulatory Info */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Legal & Regulatory Compliance
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: '#9CA3AF' }}>Legal Entity:</span> <strong>{inspectedRestaurantApp.legalBusinessName || inspectedRestaurantApp.restaurantName}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Entity Type:</span> <strong>{inspectedRestaurantApp.businessType || 'Sole Proprietorship'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>PAN Number:</span> <strong>{maskPan(inspectedRestaurantApp.panNumber)}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>GSTIN:</span> <strong>{inspectedRestaurantApp.gstin || 'Not GST Registered'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>FSSAI Registration:</span> <strong style={{ color: '#60A5FA' }}>{inspectedRestaurantApp.fssaiNumber || 'Pending'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>FSSAI Expiry:</span> <strong>{inspectedRestaurantApp.fssaiExpiryDate || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Settlement Bank Account Details */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Settlement Bank & Payout Information
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: '#9CA3AF' }}>Beneficiary:</span> <strong>{inspectedRestaurantApp.bankDetails?.accountHolderName || 'N/A'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Bank:</span> <strong>{inspectedRestaurantApp.bankDetails?.bankName || 'N/A'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Account Number:</span> <strong>{inspectedRestaurantApp.bankDetails?.accountNumber || 'N/A'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>IFSC Code:</span> <strong>{inspectedRestaurantApp.bankDetails?.ifscCode || 'N/A'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Account Type:</span> <strong>{inspectedRestaurantApp.bankDetails?.accountType || 'Current'}</strong></div>
                  <div><span style={{ color: '#9CA3AF' }}>Payout Frequency:</span> <strong>{inspectedRestaurantApp.payoutFrequency || 'Daily'}</strong></div>
                </div>
              </div>

              {/* Uploaded Verification Documents */}
              <div style={{ backgroundColor: '#17171C', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '10px' }}>
                  Uploaded Regulatory & Bank Documents
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                  {[
                    {
                      key: 'panDoc' as const,
                      label: 'Business PAN',
                      url: inspectedRestaurantApp.documents?.panDoc,
                      status: inspectedRestaurantApp.documentStatuses?.panDoc,
                      isRequired: true
                    },
                    {
                      key: 'fssaiDoc' as const,
                      label: 'FSSAI License',
                      url: inspectedRestaurantApp.documents?.fssaiDoc,
                      status: inspectedRestaurantApp.documentStatuses?.fssaiDoc,
                      expiryDate: inspectedRestaurantApp.fssaiExpiryDate,
                      isExpired: Boolean(inspectedRestaurantApp.fssaiExpiryDate && new Date(inspectedRestaurantApp.fssaiExpiryDate).getTime() < Date.now()),
                      isRequired: true
                    },
                    {
                      key: 'gstDoc' as const,
                      label: 'GST Certificate',
                      url: inspectedRestaurantApp.documents?.gstDoc,
                      status: inspectedRestaurantApp.documentStatuses?.gstDoc,
                      isRequired: Boolean(inspectedRestaurantApp.hasGst || inspectedRestaurantApp.gstRegistered)
                    },
                    {
                      key: 'chequeDoc' as const,
                      label: 'Cancelled Cheque',
                      url: inspectedRestaurantApp.documents?.chequeDoc,
                      status: inspectedRestaurantApp.documentStatuses?.chequeDoc,
                      isRequired: true
                    },
                    {
                      key: 'aadhaarFront' as const,
                      label: 'Aadhaar Card (Front) *',
                      url: inspectedRestaurantApp.documents?.aadhaarFront || (inspectedRestaurantApp as any).partnerKycDocuments?.aadhaarFront,
                      status: (inspectedRestaurantApp.documentStatuses as any)?.aadhaarFront,
                      isRequired: true
                    },
                    {
                      key: 'aadhaarBack' as const,
                      label: 'Aadhaar Card (Back) *',
                      url: inspectedRestaurantApp.documents?.aadhaarBack || (inspectedRestaurantApp as any).partnerKycDocuments?.aadhaarBack,
                      status: (inspectedRestaurantApp.documentStatuses as any)?.aadhaarBack,
                      isRequired: true
                    },
                    {
                      key: 'personalPanFront' as const,
                      label: 'Personal PAN (Front) *',
                      url: inspectedRestaurantApp.documents?.personalPanFront || (inspectedRestaurantApp as any).partnerKycDocuments?.personalPanFront,
                      status: (inspectedRestaurantApp.documentStatuses as any)?.personalPanFront,
                      isRequired: true
                    },
                    {
                      key: 'personalPanBack' as const,
                      label: 'Personal PAN (Back) *',
                      url: inspectedRestaurantApp.documents?.personalPanBack || (inspectedRestaurantApp as any).partnerKycDocuments?.personalPanBack,
                      status: (inspectedRestaurantApp.documentStatuses as any)?.personalPanBack,
                      isRequired: true
                    }
                  ].map((doc) => {
                    const isExempt = !doc.isRequired;
                    const docStatus = isExempt
                      ? 'Not Required'
                      : doc.isExpired
                      ? 'Expired'
                      : doc.status === 'verified'
                      ? 'Verified'
                      : doc.status === 'rejected'
                      ? 'Rejected'
                      : doc.url
                      ? 'Uploaded'
                      : 'Missing';

                    return (
                      <div
                        key={doc.key}
                        style={{
                          borderRadius: '8px',
                          border: `1px solid ${
                            docStatus === 'Expired' || docStatus === 'Rejected'
                              ? 'rgba(239, 68, 68, 0.4)'
                              : docStatus === 'Verified'
                              ? 'rgba(46, 204, 113, 0.4)'
                              : 'rgba(255,255,255,0.1)'
                          }`,
                          backgroundColor: '#101014',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB' }}>{doc.label}</span>
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor:
                                docStatus === 'Verified'
                                  ? 'var(--color-veg-bg)'
                                  : docStatus === 'Rejected' || docStatus === 'Expired'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : docStatus === 'Not Required'
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : 'rgba(243, 156, 18, 0.15)',
                              color:
                                docStatus === 'Verified'
                                  ? 'var(--color-veg)'
                                  : docStatus === 'Rejected' || docStatus === 'Expired'
                                  ? '#EF4444'
                                  : docStatus === 'Not Required'
                                  ? '#9CA3AF'
                                  : '#F39C12'
                            }}
                          >
                            {docStatus === 'Verified' && '✓ Verified'}
                            {docStatus === 'Rejected' && '✕ Rejected'}
                            {docStatus === 'Expired' && '⚠️ Expired'}
                            {docStatus === 'Uploaded' && 'Uploaded'}
                            {docStatus === 'Missing' && 'Missing'}
                            {docStatus === 'Not Required' && 'Not Required'}
                          </span>
                        </div>

                        {/* Preview Box */}
                        <div
                          onClick={() => {
                            if (doc.url) handlePreviewDoc(doc.label, doc.url, 'partner-kyc-documents');
                          }}
                          style={{
                            height: '75px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            position: 'relative',
                            cursor: doc.url ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isExempt ? (
                            <div style={{ color: '#9CA3AF', fontSize: '10px', textAlign: 'center' }}>
                              <ShieldCheck size={20} style={{ margin: '0 auto 2px' }} />
                              <div>Exempted</div>
                            </div>
                          ) : doc.url ? (
                            doc.url.startsWith('data:image/') || doc.url.startsWith('http') ? (
                              <img src={doc.url} alt={doc.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#60A5FA', gap: '4px' }}>
                                <FileText size={22} />
                                <span style={{ fontSize: '9px' }}>Preview Document</span>
                              </div>
                            )
                          ) : (
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>Not attached</div>
                          )}
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {doc.url && (
                            <button
                              type="button"
                              onClick={() => handleDownloadDoc(doc.url, `${inspectedRestaurantApp.restaurantName}_${doc.key}.pdf`, 'partner-kyc-documents')}
                              title="Download Document"
                              style={{
                                padding: '4px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                color: '#FFFFFF',
                                border: '1px solid var(--color-border)',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              <Download size={11} />
                            </button>
                          )}
                          {doc.url && !isExempt && (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  await verifyRestaurantDocument(inspectedRestaurantApp.id, doc.key, 'verified');
                                  setInspectedRestaurantApp((prev: any) => ({
                                    ...prev,
                                    documentStatuses: { ...(prev?.documentStatuses || {}), [doc.key]: 'verified' }
                                  }));
                                }}
                                style={{
                                  flex: 1,
                                  padding: '4px',
                                  borderRadius: '4px',
                                  backgroundColor: doc.status === 'verified' ? 'var(--color-veg)' : 'rgba(46, 204, 113, 0.15)',
                                  color: doc.status === 'verified' ? '#FFFFFF' : 'var(--color-veg)',
                                  border: '1px solid rgba(46, 204, 113, 0.3)',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✓ Verify
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await verifyRestaurantDocument(inspectedRestaurantApp.id, doc.key, 'rejected');
                                  setInspectedRestaurantApp((prev: any) => ({
                                    ...prev,
                                    documentStatuses: { ...(prev?.documentStatuses || {}), [doc.key]: 'rejected' }
                                  }));
                                }}
                                style={{
                                  flex: 1,
                                  padding: '4px',
                                  borderRadius: '4px',
                                  backgroundColor: doc.status === 'rejected' ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
                                  color: doc.status === 'rejected' ? '#FFFFFF' : '#EF4444',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setInspectedRestaurantApp(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>

              {inspectedRestaurantApp.status !== 'approved' && (() => {
                const isModalBlocked =
                  !inspectedRestaurantApp.documents?.panDoc ||
                  !inspectedRestaurantApp.documents?.fssaiDoc ||
                  !inspectedRestaurantApp.documents?.chequeDoc ||
                  Boolean(inspectedRestaurantApp.fssaiExpiryDate && new Date(inspectedRestaurantApp.fssaiExpiryDate).getTime() < Date.now()) ||
                  inspectedRestaurantApp.documentStatuses?.panDoc === 'rejected' ||
                  inspectedRestaurantApp.documentStatuses?.fssaiDoc === 'rejected' ||
                  inspectedRestaurantApp.documentStatuses?.chequeDoc === 'rejected' ||
                  Boolean(inspectedRestaurantApp.hasGst && inspectedRestaurantApp.documentStatuses?.gstDoc === 'rejected');

                return (
                  <button
                    disabled={isModalBlocked}
                    onClick={async () => {
                      if (isModalBlocked) return;
                      const res = await approveRestaurantApplication(inspectedRestaurantApp.id);
                      if (res.success) {
                        setRestSuccessMsg(`Application for ${inspectedRestaurantApp.restaurantName} approved! Restaurant is now onboarded.`);
                        setInspectedRestaurantApp(null);
                      } else {
                        alert(res.error || 'Failed to approve application.');
                      }
                    }}
                    title={isModalBlocked ? 'Approval blocked: mandatory document missing/rejected or expired FSSAI' : 'Approve partner and activate store'}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: isModalBlocked ? 'rgba(255,255,255,0.08)' : 'var(--color-veg-bg)',
                      color: isModalBlocked ? '#6B7280' : 'var(--color-veg)',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: `1px solid ${isModalBlocked ? 'rgba(255,255,255,0.1)' : 'var(--color-veg)'}`,
                      cursor: isModalBlocked ? 'not-allowed' : 'pointer',
                      opacity: isModalBlocked ? 0.6 : 1
                    }}
                  >
                    Approve Partner & Activate Store
                  </button>
                );
              })()}

              {inspectedRestaurantApp.status !== 'rejected' && inspectedRestaurantApp.status !== 'approved' && (
                <>
                  <button
                    onClick={() => {
                      setResubmitRestModalAppId(inspectedRestaurantApp.id);
                      setResubmitRestReasonText('');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: '#F59E0B',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    Request Resubmission
                  </button>
                  <button
                    onClick={() => {
                      setRejectRestModalAppId(inspectedRestaurantApp.id);
                      setRejectRestReasonText('');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    Reject Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Qualification Rejection Modal */}
      {qualRejectModalAppId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setQualRejectModalAppId(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Reject Qualification Document</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#D1D5DB', marginBottom: '16px', lineHeight: 1.5 }}>
              Specify the reason for rejecting the applicant's educational qualification certificate. Note: This action will not reject their overall rider profile.
            </p>
            <textarea
              rows={3}
              value={qualRejectReasonText}
              onChange={(e) => setQualRejectReasonText(e.target.value)}
              placeholder="e.g. Uploaded certificate is blurred, illegible, or name does not match applicant."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '13px',
                marginBottom: '18px',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setQualRejectModalAppId(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (qualRejectModalAppId && qualRejectReasonText.trim()) {
                    await verifyRiderQualification(qualRejectModalAppId, 'rejected', qualRejectReasonText.trim());
                    if (inspectedRiderApp && inspectedRiderApp.id === qualRejectModalAppId) {
                      setInspectedRiderApp((prev: any) => ({
                        ...prev,
                        education: {
                          ...prev?.education,
                          qualificationStatus: 'rejected',
                          qualificationRejectionReason: qualRejectReasonText.trim()
                        }
                      }));
                    }
                    setKycSuccessMsg(`Qualification marked rejected with reason.`);
                    setQualRejectModalAppId(null);
                    setQualRejectReasonText('');
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Resubmission Modal */}
      {resubmitRestModalAppId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setResubmitRestModalAppId(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F59E0B', marginBottom: '14px' }}>
              <RotateCcw size={24} />
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Request Restaurant Resubmission</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#D1D5DB', marginBottom: '16px', lineHeight: 1.5 }}>
              Specify the compliance corrections or document re-uploads required by the restaurant partner.
            </p>
            <textarea
              rows={3}
              value={resubmitRestReasonText}
              onChange={(e) => setResubmitRestReasonText(e.target.value)}
              placeholder="e.g. FSSAI registration number mismatch or expired certificate."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '13px',
                marginBottom: '18px',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setResubmitRestModalAppId(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (resubmitRestModalAppId && resubmitRestReasonText.trim()) {
                    await requestResubmissionRestaurantApplication(resubmitRestModalAppId, resubmitRestReasonText.trim());
                    setRestSuccessMsg(`Requested resubmission for restaurant application.`);
                    setResubmitRestModalAppId(null);
                    setResubmitRestReasonText('');
                    if (inspectedRestaurantApp && inspectedRestaurantApp.id === resubmitRestModalAppId) {
                      setInspectedRestaurantApp((prev: any) => ({
                        ...prev,
                        status: 'action_required',
                        rejectionReason: resubmitRestReasonText.trim()
                      }));
                    }
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#F59E0B',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Rejection Modal */}
      {rejectRestModalAppId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setRejectRestModalAppId(null)}
        >
          <div
            style={{
              backgroundColor: '#1E1E24',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Reject Restaurant Application</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#D1D5DB', marginBottom: '16px', lineHeight: 1.5 }}>
              Specify the reason for rejecting this restaurant partner application.
            </p>
            <textarea
              rows={3}
              value={rejectRestReasonText}
              onChange={(e) => setRejectRestReasonText(e.target.value)}
              placeholder="e.g. Ineligible business license or fraudulent registration data."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#121216',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: '13px',
                marginBottom: '18px',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectRestModalAppId(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (rejectRestModalAppId && rejectRestReasonText.trim()) {
                    await rejectRestaurantApplication(rejectRestModalAppId, rejectRestReasonText.trim());
                    setRestSuccessMsg(`Restaurant application marked as rejected.`);
                    setRejectRestModalAppId(null);
                    setRejectRestReasonText('');
                    if (inspectedRestaurantApp && inspectedRestaurantApp.id === rejectRestModalAppId) {
                      setInspectedRestaurantApp((prev: any) => ({
                        ...prev,
                        status: 'rejected',
                        rejectionReason: rejectRestReasonText.trim()
                      }));
                    }
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
