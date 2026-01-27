import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, reference, email, name, phone } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_TOYYIBPAY_API_KEY;
    const categoryCode = process.env.NEXT_PUBLIC_TOYYIBPAY_CATEGORY_CODE || '0';
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/toyyibpay/webhook`;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ToyyibPay API key not configured' },
        { status: 400 }
      );
    }

    // Create bill via ToyyibPay API
    const response = await fetch('https://api.toyyibpay.com/api/bill/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        userSecretKey: apiKey,
        categoryCode: categoryCode,
        billName: 'Rydstore Purchase',
        billDescription: `Order #${reference}`,
        billPriceSetting: '1', // Fixed price
        billPayorInfo: '1', // Collect payee info
        billAmount: (amount * 100).toString(), // In cents
        billReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?reference=${reference}`,
        billCallbackUrl: callbackUrl,
        billExpiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billContentEmail: email,
        billContentPhone: phone,
      }).toString(),
    });

    const data = await response.json();

    if (data.status === 200 && data.data.billCode) {
      // Save order as pending
      const order = {
        id: reference,
        amount,
        email,
        name,
        phone,
        status: 'pending',
        paymentMethod: 'toyyibpay',
        billCode: data.data.billCode,
        createdAt: new Date().toISOString(),
      };

      // Store in localStorage via API (client-side will handle persistence)
      return NextResponse.json({
        success: true,
        billCode: data.data.billCode,
        billUrl: data.data.billExternalUrl,
        order,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create bill', details: data },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('ToyyibPay bill creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
