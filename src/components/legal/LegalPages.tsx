import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Trash2, FileText, Headphones, CheckCircle2, Mail, MapPin, ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = 'November 27, 2026',
  children
}) => {
  const location = useLocation();
  const navItems = [
    { path: '/privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
    { path: '/delete-account', label: 'Account Deletion', icon: Trash2 },
    { path: '/terms', label: 'Terms of Service', icon: FileText },
    { path: '/support', label: 'Support & Contact', icon: Headphones }
  ];

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#FFF8F5',
        color: '#1E1E24',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EFE4DF',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#1E1E24'
            }}
          >
            <img
              src="/logo.png"
              alt="G1 Bites"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(240, 74, 0, 0.2)'
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1.1, color: '#F04A00' }}>
                G1 Bites
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>
                Legal &amp; Compliance Center
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    backgroundColor: active ? '#F04A00' : '#FFF1EB',
                    color: active ? '#FFFFFF' : '#9A3412',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: '880px',
          width: '100%',
          margin: '0 auto',
          padding: '32px 20px 56px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 30px rgba(30, 30, 36, 0.06)',
            border: '1px solid #F3E8E2'
          }}
        >
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #F3E8E2', paddingBottom: '20px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                margin: '0 0 8px',
                color: '#1E1E24',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              {title}
            </h1>
            <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#4B5563', lineHeight: 1.5 }}>
              {subtitle}
            </p>
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
              Last updated: {lastUpdated} · Applies to G1 Bites, G1 Bites Partner, G1 Bites Rider &amp; G1 Bites Admin
            </div>
          </div>

          <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{children}</div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#F04A00',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={15} /> Back to G1 Bites App
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#1E1E24',
          color: '#D1D5DB',
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '13px'
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            G1 Bites Food Ordering &amp; Delivery Platform
          </div>
          <div>
            Questions? Contact <a href="mailto:support@g1bites.com" style={{ color: '#FF7A45' }}>support@g1bites.com</a> ·{' '}
            <a href="mailto:privacy@g1bites.com" style={{ color: '#FF7A45' }}>privacy@g1bites.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Section: React.FC<{ heading: string; children: React.ReactNode }> = ({ heading, children }) => (
  <section style={{ marginBottom: '24px' }}>
    <h2
      style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#1E1E24',
        margin: '0 0 10px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {heading}
    </h2>
    {children}
  </section>
);

