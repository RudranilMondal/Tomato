import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { Order } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const invoiceNumber = `TOM-INV-${order.id.replace(/[^0-9]/g, '') || '84920'}`;
  const orderDate = order.createdAt || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `
======================================================
           TOMATTTO LOGISTICS PVT. LTD.
           TAX INVOICE / CASH MEMO
======================================================
Invoice No:    ${invoiceNumber}
Date & Time:   ${orderDate}
Order ID:      ${order.id}
GSTIN:         29AABCT1337M1Z4
FSSAI Lic:     11221334000542

CUSTOMER DETAILS:
Delivered to:  ${order.deliveryAddress.label}
Address:       ${order.deliveryAddress.addressLine}
${order.deliveryAddress.landmark ? `Landmark:      ${order.deliveryAddress.landmark}` : ''}

RESTAURANT DETAILS:
Restaurant:    ${order.restaurant.name}
Cuisine:       ${order.restaurant.tagline}
FSSAI Lic:     11223998000129

------------------------------------------------------
ITEMS ORDERED:
------------------------------------------------------
${order.items.map((item, idx) => `${idx + 1}. ${item.quantity}x ${item.menuItem.name} - ₹${item.itemTotal}`).join('\n')}

------------------------------------------------------
BILL BREAKDOWN:
------------------------------------------------------
Items Subtotal:          ₹${order.itemTotal}
Delivery Partner Fee:    ₹${order.deliveryFee}
Platform Handling Fee:   ₹${order.platformFee}
Taxes (GST 5%):          ₹${order.taxAmount}
${order.discountAmount > 0 ? `Discount (${order.appliedCoupon?.code || 'OFFER'}): -₹${order.discountAmount}` : ''}
${order.tipAmount > 0 ? `Rider Tip:               ₹${order.tipAmount}` : ''}
------------------------------------------------------
TOTAL PAID:              ₹${order.totalAmount}
Payment Mode:            ${order.paymentMethod.toUpperCase()} (TXN-SUCCESS)
------------------------------------------------------
Thank you for ordering with Tomattto!
Support: concierge@tomattto.com | 1800-TOMATTTO
======================================================
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 2500,
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
          maxWidth: '520px',
          maxHeight: '92vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Tax Invoice & Receipt</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid var(--color-border)'
              }}
              title="Print Invoice"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadText}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(255, 75, 58, 0.2)'
              }}
              title="Download text receipt"
            >
              <Download size={13} />
              <span>Download</span>
            </button>

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
        </div>

        {/* Scrollable Printable Invoice Sheet */}
        <div
          ref={invoiceRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            fontSize: '13px'
          }}
          className="no-scrollbar"
        >
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: '16px',
              borderBottom: '2px dashed var(--color-border)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '20px' }}>🍅</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                  Tomattto
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Tomattto Logistics India Pvt. Ltd.
              </p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                GSTIN: 29AABCT1337M1Z4 • FSSAI: 11221334000542
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-veg-bg)',
                  color: 'var(--color-veg)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-block',
                  marginBottom: '4px'
                }}
              >
                TAX INVOICE
              </span>
              <p style={{ fontSize: '11px', fontWeight: 800 }}>{invoiceNumber}</p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{orderDate}</p>
            </div>
          </div>

          {/* Restaurant & Customer Meta */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '14px 0',
              borderBottom: '1px solid var(--color-border-subtle)'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Billed By (Merchant)
              </span>
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>{order.restaurant.name}</h4>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{order.restaurant.tagline}</p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>FSSAI: 11223998000129</p>
            </div>

            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                Billed To (Customer)
              </span>
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>{order.deliveryAddress.label}</h4>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{order.deliveryAddress.addressLine}</p>
              {order.deliveryAddress.landmark && (
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Near {order.deliveryAddress.landmark}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase'
              }}
            >
              <span>Item</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Tax</span>
              <span style={{ textAlign: 'right' }}>Amount</span>
            </div>

            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  fontSize: '12px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700 }}>{item.menuItem.name}</span>
                  {item.selectedVariant && (
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      Variant: {item.selectedVariant.name}
                    </span>
                  )}
                </div>
                <span style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                <span style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '11px' }}>5% GST</span>
                <span style={{ textAlign: 'right', fontWeight: 700 }}>₹{item.itemTotal}</span>
              </div>
            ))}
          </div>

          {/* Detailed Tax & Breakdown */}
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              <span>Items Net Subtotal</span>
              <span>₹{order.itemTotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              <span>Delivery Partner Convenience Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              <span>Tomattto Platform Fee</span>
              <span>₹{order.platformFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              <span>Central & State GST (CGST 2.5% + SGST 2.5%)</span>
              <span>₹{order.taxAmount}</span>
            </div>

            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-veg)', fontSize: '12px', fontWeight: 700 }}>
                <span>Offer Discount ({order.appliedCoupon?.code || 'COUPON'})</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}

            {order.tipAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                <span>Delivery Hero Tip (Direct Payout)</span>
                <span>₹{order.tipAmount}</span>
              </div>
            )}

            {/* Total Paid Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                marginTop: '6px',
                borderTop: '2px solid var(--color-border)',
                fontSize: '15px',
                fontWeight: 900
              }}
            >
              <span>Total Amount Paid</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Payment & Security Badge */}
          <div
            style={{
              marginTop: '18px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--color-veg)" />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>Payment Method: {order.paymentMethod.toUpperCase()}</span>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  Ref: TXN-TOM-{order.id.slice(0, 8)} • 100% Verified
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              <ShieldCheck size={14} color="var(--color-veg)" />
              <span>Digitally Signed</span>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '10px' }}>
            This is a computer-generated tax invoice. No signature required.
            <br />
            Need assistance? Email concierge@tomattto.com or call 1800-TOMATTTO.
          </div>
        </div>
      </div>
    </div>
  );
};
