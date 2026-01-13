// Payment configuration for RydStore.my
declare const process: {
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    NEXT_PUBLIC_PAYPAL_CLIENT_ID?: string;
    NEXT_PUBLIC_XENDIT_PUBLIC_KEY?: string;
  }
}

export const paymentConfig = {
  // Stripe (Recommended for Malaysia)
  stripe: {
    publishableKey: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : '',
    currency: 'myr', // Malaysian Ringgit
    fee: '2.9% + RM1.50 per transaction',
    features: ['cards', 'fpx', 'grabpay', 'boost'],
    description: 'International cards + Local Malaysian methods'
  },
  
  // PayPal (Backup option)
  paypal: {
    clientId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID : '',
    currency: 'MYR',
    fee: '3.4% + RM2 per transaction',
    description: 'PayPal checkout with buyer protection'
  },
  
  // Xendit (SEA focused)
  xendit: {
    publicKey: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_XENDIT_PUBLIC_KEY : '',
    currency: 'MYR',
    fee: '2.9% per transaction',
    localMethods: ['fpx', 'maybank', 'cimb', 'rhb'],
    description: 'Local Malaysian banking methods'
  }
}

export const supportedPaymentMethods = [
  'Credit/Debit Cards',
  'FPX Online Banking',
  'GrabPay',
  'Boost',
  'PayPal',
  'Bank Transfer'
]