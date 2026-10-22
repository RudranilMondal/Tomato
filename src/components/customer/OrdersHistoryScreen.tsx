import React from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { ShoppingBag, ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';

export const OrdersHistoryScreen: React.FC = () => {
  const { allOrders, setCustomerScreen, setCurrentOrder } = useTomattto();

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-muted)',
            display: 'flex',
            color: 'var(--color-text-main)'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Past Orders</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }} className="no-scrollbar">
        {allOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>No orders placed yet</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Place an order to see its receipt and live timeline here!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {allOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{order.restaurant.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {order.createdAt} • ID: {order.id}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: 'var(--color-veg-bg)',
                      color: 'var(--color-veg)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                  {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>₹{order.totalAmount}</span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setCurrentOrder(order);
                        setCustomerScreen('order_tracking');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Track</span>
                      <ChevronRight size={12} />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentOrder(order);
                        setCustomerScreen('restaurant');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-muted)',
                        color: 'var(--color-text-main)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <RotateCcw size={11} />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
