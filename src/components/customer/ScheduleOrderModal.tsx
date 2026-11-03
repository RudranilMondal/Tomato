import React, { useState } from 'react';
import { X, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

interface ScheduleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchedule: string | null; // e.g. "Today, 8:00 PM - 8:30 PM"
  onSelectSchedule: (scheduleText: string | null) => void;
}

export const ScheduleOrderModal: React.FC<ScheduleOrderModalProps> = ({
  isOpen,
  onClose,
  selectedSchedule,
  onSelectSchedule
}) => {
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  const [selectedSlot, setSelectedSlot] = useState<string>('8:00 PM - 8:30 PM');

  if (!isOpen) return null;

  const timeSlots = [
    '1:00 PM - 1:30 PM',
    '1:30 PM - 2:00 PM',
    '7:30 PM - 8:00 PM',
    '8:00 PM - 8:30 PM',
    '8:30 PM - 9:00 PM',
    '9:00 PM - 9:30 PM',
    '9:30 PM - 10:00 PM'
  ];

  const handleConfirm = () => {
    const dayLabel = selectedDay === 'today' ? 'Today' : 'Tomorrow';
    onSelectSchedule(`${dayLabel}, ${selectedSlot}`);
    onClose();
  };

  const handleDeliverNow = () => {
    onSelectSchedule(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Schedule Delivery Time</h3>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              display: 'flex',
              color: 'var(--color-text-muted)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="no-scrollbar">
          {/* Deliver Now Option */}
          <div
            onClick={handleDeliverNow}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: !selectedSchedule ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
              border: `1.5px solid ${!selectedSchedule ? 'var(--color-primary)' : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: !selectedSchedule ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: !selectedSchedule ? '#FFFFFF' : 'var(--color-text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
              >
                ⚡
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, display: 'block' }}>
                  Standard Delivery (Instant)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Dispatches immediately • Arrives in 22-26 mins
                </span>
              </div>
            </div>

            {!selectedSchedule && (
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                Active ✓
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 10px' }}>
            <Calendar size={15} color="var(--color-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Or Schedule For Later
            </span>
          </div>

          {/* Day Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {[
              { id: 'today', label: 'Today', sub: 'Dinner slots' },
              { id: 'tomorrow', label: 'Tomorrow', sub: 'Lunch & Dinner' }
            ].map((d) => {
              const isSelected = selectedDay === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id as any)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, display: 'block' }}>{d.label}</span>
                  <span style={{ fontSize: '10px', opacity: 0.9 }}>{d.sub}</span>
                </button>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', display: 'block' }}>
            Available 30-Minute Windows:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-subtle)'}`,
                    fontSize: '11px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '14px', textAlign: 'center' }}>
            We notify the restaurant kitchen 30 mins before your slot to ensure piping hot food!
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleConfirm}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            Confirm Schedule ({selectedDay === 'today' ? 'Today' : 'Tomorrow'}, {selectedSlot})
          </button>
        </div>
      </div>
    </div>
  );
};
