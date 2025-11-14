export const TOYYIBPAY_CONFIG = {
  // ToyyibPay API Configuration
  userSecretKey: process.env.NEXT_PUBLIC_TOYYIBPAY_SECRET_KEY || 'your_secret_key',
  categoryCode: process.env.NEXT_PUBLIC_TOYYIBPAY_CATEGORY_CODE || 'your_category_code',
  
  // ToyyibPay API Endpoints
  endpoints: {
    createBill: 'https://toyyibpay.com/index.php/api/createBill',
    getBillTransactions: 'https://toyyibpay.com/index.php/api/getBillTransactions',
    getPaymentStatus: 'https://toyyibpay.com/index.php/api/getBillTransactions'
  },
  
  // Supported Banks for FPX
  fpxBanks: [
    { code: 'maybank2u', name: 'Maybank2u', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Maybank_Logo.svg/100px-Maybank_Logo.svg.png' },
    { code: 'cimb', name: 'CIMB Clicks', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/CIMB_Bank_Logo.svg/100px-CIMB_Bank_Logo.svg.png' },
    { code: 'public-bank', name: 'Public Bank', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Public_Bank_Logo.svg/100px-Public_Bank_Logo.svg.png' },
    { code: 'rhb', name: 'RHB Bank', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/RHB_Bank_Logo.svg/100px-RHB_Bank_Logo.svg.png' },
    { code: 'hong-leong-bank', name: 'Hong Leong Bank', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Hong_Leong_Bank_Logo.svg/100px-Hong_Leong_Bank_Logo.svg.png' },
    { code: 'ambank', name: 'AmBank', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/AmBank_Logo.svg/100px-AmBank_Logo.svg.png' },
    { code: 'uob', name: 'UOB Malaysia', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/UOB_Logo.svg/100px-UOB_Logo.svg.png' },
    { code: 'bsn', name: 'Bank Simpanan Nasional', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/BSN_Logo.svg/100px-BSN_Logo.svg.png' },
    { code: 'bank-islam', name: 'Bank Islam', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Bank_Islam_Malaysia_logo.svg/100px-Bank_Islam_Malaysia_logo.svg.png' },
    { code: 'muamalat', name: 'Bank Muamalat', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Bank_Muamalat_Malaysia_logo.svg/100px-Bank_Muamalat_Malaysia_logo.svg.png' }
  ],
  
  // Supported E-Wallets
  ewallets: [
    { code: 'fpx', name: 'FPX Online Banking', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/PayNet_Logo.svg/100px-PayNet_Logo.svg.png' },
    { code: 'boost', name: 'Boost', icon: 'https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/092018/boost_logo_0.png' },
    { code: 'tng', name: 'Touch n Go eWallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Touch_%27n_Go_eWallet_logo.svg/100px-Touch_%27n_Go_eWallet_logo.svg.png' },
    { code: 'grabpay', name: 'GrabPay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Grab_%28application%29_logo.svg/100px-Grab_%28application%29_logo.svg.png' },
    { code: 'shopeepay', name: 'ShopeePay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/100px-Shopee_logo.svg.png' }
  ],
  
  // Return URLs
  returnUrl: process.env.NEXT_PUBLIC_BASE_URL + '/payment/success' || 'http://localhost:3000/payment/success',
  callbackUrl: process.env.NEXT_PUBLIC_BASE_URL + '/api/payment/callback' || 'http://localhost:3000/api/payment/callback'
};

// ToyyibPay API Functions
export const createToyyibPayBill = async (billData: {
  billName: string;
  billDescription: string;
  billPriceSetting: number;
  billPayorInfo: number;
  billAmount: number;
  billReturnUrl: string;
  billCallbackUrl: string;
  billExternalReferenceNo: string;
  billTo: string;
  billEmail: string;
  billPhone: string;
  billSplitPayment: number;
  billSplitPaymentArgs: string;
  billPaymentChannel: string;
  billContentEmail: string;
  billChargeToCustomer: number;
}) => {
  try {
    console.log('🎯 Creating ToyyibPay bill:', billData);
    
    // Prepare form data for ToyyibPay API
    const formData = new FormData();
    formData.append('userSecretKey', TOYYIBPAY_CONFIG.userSecretKey);
    formData.append('categoryCode', TOYYIBPAY_CONFIG.categoryCode);
    formData.append('billName', billData.billName);
    formData.append('billDescription', billData.billDescription);
    formData.append('billPriceSetting', billData.billPriceSetting.toString());
    formData.append('billPayorInfo', billData.billPayorInfo.toString());
    formData.append('billAmount', (billData.billAmount * 100).toString()); // Convert to cents
    formData.append('billReturnUrl', billData.billReturnUrl);
    formData.append('billCallbackUrl', billData.billCallbackUrl);
    formData.append('billExternalReferenceNo', billData.billExternalReferenceNo);
    formData.append('billTo', billData.billTo);
    formData.append('billEmail', billData.billEmail);
    formData.append('billPhone', billData.billPhone || '60123456789');
    formData.append('billSplitPayment', billData.billSplitPayment.toString());
    formData.append('billSplitPaymentArgs', billData.billSplitPaymentArgs);
    formData.append('billPaymentChannel', billData.billPaymentChannel);
    formData.append('billContentEmail', billData.billContentEmail);
    formData.append('billChargeToCustomer', billData.billChargeToCustomer.toString());
    
    const response = await fetch(TOYYIBPAY_CONFIG.endpoints.createBill, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result && result[0] && result[0].BillCode) {
      const billCode = result[0].BillCode;
      const paymentUrl = `https://toyyibpay.com/${billCode}`;
      
      console.log('✅ ToyyibPay bill created successfully:', {
        billCode: billCode,
        paymentUrl: paymentUrl
      });
      
      return {
        status: 'success',
        billCode: billCode,
        paymentUrl: paymentUrl,
        response: result[0]
      };
    } else {
      throw new Error('Failed to create ToyyibPay bill: ' + JSON.stringify(result));
    }
    
  } catch (error) {
    console.error('❌ ToyyibPay bill creation failed:', error);
    throw error;
  }
};

// Function to redirect to ToyyibPay
export const redirectToToyyibPay = (paymentUrl: string) => {
  console.log('🔄 Redirecting to ToyyibPay:', paymentUrl);
  window.location.href = paymentUrl;
};

// Get payment status
export const getToyyibPayStatus = async (billCode: string) => {
  try {
    const formData = new FormData();
    formData.append('userSecretKey', TOYYIBPAY_CONFIG.userSecretKey);
    formData.append('billCode', billCode);
    
    const response = await fetch(TOYYIBPAY_CONFIG.endpoints.getBillTransactions, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('❌ Failed to get ToyyibPay status:', error);
    throw error;
  }
};