import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'

const TABLE_NAME = 'products'
const ROW_ID = 1

export async function GET() {
  if (!supabase) {
    return NextResponse.json([], { status: 200 })
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('data')
    .eq('id', ROW_ID)
    .single()

  if (error) {
    console.error('GET products error:', error.message)
    return NextResponse.json([], { status: 200 })
  }

  // Return the products array from the JSON column
  const productsArray = data?.data || []
  return NextResponse.json(productsArray, { status: 200 })
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const payload = await request.json()
  
  // Store entire products array in JSON column
  const upsertData = { 
    id: ROW_ID, 
    data: payload,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from(TABLE_NAME).upsert(upsertData)

  if (error) {
    console.error('POST products error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
