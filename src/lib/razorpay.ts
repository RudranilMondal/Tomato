// Razorpay Client-Side Payment Gateway Integration
// Supports test mode ₹1 transactions via VITE_RAZORPAY_TEST_ONE_RUPEE

export interface RazorpayPaymentOptions {
  amountInRupees: number;
  orderId?: string;
  restaurantName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Dynamically load Razorpay standard checkout script
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay] Failed to load checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Trigger Razorpay payment popup
export async function openRazorpayCheckout(
  options: RazorpayPaymentOptions
): Promise<RazorpaySuccessResponse> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('VITE_RAZORPAY_KEY_ID is not configured in environment.');
  }

  const isOneRupeeTest = import.meta.env.VITE_RAZORPAY_TEST_ONE_RUPEE === 'true';
  // When test mode is true: UI displays normal pricing, but passes ₹1 (100 paise) to Razorpay
  const payablePaise = isOneRupeeTest ? 100 : Math.round(options.amountInRupees * 100);

  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: keyId,
      amount: payablePaise,
      currency: 'INR',
      name: 'G1Bites Food Delivery',
      description: options.restaurantName
        ? `Order from ${options.restaurantName} (₹${options.amountInRupees})`
        : `Food Order (₹${options.amountInRupees})`,
      image: '/logo.png',
      prefill: {
        name: options.customerName || 'Customer',
        email: options.customerEmail || 'customer@g1bites.delivery',
        contact: options.customerPhone || '9876543210',
      },
      theme: {
        color: '#E23744',
      },
      handler: function (response: RazorpaySuccessResponse) {
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          reject(new Error('PAYMENT_CANCELLED'));
        },
      },
    };

    try {
      const rzpInstance = new window.Razorpay(rzpOptions);
      rzpInstance.on('payment.failed', function (resp: any) {
        reject(new Error(resp?.error?.description || 'Payment transaction failed'));
      });
      rzpInstance.open();
    } catch (err: any) {
      reject(err);
    }
  });
}

