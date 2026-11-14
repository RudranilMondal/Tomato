/**
 * Development Demo Authentication Module for Tomattto Delivery Rider
 * 
 * Safety & Isolation Guarantees:
 * 1. Strictly restricted to development environments (import.meta.env.DEV).
 * 2. Disabled and stripped in production builds.
 * 3. Does NOT send real SMS messages or call paid SMS gateways.
 * 4. Does NOT bypass Supabase RLS or generate forged JWT tokens.
 * 5. Uses fixed demo OTP: 123456.
 */

export interface DemoRiderUser {
  id: string;
  phone: string;
  fullName: string;
  role: 'rider';
  isDemo: true;
  createdAt: string;
}

export interface DemoPartnerUser {
  id: string;
  phone: string;
  fullName: string;
  role: 'restaurant_owner';
  email?: string;
  isDemo: true;
  restaurantId?: string;
  createdAt: string;
}

export type DemoAuthRole = 'customer' | 'restaurant_owner' | 'rider';

export const DEMO_OTP_CODE = '123456';
export const DEMO_OTP_BANNER_TEXT = 'Development Demo — OTP authentication is simulated.';

export const DEMO_RESTAURANT_PARTNER: DemoPartnerUser = {
  id: 'demo-partner-001',
  phone: '+919876543210',
  fullName: 'Royal Biryani House (Demo Owner)',
  role: 'restaurant_owner',
  email: 'partner@demo.tomattto.com',
  restaurantId: '1',
  isDemo: true,
  createdAt: '2026-01-01T00:00:00Z'
};

export const DEMO_RIDER_USER: DemoRiderUser = {
  id: 'demo-rider-001',
  phone: '+919845192831',
  fullName: 'Vikram Singh',
  role: 'rider',
  isDemo: true,
  createdAt: '2026-01-01T00:00:00Z'
};

export const getDemoAccountForRole = (role: DemoAuthRole) => {
  if (role === 'restaurant_owner') return DEMO_RESTAURANT_PARTNER;
  if (role === 'rider') return DEMO_RIDER_USER;
  return {
    id: 'demo-customer-001',
    phone: '+919876543211',
    fullName: 'Rahul Sharma',
    role: 'customer' as const,
    isDemo: true
  };
};

/**
 * Returns true strictly in Vite development mode.
 * In production builds, this returns false to prevent demo auth usage.
 */
export const isDemoAuthEnabled = (): boolean => {
  return Boolean(import.meta.env.DEV);
};

export interface DemoOtpResponse {
  success: boolean;
  message: string;
  formattedPhone?: string;
  error?: string;
}

export interface DemoVerifyResponse {
  success: boolean;
  user?: DemoRiderUser;
  partnerUser?: DemoPartnerUser;
  error?: string;
}

/**
 * Simulates requesting an OTP for a phone number in development.
 */
export const requestDemoOtp = async (phone: string): Promise<DemoOtpResponse> => {
  if (!isDemoAuthEnabled()) {
    return {
      success: false,
      message: 'Demo authentication is disabled in production builds.',
      error: 'DEMO_AUTH_DISABLED'
    };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return {
      success: false,
      message: 'Please enter a valid 10-digit mobile number.',
      error: 'INVALID_PHONE'
    };
  }

  const formattedPhone = `+91${cleanPhone.slice(-10)}`;

  // Simulated short network delay for realistic UI transition
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    success: true,
    formattedPhone,
    message: `${DEMO_OTP_BANNER_TEXT} Enter demo OTP: ${DEMO_OTP_CODE}`
  };
};

/**
 * Verifies the demo OTP against the fixed code '123456'.
 */
export const verifyDemoOtp = async (
  phone: string,
  enteredToken: string,
  fullName?: string,
  role: DemoAuthRole = 'rider'
): Promise<DemoVerifyResponse> => {
  if (!isDemoAuthEnabled()) {
    return {
      success: false,
      error: 'Demo authentication is disabled in production builds.'
    };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = `+91${cleanPhone.slice(-10)}`;

  // Simulated short verification latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (enteredToken.trim() !== DEMO_OTP_CODE) {
    return {
      success: false,
      error: `Invalid verification code. For this development demo, use OTP: ${DEMO_OTP_CODE}`
    };
  }

  if (role === 'restaurant_owner') {
    const demoId = `demo-rest-${cleanPhone.slice(-6)}`;
    const resolvedName = fullName?.trim() || 'Demo Restaurant Partner';
    const partnerUser: DemoPartnerUser = {
      id: demoId,
      phone: formattedPhone,
      fullName: resolvedName,
      role: 'restaurant_owner',
      isDemo: true,
      createdAt: new Date().toISOString()
    };
    return {
      success: true,
      partnerUser
    };
  }

  // Generate deterministic/stable demo user ID for this phone number
  const demoId = `demo-rdr-${cleanPhone.slice(-6)}`;
  const resolvedName = fullName?.trim() || 'Demo Rider Partner';

  const demoUser: DemoRiderUser = {
    id: demoId,
    phone: formattedPhone,
    fullName: resolvedName,
    role: 'rider',
    isDemo: true,
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    user: demoUser
  };
};
