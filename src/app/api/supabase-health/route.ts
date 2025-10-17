import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      return NextResponse.json({ ok: false, reason: 'missing_env' }, { status: 500 })
    }

    const resp = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      cache: 'no-store',
    })

    const isOk = resp.ok
    const status = resp.status
    let json: unknown = null
    try {
      json = await resp.json()
    } catch {}

    return NextResponse.json({ ok: isOk, status, json, keyPrefix: anon.slice(0, 12) })
  } catch (e) {
    return NextResponse.json({ ok: false, reason: 'exception', error: String(e) }, { status: 500 })
  }
}


