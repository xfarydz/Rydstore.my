'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Building } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAuth } from '@/hooks/useAuth';
import PaymentSuccessModal from './PaymentSuccessModal';
import { TOYYIBPAY_CONFIG, createToyyibPayBill, redirectToToyyibPay } from '@/config/toyyibpay';
import { useAlert } from './AlertProvider';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  productBrand: string;
  productSize: string;
  productColor: string;
  productId: string;
  amount: number;
  orderId: string;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  productName, 
  productImage, 
  productBrand,
  productSize,
  productColor,
  productId,
  amount, 
  orderId,
  onPaymentSuccess 
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'fpx' | 'ewallet'>('card');
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedEwallet, setSelectedEwallet] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { settings } = useSiteSettings();
  const { addNotification, user } = useAuth();
  const { showError, showSuccess, showInfo } = useAlert();

  if (!isOpen && !showSuccessModal) return null;

  const rollbackReservation = () => {
    console.log('🔄 Rolling back product reservation due to payment failure');
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const updatedProducts = products.map((p: any) => {
      if (p.id === productId) {
        console.log('🔓 Releasing reserved product:', p.name);
        return {
          ...p,
          isSoldOut: false,
          inStock: true,
          isAvailable: true,
          reservedAt: undefined,
          reservedBy: undefined,
          reservedByEmail: undefined
        };
      }
      return p;
    });
    
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('productUpdated'));
  };

  const handlePayment = async () => {
    setLoading(true);
    
    console.log('💳 Starting payment process for product:', productId);
    console.log('💳 Payment method selected:', paymentMethod);
    
    // Validate payment method selections
    if (paymentMethod === 'fpx' && !selectedBank) {
      showError('Bank Selection Required', 'Please select a bank for FPX payment to proceed.');
      setLoading(false);
      return;
    }
    
    if (paymentMethod === 'ewallet' && !selectedEwallet) {
      showError('E-Wallet Selection Required', 'Please select an e-wallet for payment to proceed.');
      setLoading(false);
      return;
    }
    
    // VERIFY product is still reserved by current user
    const currentProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const product = currentProducts.find((p: any) => p.id === productId);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    console.log('🔍 Payment validation check:', {
      productId,
      productFound: !!product,
      productReservedBy: product?.reservedBy,
      currentUserId: currentUser.id,
      currentUserEmail: currentUser.email,
      productReservedByEmail: product?.reservedByEmail,
      reservationMatch: product?.reservedBy === currentUser.id,
      emailMatch: product?.reservedByEmail === currentUser.email
    });
    
    // Check both user ID and email for reservation validation
    const isReservedByCurrentUser = product && (
      (product.reservedBy && product.reservedBy === currentUser.id) ||
      (product.reservedByEmail && product.reservedByEmail === currentUser.email)
    );
    
    if (!product) {
      setLoading(false);
      showError('Product Not Found', 'The selected product could not be found. Please try again or contact support.');
      onClose();
      return;
    }
    
    if (!isReservedByCurrentUser) {
      setLoading(false);
      console.log('❌ Product not reserved by current user:', {
        productReservedBy: product.reservedBy,
        productReservedByEmail: product.reservedByEmail,
        currentUserId: currentUser.id,
        currentUserEmail: currentUser.email
      });
      
      // If product is not reserved by anyone (might be a sync issue), try to reserve it now
      if (!product.reservedBy && !product.reservedByEmail && !product.isSoldOut) {
        console.log('🔄 Product not reserved by anyone, attempting to reserve now...');
        
        const updatedProducts = currentProducts.map((p: any) => {
          if (p.id === productId) {
            return {
              ...p,
              isSoldOut: true,
              inStock: false,
              isAvailable: false,
              reservedAt: new Date().toISOString(),
              reservedBy: currentUser.id,
              reservedByEmail: currentUser.email
            };
          }
          return p;
        });
        
        localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
        console.log('✅ Product reserved successfully, continuing with payment...');
        
        // Continue with payment without returning
      } else {
        showError('Product Unavailable', 'This product is no longer available or has been reserved by another customer.');
        onClose();
        return;
      }
    }
    
    try {
      // Handle ToyyibPay payments (FPX and E-wallet)
      if (paymentMethod === 'fpx' || paymentMethod === 'ewallet') {
        console.log('🎯 Processing ToyyibPay payment:', { paymentMethod, selectedBank, selectedEwallet });
        
        const toyyibPayData = {
          billName: `Purchase: ${productName}`,
          billDescription: `Payment for ${productName} (Order: ${orderId})`,
          billPriceSetting: 1, // Fixed price
          billPayorInfo: 1, // Optional payer info
          billAmount: amount,
          billReturnUrl: TOYYIBPAY_CONFIG.returnUrl,
          billCallbackUrl: TOYYIBPAY_CONFIG.callbackUrl,
          billExternalReferenceNo: orderId,
          billTo: user?.name || currentUser.name || 'Customer',
          billEmail: user?.email || currentUser.email,
          billPhone: user?.phone || currentUser.phone || '60123456789',
          billSplitPayment: 0,
          billSplitPaymentArgs: '',
          billPaymentChannel: paymentMethod === 'fpx' ? '0' : '2', // 0=FPX, 2=E-wallet
          billContentEmail: `Thank you for your purchase of ${productName}`,
          billChargeToCustomer: 1 // Charge processing fee to customer
        };
        
        try {
          const toyyibPayResponse = await createToyyibPayBill(toyyibPayData);
          
          if (toyyibPayResponse.status === 'success') {
            console.log('✅ ToyyibPay bill created successfully');
            console.log('🔗 Payment URL:', toyyibPayResponse.paymentUrl);
            
            // Redirect to ToyyibPay
            showInfo(
              'Redirecting to Payment', 
              `You will be redirected to ${paymentMethod === 'fpx' ? 'FPX banking' : 'e-wallet'} payment page via ToyyibPay. Please complete your payment there.`
            );
            
            setTimeout(() => {
              redirectToToyyibPay(toyyibPayResponse.paymentUrl);
            }, 2000);
            
            // For demo purposes, simulate successful payment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } else {
            throw new Error('ToyyibPay bill creation failed');
          }
        } catch (toyyibPayError) {
          console.error('❌ ToyyibPay error:', toyyibPayError);
          throw toyyibPayError;
        }
      } else {
        // Simulate regular card payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    
    // Create complete sales record with user details (match My Purchases page expectations)
    const salesData = {
      id: 'sale-' + Date.now(),
      orderId,
      productId,
      productName,
      productImage,
      productBrand,
      size: productSize,
      color: productColor,
      amount,
      currency: settings.currency || 'RM',
      paymentMethod: paymentMethod,
      status: 'paid', // Initial status for new purchases
      timestamp: new Date().toISOString(),
      purchaseDate: new Date().toLocaleDateString('en-MY'),
      type: 'single',
      
      // Flatten buyer information for easy access
      buyerEmail: currentUser.email,
      buyerName: currentUser.fullName || currentUser.name,
      buyerPhone: currentUser.phone,
      buyerAddress: {
        street: currentUser.address?.street || '',
        city: currentUser.address?.city || '',
        state: currentUser.address?.state || '',
        postcode: currentUser.address?.postcode || '',
        country: currentUser.address?.country || 'Malaysia'
      },
      
      // Keep nested buyer info for backward compatibility
      buyer: {
        id: currentUser.id,
        name: currentUser.fullName || currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        address: {
          street: currentUser.address?.street || '',
          city: currentUser.address?.city || '',
          state: currentUser.address?.state || '',
          postcode: currentUser.address?.postcode || '',
          country: currentUser.address?.country || 'Malaysia'
        }
      }
    };
    
    // Save to sales records
    const salesRecords = JSON.parse(localStorage.getItem('salesRecords') || '[]');
    salesRecords.push(salesData);
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
    
    // Mark payment as successful (keep existing system)
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const newPayment = {
      id: 'payment-' + Date.now(),
      orderId,
      amount,
      method: paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString(),
      productName,
      productImage
    };
    
    payments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    setLoading(false);
    
    console.log('💳 Payment completed successfully for product:', productId);
    console.log('📋 Sales data created:', {
      productId,
      productName,
      buyerEmail: currentUser.email,
      amount
    });
    
    // Call onPaymentSuccess - this marks product as sold and creates notifications
    console.log('📞 Calling onPaymentSuccess to mark product as sold...');
    onPaymentSuccess();
    console.log('✅ onPaymentSuccess completed');
    
    console.log('📡 Triggering product update events...');
    
    // Force multiple refresh triggers
    setTimeout(() => {
      window.dispatchEvent(new Event('productUpdated'));
      window.dispatchEvent(new Event('storage'));
      console.log('🔄 First refresh triggers fired');
    }, 100);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('productUpdated'));
      console.log('🔄 Second refresh trigger fired');
      
      // Check if product was actually marked as sold
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const soldProduct = adminProducts.find((p: any) => p.id === productId);
      console.log('🔍 Product status after update:', {
        id: soldProduct?.id,
        name: soldProduct?.name,
        isSoldOut: soldProduct?.isSoldOut,
        inStock: soldProduct?.inStock
      });
    }, 1000);
    
    // Create purchase success notification
    addNotification({
      type: 'payment_success',
      title: 'Purchase Successful! ✅',
      message: `Your purchase of ${productName} has been completed successfully. The item is now marked as SOLD OUT.`,
      productId,
      productName
    });
    
    console.log('📨 Purchase notification created for:', productName);
    
    // Show success message
    showSuccess(
      'Payment Successful!',
      `Your purchase of ${productName} has been completed successfully. The item is now marked as sold out.`
    );
    
    // Close payment modal and show success modal
    onClose();
    setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ Payment failed:', error);
      setLoading(false);
      
      // Rollback the reservation
      rollbackReservation();
      
      showError('Payment Failed', 'Your payment could not be processed. The item has been released and is available for purchase again. Please try again or contact support if the issue persists.');
    }
  };

  const formatAmount = (amount: number) => {
    return `${settings.currency}${amount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={() => {
              // Rollback reservation when user cancels payment
              rollbackReservation();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{productName}</h3>
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">{formatAmount(amount)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                className="w-4 h-4 text-blue-600"
              />
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Credit/Debit Card</span>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="fpx"
                checked={paymentMethod === 'fpx'}
                onChange={(e) => setPaymentMethod(e.target.value as 'fpx')}
                className="w-4 h-4 text-blue-600"
              />
              <Building className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Online Banking (FPX via ToyyibPay)</span>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="ewallet"
                checked={paymentMethod === 'ewallet'}
                onChange={(e) => setPaymentMethod(e.target.value as 'ewallet')}
                className="w-4 h-4 text-blue-600"
              />
              <Smartphone className="w-5 h-5 text-gray-600" />
              <span className="font-medium">E-Wallet (via ToyyibPay)</span>
            </label>
          </div>

          {/* Card Details Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* FPX Bank Selection */}
          {paymentMethod === 'fpx' && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Select Your Bank (via ToyyibPay)</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {TOYYIBPAY_CONFIG.fpxBanks.map((bank) => (
                  <label key={bank.code} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="bank"
                      value={bank.code}
                      checked={selectedBank === bank.code}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <img 
                      src={bank.icon} 
                      alt={bank.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.textContent = '🏦 ' + bank.name;
                      }}
                    />
                    <span className="text-sm font-medium">{bank.name}</span>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  🎯 <strong>ToyyibPay</strong> - Lower fees, secure Malaysian payment gateway<br/>
                  🔒 You will be redirected to your bank's secure login page.
                </p>
              </div>
            </div>
          )}

          {/* E-wallet Selection */}
          {paymentMethod === 'ewallet' && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Select Your E-Wallet (via ToyyibPay)</h4>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {TOYYIBPAY_CONFIG.ewallets.map((ewallet) => (
                  <label key={ewallet.code} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="ewallet"
                      value={ewallet.code}
                      checked={selectedEwallet === ewallet.code}
                      onChange={(e) => setSelectedEwallet(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <img 
                      src={ewallet.icon} 
                      alt={ewallet.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.textContent = '💳 ' + ewallet.name;
                      }}
                    />
                    <span className="text-sm font-medium">{ewallet.name}</span>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  🎯 <strong>ToyyibPay</strong> - Cheaper processing fees for Malaysian market<br/>
                  📱 You will be redirected to complete payment via your selected method.
                </p>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${formatAmount(amount)}`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>
      
      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        productName={productName}
        productImage={productImage}
        amount={amount}
        orderId={orderId}
      />
    </div>
  );
}