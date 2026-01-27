import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'

const DEFAULT_SETTINGS = {
  storeName: "Farid's Store",
  storeSlogan: 'SELECTED ITEMS',
  contactEmail: 'admin@rydstore.my',
  logoUrl: '/images/logo.jpg',
  heroTitle: "Farid's Store",
  heroSubtitle: 'SELECTED ITEMS',
  currency: 'RM',
  heroBackgroundImage: '',
  heroDescription:
    'Discover exclusive fashion pieces from top international brands. Curated collection from Kulim, Kedah with love.',
  phoneNumber: '+60174694966',
  maintenanceMode: false,
  bankName: 'Maybank',
  bankAccountNumber: '',
  bankAccountName: '',
  bankQrUrl: '',
}

const TABLE_NAME = 'site_settings'
const ROW_ID = 1

export async function GET() {
  if (!supabase) {
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 })
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', ROW_ID)
    .single()

  if (error) {
    console.error('GET settings error:', error.message)
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 })
  }

  return NextResponse.json({ ...DEFAULT_SETTINGS, ...data }, { status: 200 })
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const payload = await request.json()
  const upsertData = { id: ROW_ID, ...payload }

  const { error } = await supabase.from(TABLE_NAME).upsert(upsertData)

  if (error) {
    console.error('POST settings error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
