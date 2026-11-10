import React from 'react';
import { CompletedTrip } from '../../types';
import { X, Bike, MapPin, DollarSign, Clock, CheckCircle2, ChevronRight, Navigation } from 'lucide-react';

interface RiderTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripsToday: number;
  earningsToday: number;
  completedTrips?: CompletedTrip[];
}

const PAST_TRIPS: CompletedTrip[] = [
  {
    id: 'TRIP-108',
    orderNumber: 'TOM-8921',
    restaurantName: 'Meghana Foods',
    restaurantArea: 'Indiranagar 100ft Rd',
    customerName: 'Rahul Verma',
    customerArea: 'Defence Colony, 4th Cross',
    distanceKm: 3.2,
    durationMins: 19,
    deliveryFee: 45,
    customerTip: 30,
    surgeBonus: 15,
    totalPayout: 90,
    completedAt: 'Today, 1:42 PM',
    status: 'Completed'
  },
  {
    id: 'TRIP-107',
    orderNumber: 'TOM-8845',
    restaurantName: 'Truffles',
    restaurantArea: 'Koramangala 5th Block',
    customerName: 'Priya Sundaram',
    customerArea: 'Sony World Signal, 7th Block',
    distanceKm: 2.1,
    durationMins: 14,
    deliveryFee: 40,
    customerTip: 20,
    surgeBonus: 0,
    totalPayout: 60,
    completedAt: 'Today, 12:15 PM',
    status: 'Completed'
  },
  {
    id: 'TRIP-106',
    orderNumber: 'TOM-8712',
    restaurantName: 'Leon Grill',
    restaurantArea: 'Indiranagar Metro',
    customerName: 'Arjun Das',
    customerArea: 'HAL 2nd Stage, Doopanahalli',
    distanceKm: 4.5,
    durationMins: 24,
    deliveryFee: 55,
    customerTip: 50,
    surgeBonus: 20,
    totalPayout: 125,
    completedAt: 'Today, 11:20 AM',
    status: 'Completed'
  },
  {
    id: 'TRIP-105',
    orderNumber: 'TOM-8650',
    restaurantName: 'Chai Point',
    restaurantArea: 'Domlur Flyover',
    customerName: 'Sneha Patel',
    customerArea: 'Embassy Golf Links, Tower D',
    distanceKm: 1.8,
    durationMins: 11,
    deliveryFee: 35,
    customerTip: 10,
    surgeBonus: 0,
    totalPayout: 45,
    completedAt: 'Today, 10:05 AM',
    status: 'Completed'
  }
];

export const RiderTripsModal: React.FC<RiderTripsModalProps> = ({
  isOpen,
  onClose,
  tripsToday,
  earningsToday,
  completedTrips
}) => {
  if (!isOpen) return null;

  const tripsList = completedTrips && completedTrips.length > 0 ? completedTrips : PAST_TRIPS;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '460px',
          maxHeight: '90vh',
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
        {/* Header */}
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
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 75, 58, 0.15)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bike size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Delivery Trips Log</h3>
              <p style={{ fontSize: '11px', color: '#A5A5B2' }}>
                {tripsToday} trips completed today • ₹{earningsToday} earned
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#A5A5B2'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Trips Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Total Distance</span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>11.6 km</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Avg Payout/Trip</span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-veg)' }}>₹80</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Customer Tips</span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F39C12' }}>₹110</div>
          </div>
        </div>

        {/* Trips List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          className="no-scrollbar"
        >
          {tripsList.map((trip) => (
            <div
              key={trip.id}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: 'rgba(46, 204, 113, 0.15)',
                      color: 'var(--color-veg)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={11} />
                    {trip.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#A5A5B2' }}>#{trip.orderNumber}</span>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-veg)' }}>
                  +₹{trip.totalPayout}
                </span>
              </div>

              {/* Route */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                  <div>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{trip.restaurantName}</span>
                    <span style={{ color: '#8E8E93', fontSize: '11px' }}> • {trip.restaurantArea}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-veg)' }} />
                  <div>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{trip.customerName}</span>
                    <span style={{ color: '#8E8E93', fontSize: '11px' }}> • {trip.customerArea}</span>
                  </div>
                </div>
              </div>

              {/* Trip breakdown tags */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '11px',
                  color: '#A5A5B2'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span>📍 {trip.distanceKm} km</span>
                  <span>⏱️ {trip.durationMins} mins</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>Base: ₹{trip.deliveryFee}</span>
                  {trip.customerTip > 0 && <span style={{ color: '#F39C12' }}>Tip: +₹{trip.customerTip}</span>}
                  {trip.surgeBonus > 0 && <span style={{ color: '#3498DB' }}>Surge: +₹{trip.surgeBonus}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#17171C',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '12px', color: '#A5A5B2' }}>Payout cycle: Daily at 11:59 PM</span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            Close Log
          </button>
        </div>
      </div>
    </div>
  );
};
