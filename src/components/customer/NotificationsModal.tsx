import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, Bell, Tag, Bike, Info, CheckCheck } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCustomerScreen
  } = useTomattto();

  const [activeFilter, setActiveFilter] = useState<'all' | 'offer' | 'order'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          maxHeight: '85%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Notification Center</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Stay updated with your active deliveries & exclusive deals
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={markAllNotificationsRead}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-light)'
              }}
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            padding: '10px 16px',
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: 'var(--color-bg)'
          }}
        >
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'offer', label: 'Offers & Deals 🏷️' },
            { id: 'order', label: 'Live Orders 🛵' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: activeFilter === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeFilter === tab.id ? '#FFFFFF' : 'var(--color-text-main)',
                border: '1px solid var(--color-border)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
          className="no-scrollbar"
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <Bell size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>No notifications in this category</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.type === 'order') {
                    setCustomerScreen('order_tracking');
                    onClose();
                  } else if (item.type === 'offer') {
                    setCustomerScreen('home');
                    onClose();
                  }
                }}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.read ? 'var(--color-surface)' : 'var(--color-primary-light)',
                  border: item.read ? '1px solid var(--color-border)' : '1px solid var(--color-primary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor:
                      item.type === 'offer'
                        ? '#FFEAA7'
                        : item.type === 'order'
                        ? 'var(--color-veg-bg)'
                        : 'var(--color-surface-muted)',
                    color:
                      item.type === 'offer'
                        ? '#D35400'
                        : item.type === 'order'
                        ? 'var(--color-veg)'
                        : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.type === 'offer' ? (
                    <Tag size={16} />
                  ) : item.type === 'order' ? (
                    <Bike size={16} />
                  ) : (
                    <Info size={16} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: item.read ? 700 : 800 }}>{item.title}</h4>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      marginTop: '6px'
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
