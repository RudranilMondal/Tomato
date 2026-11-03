import React from 'react';
import { CustomerApp } from './customer/CustomerApp';
import { PartnerApp } from './partner/PartnerApp';
import { RiderApp } from './rider/RiderApp';
import { AdminApp } from './admin/AdminApp';
import { Smartphone, Store, Bike, LayoutDashboard, Activity, Maximize2, Zap } from 'lucide-react';
import { useTomattto } from '../context/TomatttoContext';

export const EcosystemQuadView: React.FC = () => {
  const { setAppMode, incomingOrder, riderDeliveryRequest, currentOrder } = useTomattto();

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0F0F14',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Top Banner Status Bar */}
      <div
        style={{
          backgroundColor: '#1A1A24',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#2ECC71',
              boxShadow: '0 0 10px #2ECC71',
              animation: 'pulse 1.5s infinite'
            }}
          />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Tomattto 360° Ecosystem Command Center (Quad-View Simulator)
            </h3>
            <p style={{ fontSize: '11px', color: '#A5A5B2', margin: 0 }}>
              All 4 applications running concurrently with real-time state synchronization
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#FFFFFF' }}>
            <span style={{ backgroundColor: 'rgba(255,75,58,0.2)', color: '#FF6B6B', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid rgba(255,75,58,0.3)' }}>
              1. Customer
            </span>
            <span style={{ color: '#A5A5B2' }}>➔</span>
            <span style={{ backgroundColor: incomingOrder ? 'rgba(241,196,15,0.25)' : 'rgba(255,255,255,0.06)', color: incomingOrder ? '#F1C40F' : '#A5A5B2', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              2. Kitchen KOT {incomingOrder ? '🔔 Alert' : ''}
            </span>
            <span style={{ color: '#A5A5B2' }}>➔</span>
            <span style={{ backgroundColor: riderDeliveryRequest ? 'rgba(46,204,113,0.25)' : 'rgba(255,255,255,0.06)', color: riderDeliveryRequest ? '#2ECC71' : '#A5A5B2', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              3. Rider Dispatch {riderDeliveryRequest ? '⚡ Request' : ''}
            </span>
            <span style={{ color: '#A5A5B2' }}>➔</span>
            <span style={{ backgroundColor: 'rgba(52,152,219,0.2)', color: '#3498DB', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
              4. Admin HQ
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Quad Grid Layout */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(380px, 1fr) minmax(480px, 1.4fr)',
          gridTemplateRows: 'minmax(420px, 1fr) minmax(420px, 1fr)',
          gap: '16px',
          minHeight: '840px'
        }}
      >
        {/* Quadrant 1: Customer App */}
        <div
          style={{
            backgroundColor: '#16161E',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#1F1F2C',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                Customer App (Demand Side)
              </span>
            </div>
            <button
              onClick={() => setAppMode('customer')}
              style={{
                background: 'none',
                border: 'none',
                color: '#A5A5B2',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Expand to Fullscreen"
            >
              <Maximize2 size={13} />
              <span>Full View</span>
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ width: '100%', maxWidth: '420px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CustomerApp />
            </div>
          </div>
        </div>

        {/* Quadrant 2: Restaurant Partner App */}
        <div
          style={{
            backgroundColor: '#16161E',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#1F1F2C',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={16} color="#F39C12" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                Restaurant Partner Kitchen Console (Supply Side)
              </span>
              {incomingOrder && (
                <span
                  style={{
                    backgroundColor: '#FF4B3A',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    animation: 'pulse 1s infinite'
                  }}
                >
                  NEW ORDER!
                </span>
              )}
            </div>
            <button
              onClick={() => setAppMode('partner')}
              style={{
                background: 'none',
                border: 'none',
                color: '#A5A5B2',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Expand to Fullscreen"
            >
              <Maximize2 size={13} />
              <span>Full View</span>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
            <PartnerApp />
          </div>
        </div>

        {/* Quadrant 3: Delivery Rider App */}
        <div
          style={{
            backgroundColor: '#16161E',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#1F1F2C',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bike size={16} color="#2ECC71" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                Delivery Rider Partner (Logistics Side)
              </span>
              {riderDeliveryRequest && (
                <span
                  style={{
                    backgroundColor: '#2ECC71',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    animation: 'pulse 1s infinite'
                  }}
                >
                  DISPATCH REQ!
                </span>
              )}
            </div>
            <button
              onClick={() => setAppMode('rider')}
              style={{
                background: 'none',
                border: 'none',
                color: '#A5A5B2',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Expand to Fullscreen"
            >
              <Maximize2 size={13} />
              <span>Full View</span>
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
            <div style={{ width: '100%', maxWidth: '420px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <RiderApp />
            </div>
          </div>
        </div>

        {/* Quadrant 4: Admin HQ Console */}
        <div
          style={{
            backgroundColor: '#16161E',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#1F1F2C',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutDashboard size={16} color="#3498DB" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                Admin HQ Command Operations (Control Side)
              </span>
            </div>
            <button
              onClick={() => setAppMode('admin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#A5A5B2',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Expand to Fullscreen"
            >
              <Maximize2 size={13} />
              <span>Full View</span>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
            <AdminApp />
          </div>
        </div>
      </div>
    </div>
  );
};
