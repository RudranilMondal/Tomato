import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Restaurant } from '../../types';
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
  CreditCard
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
    rejectRiderKyc
  } = useTomattto();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'restaurants' | 'riders' | 'customers' | 'tickets' | 'coupons'>('overview');
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [selectedManageRestaurant, setSelectedManageRestaurant] = useState<Restaurant | null>(null);
  const [isLiveMapOpen, setIsLiveMapOpen] = useState(false);
  const [isMonsoonSurge, setIsMonsoonSurge] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);
  const [kycSuccessMsg, setKycSuccessMsg] = useState<string | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

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

        {/* Tab 3: Restaurants Directory */}
        {activeTab === 'restaurants' && (
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
                </div>
              </div>

              {/* Applications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {allRiderApplications.map((app) => {
                  const isPending = app.status === 'under_review';
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
                              <span>🏙️ <strong>{app.city || 'Bengaluru'}</strong></span>
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
                                  if (doc.url) setSelectedDocPreview({ title: `${app.fullName} - ${doc.title}`, url: doc.url });
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {isPending && (
                          <>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter reason for rejecting this rider application:', 'Documents blurry or license expired');
                                if (reason) rejectRiderKyc(app.id, reason);
                              }}
                              style={{
                                padding: '8px 16px',
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
                                setKycSuccessMsg(`Approved ${app.fullName}! Rider terminal is now activated for deliveries.`);
                                setTimeout(() => setKycSuccessMsg(null), 5000);
                              }}
                              style={{
                                padding: '9px 20px',
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
                              <span>Approve Rider & Activate Terminal</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-veg)', fontSize: '12px', fontWeight: 800 }}>
                            <CheckCircle2 size={16} />
                            <span>Rider is active and receiving delivery requests</span>
                          </div>
                        )}

                        {isRejected && (
                          <div style={{ color: '#E74C3C', fontSize: '12px', fontWeight: 700 }}>
                            Reason: {app.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
};
