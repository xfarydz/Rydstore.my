export const RAZERPAY_CONFIG = {
  // RazerPay Merchant Details (Malaysia)
  merchantId: process.env.NEXT_PUBLIC_RAZERPAY_MERCHANT_ID || 'your_merchant_id',
  secretKey: process.env.NEXT_PUBLIC_RAZERPAY_SECRET_KEY || 'your_secret_key',
  
  // RazerPay API Endpoints
  endpoints: {
    fpx: 'https://api.razerpay.com/v1/fpx',
    ewallet: 'https://api.razerpay.com/v1/ewallet',
    transaction: 'https://api.razerpay.com/v1/transaction'
  },
  
  // Supported Banks for FPX
  fpxBanks: [
    { code: 'maybank', name: 'Maybank', icon: '🏦' },
    { code: 'cimb', name: 'CIMB Bank', icon: '🏦' },
    { code: 'publicbank', name: 'Public Bank', icon: '🏦' },
    { code: 'rhb', name: 'RHB Bank', icon: '🏦' },
    { code: 'hongleong', name: 'Hong Leong Bank', icon: '🏦' },
    { code: 'ambank', name: 'AmBank', icon: '🏦' },
    { code: 'uob', name: 'UOB Malaysia', icon: '🏦' },
    { code: 'ocbc', name: 'OCBC Bank', icon: '🏦' }
  ],
  
  // Supported E-Wallets
  ewallets: [
    { code: 'grabpay', name: 'GrabPay', icon: '💚' },
    { code: 'touchngo', name: 'Touch n Go eWallet', icon: '💙' },
    { code: 'boost', name: 'Boost', icon: '🚀' },
    { code: 'shopeepay', name: 'ShopeePay', icon: '🛍️' }
  ],
  
  // Currency
  currency: 'MYR',
  
  // Return URLs
  returnUrl: process.env.NEXT_PUBLIC_BASE_URL + '/payment/success',
  cancelUrl: process.env.NEXT_PUBLIC_BASE_URL + '/payment/cancel'
};

// RazerPay API Functions
export const createRazerPayTransaction = async (paymentData: {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: 'fpx' | 'ewallet';
  bankCode?: string;
  ewalletType?: string;
}) => {
  const { amount, currency, orderId, description, customerEmail, customerName, paymentMethod, bankCode, ewalletType } = paymentData;
  
  try {
    // Construct RazerPay API payload
    const payload = {
      merchant_id: RAZERPAY_CONFIG.merchantId,
      amount: (amount * 100).toString(), // Convert to cents
      currency: currency,
      order_id: orderId,
      description: description,
      customer_email: customerEmail,
      customer_name: customerName,
      return_url: RAZERPAY_CONFIG.returnUrl,
      cancel_url: RAZERPAY_CONFIG.cancelUrl,
      payment_method: paymentMethod,
      ...(paymentMethod === 'fpx' && bankCode ? { bank_code: bankCode } : {}),
      ...(paymentMethod === 'ewallet' && ewalletType ? { ewallet_type: ewalletType } : {})
    };
    
    console.log('🔥 Creating RazerPay transaction:', payload);
    
    // For demo purposes, we'll simulate the API call
    // In production, this should be a server-side API call
    
    // Simulate RazerPay response
    const mockResponse = {
      status: 'success',
      transaction_id: 'rzp_' + Date.now(),
      payment_url: `https://pay.razerpay.com/payment/${orderId}?method=${paymentMethod}&bank=${bankCode}&ewallet=${ewalletType}`,
      redirect_url: paymentMethod === 'fpx' 
        ? `https://secure.razerpay.com/fpx?order_id=${orderId}&bank=${bankCode}`
        : `https://secure.razerpay.com/ewallet?order_id=${orderId}&type=${ewalletType}`
    };
    
    console.log('✅ RazerPay transaction created:', mockResponse);
    return mockResponse;
    
  } catch (error) {
    console.error('❌ RazerPay transaction failed:', error);
    throw error;
  }
};

export const redirectToRazerPay = (paymentUrl: string) => {
  console.log('🔄 Redirecting to RazerPay:', paymentUrl);
  window.open(paymentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
};