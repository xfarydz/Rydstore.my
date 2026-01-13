'use client';

import { useState } from 'react';
import { X, Upload, Building2, CheckCircle, Copy, Check, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useAlert } from './AlertProvider';

interface BankTransferModalProps {
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

export default function BankTransferModal({
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
}: BankTransferModalProps) {
  const [receipt, setReceipt] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string>('');
  const { user, addNotification } = useAuth();
  const { settings } = useSiteSettings();
  const { showSuccess, showError } = useAlert();

  // Use settings if provided, else fall back
  const primaryBank = settings.bankAccountNumber && settings.bankName ? [{
    bank: settings.bankName,
    accountNumber: settings.bankAccountNumber,
    accountName: settings.bankAccountName || 'Account Holder'
  }] : undefined;

  // Optional: set your static QR image in /public/images/duitnow-qr.png
  const qrImage = settings.bankQrUrl || '';

  if (!isOpen) return null;

  // Bank details - Admin can change this
  const bankAccounts = primaryBank || [
    { bank: 'Maybank', accountNumber: '1234567890', accountName: 'RYDSTORE SDN BHD' },
    { bank: 'CIMB Bank', accountNumber: '9876543210', accountName: 'RYDSTORE SDN BHD' }
  ];

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid File', 'Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File Too Large', 'Please upload an image smaller than 5MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceipt(reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      showError('Upload Failed', 'Failed to read the file. Please try again.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount(bank);
      setTimeout(() => setCopiedAccount(''), 2000);
    });
  };

  const copyReference = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAccount('ref');
      setTimeout(() => setCopiedAccount(''), 2000);
    });
  };

  const handleSubmit = () => {
    if (!receipt) {
      showError('Receipt Required', 'Please upload your payment receipt to continue.');
      return;
    }

    // Create pending order
    const order = {
      id: orderId,
      productId,
      productName,
      productImage,
      productBrand,
      productSize,
      productColor,
      amount,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: user?.phone,
      receipt,
      status: 'pending', // pending, verified, shipped, completed
      paymentMethod: 'bank_transfer',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    };

    // Save to orders
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Mark product as sold
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const updatedProducts = products.map((p: any) => {
      if (p.id === productId) {
        return {
          ...p,
          isSoldOut: true,
          inStock: false,
          soldAt: new Date().toISOString(),
          soldTo: user?.id,
          orderId: orderId
        };
      }
      return p;
    });
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event('productUpdated'));

    // Add notification
    try {
      addNotification({
        type: 'payment_required',
        title: 'Order Submitted',
        message: `Your order #${orderId} has been submitted. We'll verify your payment shortly.`,
        productId: productId,
        productName: productName
      });
    } catch (error) {
      console.log('Notification skipped');
    }

    showSuccess(
      'Order Submitted Successfully!',
      `Order #${orderId} is being processed. You'll be notified once payment is verified.`
    );

    onPaymentSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in-0 duration-200">
      <div 
        style={{ animation: 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-black text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
            <div className="flex gap-4">
              <img 
                src={productImage} 
                alt={productName}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium">{productName}</p>
                <p className="text-sm text-gray-600">{productBrand}</p>
                <p className="text-sm text-gray-600">Size: {productSize} • Color: {productColor}</p>
                <p className="text-lg font-bold text-black mt-2">RM {amount.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Amount to pay</p>
                  <p className="font-bold text-lg">RM {amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => copyReference(amount.toFixed(2))}
                  className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {copiedAccount === 'ref' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Payment reference</p>
                  <p className="font-mono font-semibold">{orderId}</p>
                </div>
                <button
                  onClick={() => copyReference(orderId)}
                  className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {copiedAccount === 'ref' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Bank Transfer Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Bank Transfer Details</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 mb-3">
                Transfer the exact amount to one of the accounts below:
              </p>
              
              {bankAccounts.map((account, index) => (
                <div key={index} className="bg-white rounded-lg p-4 mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-lg">{account.bank}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Account Number:</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold">{account.accountNumber}</p>
                        <button
                          onClick={() => copyToClipboard(account.accountNumber, account.bank)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copy account number"
                        >
                          {copiedAccount === account.bank ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Account Name: <span className="font-semibold">{account.accountName}</span>
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-4 bg-white rounded-lg p-4 border border-dashed border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-5 w-5 text-purple-600" />
                  <p className="font-semibold">Scan & Pay (Optional)</p>
                </div>
                {qrImage ? (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Scan this DuitNow/static QR for faster payment. Please key in the exact amount and add the payment reference in remark.</p>
                    <img 
                      src={qrImage}
                      alt="DuitNow QR"
                      className="w-40 h-40 object-contain rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-500">Tip: Replace the QR image at {`public${qrImage}`} with your own bank-generated static QR.</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Add your bank static QR (DuitNow) by placing an image at <code className="font-mono">public{qrImage}</code>. Customers can scan & pay then upload receipt.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Receipt */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Upload Payment Receipt</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition-colors">
              {receipt ? (
                <div className="space-y-3">
                  <img 
                    src={receipt} 
                    alt="Receipt" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Receipt uploaded successfully
                  </p>
                  <button
                    onClick={() => setReceipt('')}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove & upload different receipt
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium mb-1">Click to upload receipt</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!receipt || uploading}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Submit Order & Receipt
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your order will be processed once payment is verified by our team (usually within 24 hours)
          </p>
        </div>
      </div>
    </div>
  );
}
