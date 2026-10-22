import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { COUPONS } from '../../data/mockData';
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
  ArrowUpRight
} from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { restaurants, allOrders, currentOrder } = useTomattto();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'restaurants' | 'coupons'>('overview');

  const combinedOrders = allOrders.length > 0 ? allOrders : (currentOrder ? [currentOrder] : []);

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

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'overview', label: 'Dashboard & Metrics' },
              { id: 'orders', label: 'Live Orders Monitor' },
              { id: 'restaurants', label: 'Restaurants (16)' },
              { id: 'coupons', label: 'Coupons CMS' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Content Area */}
      <div style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-veg)', backgroundColor: 'var(--color-veg-bg)', padding: '4px 10px', borderRadius: '4px' }}>
                  SURGE MULTIPLIER: 1.0x (Normal)
                </span>
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
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-muted)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={r.coverImage} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 800 }}>{r.name}</h5>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{r.address}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>18% Commission</span>
                      <span>•</span>
                      <span>{r.rating} ★ Rating</span>
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
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px' }}>
              Active Promotional Discount Codes
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {COUPONS.map((c) => (
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
      </div>
    </div>
  );
};
