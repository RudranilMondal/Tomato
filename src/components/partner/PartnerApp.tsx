import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
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
  X
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
    toggleItemStock
  } = useTomattto();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'earnings'>('orders');
  const [isOnline, setIsOnline] = useState(true);

  const restaurant = selectedRestaurant || restaurants[0]; // Behrouz Biryani default

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
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {[
            { id: 'orders', label: 'Live Orders', icon: <Utensils size={14} /> },
            { id: 'menu', label: 'Menu & Stock', icon: <Store size={14} /> },
            { id: 'earnings', label: 'Payouts', icon: <DollarSign size={14} /> }
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
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#A5A5B2',
                  fontSize: '12px',
                  fontWeight: 700
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
                onClick={() => partnerRejectOrder(incomingOrder.id)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Kitchen Orders Board</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Auto-refreshes in real-time
              </span>
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
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800 }}>#{order.id}</span>
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
                            onClick={() => partnerMarkReady(order.id)}
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
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800 }}>#{order.id}</span>
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
          </div>
        )}

        {/* Tab 2: Menu Stock Manager */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Menu & Item Availability</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Toggle stock status instantly to pause orders on sold-out dishes
                </p>
              </div>
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
      </div>
    </div>
  );
};
