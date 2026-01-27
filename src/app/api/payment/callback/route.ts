import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 ToyyibPay callback received');
    
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    console.log('📋 ToyyibPay callback data:', data);
    
    // Extract payment details from ToyyibPay callback
    const {
      refno,
      status,
      reason,
      billcode,
      order_id,
      amount,
      billName,
      billEmail,
      billPhone
    } = data;
    
    console.log('💳 Payment details:', {
      refno: refno,
      status: status,
      reason: reason,
      billcode: billcode,
      order_id: order_id,
      amount: amount
    });
    
    // Check payment status
    if (status === '1') {
      // Payment successful
      console.log('✅ Payment successful for order:', order_id);
      
      // Here you would typically:
      // 1. Verify payment with ToyyibPay API
      // 2. Update order status in database
      // 3. Send confirmation email
      // 4. Update product stock
      
      return NextResponse.json({
        status: 'success',
        message: 'Payment confirmed',
        refno: refno,
        order_id: order_id
      });
      
    } else {
      // Payment failed
      console.log('❌ Payment failed for order:', order_id, 'Reason:', reason);
      
      return NextResponse.json({
        status: 'failed',
        message: 'Payment failed',
        reason: reason,
        order_id: order_id
      });
    }
    
  } catch (error) {
    console.error('❌ ToyyibPay callback error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Callback processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'ToyyibPay callback endpoint is active',
    timestamp: new Date().toISOString()
  });
}