// PayPal configuration - FREE setup
export const paypalConfig = {
  // PayPal Business Account (FREE)
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'your-paypal-client-id',
  currency: 'MYR', // Malaysian Ringgit
  
  // PayPal fees (no setup cost)
  fees: {
    domestic: '3.4% + RM2.00',
    international: '4.4% + RM2.00'
  },
  
  // Sandbox for testing
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
}

// Alternative FREE methods
export const freePaymentMethods = [
  {
    name: 'PayPal',
    setup: 'FREE',
    fee: '3.4% + RM2',
    time: '5 minutes',
    description: 'Accept credit cards + PayPal payments'
  },
  {
    name: 'Bank Transfer',
    setup: 'FREE',
    fee: 'FREE (manual)',
    time: '1 minute',
    description: 'Customer transfer to your bank account'
  },
  {
    name: 'WhatsApp Payment',
    setup: 'FREE',
    fee: 'FREE',
    time: '1 minute', 
    description: 'Coordinate payment via WhatsApp'
  }
]