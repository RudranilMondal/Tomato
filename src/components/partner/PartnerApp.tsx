import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Order } from '../../types';
import { AddDishModal } from './AddDishModal';
import { KitchenTicketModal } from './KitchenTicketModal';
import { RejectOrderModal } from './RejectOrderModal';
import { OutletProfileModal } from './OutletProfileModal';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Utensils,
  DollarSign,
  TrendingUp,
  Power,
  ChevronRight,
  X,
  Plus,
  FileText,
  MessageSquare,
  Send,
  Star,
  Zap,
  Sparkles,
  ChefHat,
  Users,
  ToggleLeft,
  ToggleRight,
  BarChart2,
  Tag,
  Percent,
  ArrowUpRight,
  Flame,
  Award
} from 'lucide-react';

export const PartnerApp: React.FC = () => {
  const {
    selectedRestaurant,
    restaurants,
    incomingOrder,
    partnerOrders,
    partnerAcceptOrder,
    partnerRejectOrder,
    partnerMarkReady,
    menuStockMap,
    toggleItemStock,
    triggerSimulatedCustomerOrder
  } = useTomattto();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'earnings' | 'reviews' | 'marketing' | 'analytics'>('orders');
  const [isOnline, setIsOnline] = useState(true);
  const [isRushMode, setIsRushMode] = useState(false);
  const [isAutoAccept, setIsAutoAccept] = useState(false);
  const [isSoundAlert, setIsSoundAlert] = useState(true);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Marketing campaigns state
  const [campaigns, setCampaigns] = useState([
    {
      id: 'cmp-1',
      title: 'Flat ₹75 OFF on Dum Biryanis',
      minOrder: 299,
      status: 'Active',
      ordersGenerated: 42,
      gmvGenerated: 16800,
      badgeColor: 'var(--color-veg)'
    },
    {
      id: 'cmp-2',
      title: 'Free Thums Up / Mint Chaas on combos',
      minOrder: 399,
      status: 'Active',
      ordersGenerated: 28,
      gmvGenerated: 12400,
      badgeColor: 'var(--color-primary)'
    }
  ]);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoMin, setNewPromoMin] = useState('349');

  // Partner reviews & replies state
  const [merchantReplies, setMerchantReplies] = useState<Record<string, string>>({
    'rev-1': 'Thank you Ananya! We slow-cook our gosht for 4 hours. Glad you loved the dum aroma!'
  });
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const restaurant = selectedRestaurant || restaurants[0]; // Behrouz Biryani default

  // Sound chime when incoming order arrives
  useEffect(() => {
    if (incomingOrder) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        // audio context not allowed before interaction
      }
    }
  }, [incomingOrder]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        paddingBottom: '30px'
      }}
    >
      {/* Partner Header */}
      <div
        style={{
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}
            >
              🏪
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{restaurant.name}</h3>
                <span
                  style={{
                    backgroundColor: isOnline ? 'var(--color-veg)' : '#737380',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {isOnline ? 'ACCEPTING ORDERS' : 'OFFLINE'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#A5A5B2', marginTop: '2px' }}>
                Restaurant Partner Terminal • ID: REST-7029
              </p>
            </div>
          </div>

          {/* Right Header Buttons: KYC Profile & Online Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer'
              }}
              title="View FSSAI & Operating Timings"
            >
              <Store size={13} color="var(--color-primary)" />
              <span>KYC & Profile</span>
            </button>

            {/* Online Toggle Switch */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isOnline ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isOnline ? 'var(--color-veg)' : '#FFFFFF',
                border: `1.5px solid ${isOnline ? 'var(--color-veg)' : 'rgba(255,255,255,0.2)'}`,
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <Power size={14} />
              <span>{isOnline ? 'Online' : 'Go Online'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginTop: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '12px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Today's Orders</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
              {partnerOrders.length + 18}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Revenue (Gross)</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-veg)' }}>
              ₹12,480
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Avg Prep Time</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFB400' }}>
              19 mins
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}
        >
          {[
            { id: 'orders', label: 'Live Orders', icon: <Utensils size={14} /> },
            { id: 'menu', label: 'Menu & Stock', icon: <Store size={14} /> },
            { id: 'marketing', label: 'Promotions & Ads', icon: <Tag size={14} /> },
            { id: 'analytics', label: 'Live Analytics', icon: <BarChart2 size={14} /> },
            { id: 'earnings', label: 'Payouts', icon: <DollarSign size={14} /> },
            { id: 'reviews', label: 'Reviews (4.7 ★)', icon: <MessageSquare size={14} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#FFFFFF' : '#A5A5B2',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, padding: '20px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* Incoming Order Alert Banner / Modal if active */}
        {incomingOrder && (
          <div
            style={{
              backgroundColor: 'var(--color-primary-light)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-glow)',
              animation: 'pulseGlow 2s infinite'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'floatRide 1s infinite'
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    🔥 NEW ORDER RECEIVED! (#{incomingOrder.id})
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    Customer: <b>{incomingOrder.customerName}</b> • {incomingOrder.items.length} items • ₹{incomingOrder.totalAmount}
                  </p>
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '4px' }}>
                Auto-reject in 45s
              </span>
            </div>

            {/* Items inside incoming order */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                margin: '12px 0',
                border: '1px solid var(--color-border)'
              }}
            >
              {incomingOrder.items.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                  <span>{i.quantity}x {i.menuItem.name}</span>
                  <span>₹{i.itemTotal}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRejectOrderId(incomingOrder.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  color: '#E74C3C',
                  border: '1.5px solid #E74C3C',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Reject Order
              </button>

              <button
                onClick={() => partnerAcceptOrder(incomingOrder.id, 20)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Accept (Set 20 mins prep)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Live Kitchen Kanban Orders Board */}
        {activeTab === 'orders' && (
          <div>
            {/* Top Operational Controls Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                backgroundColor: 'var(--color-surface)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Kitchen Display (KDS)</h3>
                {isRushMode && (
                  <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#E74C3C', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>
                    🔥 RUSH MODE ACTIVE (+10m)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {/* Instant Order Simulation */}
                <button
                  onClick={triggerSimulatedCustomerOrder}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    boxShadow: '0 4px 10px var(--color-primary-glow)'
                  }}
                >
                  <Zap size={13} fill="#FFFFFF" />
                  <span>Simulate Order</span>
                </button>

                {/* Rush Hour Toggle */}
                <button
                  onClick={() => setIsRushMode(!isRushMode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isRushMode ? 'rgba(231, 76, 60, 0.15)' : 'var(--color-surface-muted)',
                    color: isRushMode ? '#E74C3C' : 'var(--color-text-main)',
                    border: `1px solid ${isRushMode ? '#E74C3C' : 'var(--color-border)'}`,
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  <Flame size={13} color={isRushMode ? '#E74C3C' : 'var(--color-text-muted)'} />
                  <span>{isRushMode ? 'Rush Hour ON' : 'Rush Hour Mode'}</span>
                </button>

                {/* Auto Accept Toggle */}
                <button
                  onClick={() => setIsAutoAccept(!isAutoAccept)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isAutoAccept ? 'rgba(46, 204, 113, 0.15)' : 'var(--color-surface-muted)',
                    color: isAutoAccept ? 'var(--color-veg)' : 'var(--color-text-main)',
                    border: `1px solid ${isAutoAccept ? 'var(--color-veg)' : 'var(--color-border)'}`,
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  <CheckCircle2 size={13} color={isAutoAccept ? 'var(--color-veg)' : 'var(--color-text-muted)'} />
                  <span>{isAutoAccept ? 'Auto-Accept ON' : 'Auto-Accept (< ₹400)'}</span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Preparing Column */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#E67E22', textTransform: 'uppercase' }}>
                    🍳 Preparing in Kitchen
                  </span>
                  <span
                    style={{
                      backgroundColor: 'rgba(230, 126, 34, 0.15)',
                      color: '#E67E22',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {partnerOrders.filter((o) => o.status === 'preparing' || o.status === 'placed').length}
                  </span>
                </div>

                {partnerOrders.filter((o) => o.status === 'preparing' || o.status === 'placed').length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    No orders being cooked right now
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {partnerOrders
                      .filter((o) => o.status === 'preparing' || o.status === 'placed')
                      .map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setInspectedOrder(order)}
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText size={14} color="var(--color-primary)" />
                              <span style={{ fontSize: '13px', fontWeight: 800 }}>#{order.id}</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#E67E22', fontWeight: 700 }}>
                              ⏳ 15 mins left
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                            {order.items.map((i) => (
                              <div key={i.id}>• {i.quantity}x {i.menuItem.name}</div>
                            ))}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              partnerMarkReady(order.id);
                            }}
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--color-veg)',
                              color: '#FFFFFF',
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            Mark Ready for Pickup
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Ready for Pickup Column */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-veg)', textTransform: 'uppercase' }}>
                    🛵 Ready for Pickup
                  </span>
                  <span
                    style={{
                      backgroundColor: 'var(--color-veg-bg)',
                      color: 'var(--color-veg)',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {partnerOrders.filter((o) => o.status === 'ready' || o.status === 'rider_assigned').length}
                  </span>
                </div>

                {partnerOrders.filter((o) => o.status === 'ready' || o.status === 'rider_assigned').length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    No packed bags waiting
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {partnerOrders
                      .filter((o) => o.status === 'ready' || o.status === 'rider_assigned')
                      .map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setInspectedOrder(order)}
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText size={14} color="var(--color-veg)" />
                              <span style={{ fontSize: '13px', fontWeight: 800 }}>#{order.id}</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-veg)' }}>
                              Bag Packed
                            </span>
                          </div>

                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            Rider assigned: <b>Vikram Singh</b> (Arriving in 3 mins)
                          </p>

                          <div
                            style={{
                              marginTop: '8px',
                              backgroundColor: 'var(--color-surface)',
                              padding: '6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textAlign: 'center',
                              border: '1px dashed var(--color-border)'
                            }}
                          >
                            Pickup Code: {order.pickupOtp}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Active Kitchen Staff & Operations SLA */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}
            >
              {/* Active Station Staff */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ChefHat size={16} color="var(--color-primary)" />
                  <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Active Kitchen Shift Staff</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Chef Rakesh Pillai', role: 'Head Chef • Biryani & Dum Handi Station', status: 'Active Line', badge: '#27AE60' },
                    { name: 'Anita Sharma', role: 'Prep Cook • Tandoor & Starters', status: 'Active Line', badge: '#27AE60' },
                    { name: 'Suresh Rao', role: 'Packaging • Quality Check & Tamper Seal', status: 'Active Line', badge: '#27AE60' }
                  ].map((chef, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-muted)',
                        fontSize: '11px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{chef.name}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{chef.role}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: chef.badge, backgroundColor: 'rgba(39, 174, 96, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                        {chef.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kitchen Performance SLA */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Award size={16} color="#F39C12" />
                  <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Kitchen Service Level Agreement (SLA)</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>On-Time Dispatch</span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '2px' }}>98.4%</div>
                    <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>Under 20m threshold</span>
                  </div>

                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Average Accept TAT</span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '2px' }}>18 secs</div>
                    <span style={{ fontSize: '9px', color: 'var(--color-veg)' }}>Top 5% in Indiranagar</span>
                  </div>

                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Kitchen Audit Score</span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#F39C12', marginTop: '2px' }}>5.0 ★</div>
                    <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>FSSAI Grade A Hygiene</span>
                  </div>

                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Wrong Item Rate</span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '2px' }}>0.05%</div>
                    <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>Zero packaging leaks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Menu Stock Manager */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Menu & Item Availability</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Toggle stock status instantly or publish brand-new recipes
                </p>
              </div>

              <button
                onClick={() => setIsAddDishOpen(true)}
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
                <span>Add New Dish</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {restaurant.categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                    {cat.name}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cat.items.map((item) => {
                      const inStock = menuStockMap[item.id] !== undefined ? menuStockMap[item.id] : item.isInStock;
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden' }}>
                              <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>{item.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>₹{item.price}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleItemStock(item.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: inStock ? 'var(--color-veg-bg)' : 'var(--color-surface)',
                              color: inStock ? 'var(--color-veg)' : 'var(--color-text-muted)',
                              border: `1.5px solid ${inStock ? 'var(--color-veg)' : 'var(--color-border)'}`
                            }}
                          >
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Payouts */}
        {activeTab === 'earnings' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Settlements & Payouts</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Automatic daily settlements directly into HDFC Bank Account (ending in 8912)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-muted)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pending Settlement (Today)</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '4px' }}>₹10,234</h4>
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Net of 18% Tomattto commission</p>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-muted)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Last Payout Dispatched</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>₹18,450</h4>
                <p style={{ fontSize: '10px', color: 'var(--color-veg)', marginTop: '2px' }}>✓ Settled yesterday at 11:30 PM</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Customer Reviews & Merchant Reply */}
        {activeTab === 'reviews' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Customer Reviews & Ratings</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  View customer feedback on food quality, portions, and post merchant replies
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#27AE60', color: '#FFFFFF', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 800 }}>
                <span>4.7</span>
                <Star size={13} fill="#FFFFFF" />
                <span style={{ fontSize: '11px', opacity: 0.9 }}>(2,840 verified ratings)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  id: 'rev-1',
                  customer: 'Ananya Roy',
                  rating: 5,
                  time: 'Yesterday at 8:45 PM',
                  dish: 'Dum Gosht Biryani (Mutton)',
                  review: 'Heavenly aroma! The meat literally melted in my mouth, authentic dum style spices. Packaging was neat and spill-proof.'
                },
                {
                  id: 'rev-2',
                  customer: 'Karthik Nair',
                  rating: 5,
                  time: '2 days ago',
                  dish: 'Murgh Makhani Biryani + Kefta Kebab',
                  review: 'Fastest delivery in Indiranagar! Food was steaming hot and kebabs were succulent.'
                },
                {
                  id: 'rev-3',
                  customer: 'Sneha Patel',
                  rating: 4,
                  time: '3 days ago',
                  dish: 'Zaikedaar Paneer Biryani',
                  review: 'Very good flavor, fresh paneer. Would love slightly more salan gravy with the portion!'
                }
              ].map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800 }}>{rev.customer}</span>
                        <CheckCircle2 size={13} color="var(--color-veg)" />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{rev.time} • Ordered: {rev.dish}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', color: '#F39C12' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#F39C12" />
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-main)', margin: '0 0 12px', lineHeight: 1.4 }}>
                    "{rev.review}"
                  </p>

                  {/* Merchant Reply if exists */}
                  {merchantReplies[rev.id] ? (
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 75, 58, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        borderLeft: '3px solid var(--color-primary)'
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>
                        Merchant Response:
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-main)', margin: '2px 0 0' }}>
                        {merchantReplies[rev.id]}
                      </p>
                    </div>
                  ) : (
                    /* Reply Input Form */
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="Write a reply to this customer..."
                        value={replyInput[rev.id] || ''}
                        onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          fontSize: '12px',
                          color: 'var(--color-text-main)'
                        }}
                      />
                      <button
                        onClick={() => {
                          if (replyInput[rev.id]?.trim()) {
                            setMerchantReplies({
                              ...merchantReplies,
                              [rev.id]: replyInput[rev.id].trim()
                            });
                            setReplyInput({ ...replyInput, [rev.id]: '' });
                          }
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Send size={12} />
                        <span>Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Promotions & Marketing Campaigns */}
        {activeTab === 'marketing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Create Flash Discount Campaign</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Fund exclusive discounts to drive rush-hour volume and attract new diners
                  </p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: 'rgba(255, 75, 58, 0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                  Merchant Funded
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Campaign Title / Offer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 25% OFF on Biryanis"
                    value={newPromoTitle}
                    onChange={(e) => setNewPromoTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border)',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="349"
                    value={newPromoMin}
                    onChange={(e) => setNewPromoMin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border)',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (newPromoTitle.trim()) {
                    setCampaigns([
                      ...campaigns,
                      {
                        id: `cmp-${Date.now()}`,
                        title: newPromoTitle.trim(),
                        minOrder: Number(newPromoMin) || 299,
                        status: 'Active',
                        ordersGenerated: 0,
                        gmvGenerated: 0,
                        badgeColor: 'var(--color-veg)'
                      }
                    ]);
                    setNewPromoTitle('');
                  }
                }}
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Plus size={14} />
                <span>Launch Campaign</span>
              </button>
            </div>

            {/* Active Campaigns List */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Live Outlet Promotions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {campaigns.map((cmp) => (
                  <div
                    key={cmp.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={14} color="var(--color-primary)" />
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>{cmp.title}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Min order: ₹{cmp.minOrder} • Status: <b style={{ color: 'var(--color-veg)' }}>{cmp.status}</b>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Orders Generated</span>
                        <b>{cmp.ordersGenerated} orders</b>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>GMV Driven</span>
                        <b style={{ color: 'var(--color-veg)' }}>₹{cmp.gmvGenerated.toLocaleString('en-IN')}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Live Analytics & Kitchen Heatmaps */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Sales Hours Heatmap */}
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
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Order Volume by Hour (Peak Times)</h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Busiest window: Dinner 8:00 PM - 10:30 PM (Indiranagar Delivery Zone)
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-veg)' }}>
                  +24% vs Last Thursday
                </span>
              </div>

              {/* Bar visualization */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', alignItems: 'flex-end', height: '140px', paddingTop: '20px' }}>
                {[
                  { time: '12 PM', height: '55%', orders: 18 },
                  { time: '1 PM', height: '80%', orders: 32 },
                  { time: '2 PM', height: '65%', orders: 24 },
                  { time: '5 PM', height: '30%', orders: 10 },
                  { time: '7 PM', height: '70%', orders: 28 },
                  { time: '8 PM', height: '100%', orders: 46 },
                  { time: '9 PM', height: '90%', orders: 38 }
                ].map((bar, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{bar.orders}</span>
                    <div
                      style={{
                        width: '100%',
                        height: bar.height,
                        backgroundColor: bar.height === '100%' ? 'var(--color-primary)' : 'var(--color-primary-light)',
                        borderRadius: '4px',
                        border: '1px solid var(--color-primary)'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{bar.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Items Leaderboard & Quality Sentiment */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Best Sellers */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>🏆 Top Selling Dishes Today</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { rank: 1, name: 'Dum Gosht Biryani (Mutton)', qty: 48, revenue: 23952 },
                    { rank: 2, name: 'Murgh Makhani Biryani', qty: 36, revenue: 14364 },
                    { rank: 3, name: 'Zaikedaar Paneer Biryani', qty: 28, revenue: 9772 },
                    { rank: 4, name: 'Kefta Chicken Kebab', qty: 22, revenue: 6578 }
                  ].map((dish) => (
                    <div
                      key={dish.rank}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-muted)',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {dish.rank}
                        </span>
                        <span style={{ fontWeight: 700 }}>{dish.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800 }}>{dish.qty} orders</span>
                        <div style={{ fontSize: '10px', color: 'var(--color-veg)' }}>₹{dish.revenue.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Score */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>⭐ Customer Sentiment Metrics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Taste & Authentic Spice Balance', score: '96% Positive', val: 96, color: 'var(--color-veg)' },
                    { label: 'Packaging & Zero Spillage', score: '94% Positive', val: 94, color: 'var(--color-veg)' },
                    { label: 'Food Temperature on Delivery', score: '92% Steaming Hot', val: 92, color: '#F39C12' },
                    { label: 'Portion Size Satisfaction', score: '89% Satisfied', val: 89, color: '#3498DB' }
                  ].map((s, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{s.label}</span>
                        <b style={{ color: s.color }}>{s.score}</b>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.val}%`, height: '100%', backgroundColor: s.color, borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Dish Modal */}
      <AddDishModal
        isOpen={isAddDishOpen}
        onClose={() => setIsAddDishOpen(false)}
        categories={restaurant.categories}
        restaurantId={restaurant.id}
      />

      {/* Kitchen Ticket Inspector Modal */}
      <KitchenTicketModal
        order={inspectedOrder}
        onClose={() => setInspectedOrder(null)}
        onMarkReady={partnerMarkReady}
      />

      {/* Reject Order Reason Modal */}
      <RejectOrderModal
        isOpen={rejectOrderId !== null}
        orderId={rejectOrderId}
        onClose={() => setRejectOrderId(null)}
        onConfirmReject={(orderId) => partnerRejectOrder(orderId)}
      />

      {/* Outlet Profile & KYC Modal */}
      <OutletProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        restaurant={restaurant}
      />
    </div>
  );
};