export const PrivacyPolicyPage: React.FC = () => (
  <LegalLayout
    title="Privacy Policy"
    subtitle="How G1 Bites collects, uses, stores, and protects your personal information across our Customer, Restaurant Partner, Delivery Rider, and Admin applications."
  >
    <Section heading="1. Overview">
      <p>
        G1 Bites (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the G1 Bites Customer app
        (<code>com.g1bites.customer</code>), G1 Bites Partner app (<code>com.g1bites.partner</code>), G1 Bites Rider
        app (<code>com.g1bites.rider</code>), and G1 Bites Admin console (<code>com.g1bites.admin</code>). This Privacy
        Policy explains what information we collect, why we collect it, and how you can manage or delete your data.
      </p>
    </Section>

    <Section heading="2. Information We Collect">
      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
        <li>
          <strong>Account &amp; Profile Information:</strong> Name, email address, phone number, and saved delivery
          addresses provided during sign-up or profile updates.
        </li>
        <li>
          <strong>Location Data:</strong> Precise or approximate GPS location used to display nearby restaurants,
          calculate delivery fees/ETAs, and enable live order tracking and rider navigation.
        </li>
        <li>
          <strong>Order &amp; Transaction Data:</strong> Cart items, order history, invoices, and payment status.
          Online payments are processed securely by Razorpay; G1 Bites does not store raw credit/debit card numbers
          or UPI PINs.
        </li>
        <li>
          <strong>Partner &amp; Rider KYC Data:</strong> For restaurant partners and delivery riders, we collect
          business registration (FSSAI, GST, PAN), driver&rsquo;s license, vehicle details, bank payout details, and
          verification selfies strictly for onboarding and regulatory compliance.
        </li>
        <li>
          <strong>Device &amp; App Diagnostics:</strong> Basic device type, OS version, crash logs, and notification
          preferences to maintain app stability and security.
        </li>
      </ul>
    </Section>

    <Section heading="3. How We Use Your Information">
      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
        <li>Process, prepare, dispatch, and deliver food orders in real time.</li>
        <li>Verify partner and delivery rider identities and process settlements/payouts.</li>
        <li>Provide customer support, resolve order issues, and send order status updates.</li>
        <li>Prevent fraud, unauthorized access, and abuse across the platform.</li>
      </ul>
    </Section>

    <Section heading="4. Third-Party Services &amp; Data Sharing">
      <p>
        We never sell your personal data. We share data only as necessary to operate the service with trusted
        infrastructure providers:
      </p>
      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
        <li><strong>Supabase &amp; Firebase:</strong> Authentication, encrypted database storage, and KYC file storage.</li>
        <li><strong>Razorpay:</strong> PCI-DSS compliant payment processing.</li>
        <li><strong>Mapping &amp; Geocoding Providers:</strong> Address lookup and delivery route estimation.</li>
        <li><strong>Order Fulfillment:</strong> Your delivery address and contact number (masked where supported) are shared with the assigned restaurant and delivery partner solely to complete your order.</li>
      </ul>
    </Section>

    <Section heading="5. Data Security &amp; Retention">
      <p>
        All data is transmitted over HTTPS/TLS encryption and stored with role-based access controls. We retain
        account data while your account is active and retain tax/invoice records only as required by applicable law.
      </p>
    </Section>

    <Section heading="6. Your Rights &amp; Data Deletion">
      <p>
        You may access, update, or request permanent deletion of your account and personal data at any time via our{' '}
        <Link to="/delete-account" style={{ color: '#F04A00', fontWeight: 600 }}>
          Account &amp; Data Deletion page
        </Link>{' '}
        or by emailing <a href="mailto:privacy@g1bites.com" style={{ color: '#F04A00' }}>privacy@g1bites.com</a>.
      </p>
    </Section>

    <Section heading="7. Children&rsquo;s Privacy">
      <p>
        G1 Bites is not intended for children under 13 years of age (or the applicable minimum age in your
        jurisdiction). We do not knowingly collect personal information from children.
      </p>
    </Section>
  </LegalLayout>
);

export const AccountDeletionPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [portal, setPortal] = useState('Customer (G1 Bites)');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setSubmitted(true);
  };

  return (
    <LegalLayout
      title="Account & Data Deletion"
      subtitle="Request permanent deletion of your G1 Bites account and associated personal data across any of our apps."
    >
      <Section heading="1. How to Delete Your Account">
        <p>You can delete your G1 Bites account in two ways:</p>
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          <li>
            <strong>In-App:</strong> Open <em>Profile &rarr; Settings &rarr; Delete Account</em> inside the G1 Bites
            app.
          </li>
          <li>
            <strong>Web Request:</strong> Submit the deletion request form below or email{' '}
            <a href="mailto:privacy@g1bites.com" style={{ color: '#F04A00' }}>privacy@g1bites.com</a> from your
            registered email address.
          </li>
        </ul>
      </Section>

      <Section heading="2. What Data Is Deleted vs. Retained">
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          <li>
            <strong>Deleted within 7 business days:</strong> Profile details (name, phone, email), saved delivery
            addresses, favorites, notification tokens, and active session credentials.
          </li>
          <li>
            <strong>Retained for legal compliance:</strong> Completed order invoices, tax records, and partner/rider
            payout ledgers may be retained in anonymized or restricted form for up to 7 years as required by financial
            and tax regulations.
          </li>
        </ul>
      </Section>

      <Section heading="3. Submit a Deletion Request">
        {submitted ? (
          <div
            style={{
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Deletion Request Received</div>
              <div style={{ fontSize: '14px' }}>
                We have logged your account deletion request for <strong>{identifier}</strong> ({portal}). Our privacy
                team will verify ownership and complete deletion within 7 business days.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', maxWidth: '520px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                App / Account Type
              </label>
              <select
                value={portal}
                onChange={(e) => setPortal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option>Customer (G1 Bites)</option>
                <option>Restaurant Partner (G1 Bites Partner)</option>
                <option>Delivery Rider (G1 Bites Rider)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Registered Email or Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. user@example.com or +91 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Reason (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Optional feedback..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#F04A00',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              Request Account Deletion
            </button>
          </form>
        )}
      </Section>
    </LegalLayout>
  );
};

export const TermsPage: React.FC = () => (
  <LegalLayout
    title="Terms of Service"
    subtitle="Terms governing the use of G1 Bites applications for customers, restaurant partners, and delivery riders."
  >
    <Section heading="1. Acceptance of Terms">
      <p>
        By accessing or using any G1 Bites application, you agree to be bound by these Terms of Service and our{' '}
        <Link to="/privacy-policy" style={{ color: '#F04A00', fontWeight: 600 }}>Privacy Policy</Link>.
      </p>
    </Section>
    <Section heading="2. Ordering, Pricing &amp; Payments">
      <p>
        Menu prices, taxes, packaging charges, and delivery fees are displayed prior to checkout. Payments may be
        completed via UPI, cards, wallets, or Cash on Delivery where available. Refunds for cancelled or undelivered
        orders are processed to the original payment method or G1 Bites Wallet.
      </p>
    </Section>
    <Section heading="3. Partner &amp; Rider Obligations">
      <p>
        Restaurant partners are responsible for food quality, hygiene, accurate menu pricing, and valid FSSAI/tax
        registrations. Delivery riders agree to maintain valid driving licenses, vehicle insurance, and follow traffic
        laws during deliveries.
      </p>
    </Section>
    <Section heading="4. Account Termination">
      <p>
        We reserve the right to suspend or terminate accounts involved in fraudulent transactions, abuse, or policy
        violations.
      </p>
    </Section>
  </LegalLayout>
);

export const SupportPage: React.FC = () => (
  <LegalLayout
    title="Support & Contact"
    subtitle="Official developer contact details, customer support, and business information for G1 Bites."
  >
    <Section heading="1. Contact Details">
      <div style={{ display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mail size={18} color="#F04A00" />
          <div>
            <strong>Customer &amp; App Support:</strong>{' '}
            <a href="mailto:support@g1bites.com" style={{ color: '#F04A00' }}>support@g1bites.com</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="#F04A00" />
          <div>
            <strong>Privacy &amp; Data Protection:</strong>{' '}
            <a href="mailto:privacy@g1bites.com" style={{ color: '#F04A00' }}>privacy@g1bites.com</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={18} color="#F04A00" />
          <div>
            <strong>Operating Region:</strong> India
          </div>
        </div>
      </div>
    </Section>

    <Section heading="2. Apps Covered">
      <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
        <li><strong>G1 Bites</strong> (<code>com.g1bites.customer</code>) — Food Ordering &amp; Delivery</li>
        <li><strong>G1 Bites Partner</strong> (<code>com.g1bites.partner</code>) — Restaurant Management</li>
        <li><strong>G1 Bites Rider</strong> (<code>com.g1bites.rider</code>) — Delivery Partner App</li>
        <li><strong>G1 Bites Admin</strong> (<code>com.g1bites.admin</code>) — Operations Console</li>
      </ul>
    </Section>
  </LegalLayout>
);
