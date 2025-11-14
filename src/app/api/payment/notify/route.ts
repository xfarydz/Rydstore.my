import { NextRequest, NextResponse } from 'next/server'

// ToyyibPay payment notification webhook
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    
    // Log notification for debugging
    console.log('Payment notification received:', data)
    
    // Process payment notification
    // You can add your payment processing logic here
    
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Payment notification error:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Payment notification endpoint' })
}
