import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // ToyyibPay sends webhook with these fields:
    // billCode, status, billPaymentAmount, billPaymentDate, userSecretKey, etc.
    
    const body = await request.json();
    const { billCode, status, billPaymentAmount, billPaymentDate } = body;

    console.log('[ToyyibPay Webhook]', { billCode, status });

    // Status "1" = paid, "0" = pending, "-1" = failed
    if (status === '1') {
      // Payment successful - update order
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const order = orders.find((o: any) => o.billCode === billCode);

      if (order) {
        order.status = 'verified';
        order.verifiedAt = new Date().toISOString();
        order.verifiedBy = 'ToyyibPay Auto';
        order.billPaymentAmount = billPaymentAmount;
        order.billPaymentDate = billPaymentDate;

        localStorage.setItem('orders', JSON.stringify(orders));

        // Emit event to sync dashboard
        global.dispatchEvent?.(new Event('paymentVerified'));

        console.log('[ToyyibPay] Order verified:', order.id);
      }
    } else if (status === '-1') {
      // Payment failed
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const order = orders.find((o: any) => o.billCode === billCode);
      if (order) {
        order.status = 'failed';
        order.failedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ToyyibPay Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
