import { NextRequest, NextResponse } from 'next/server'

import { del, put } from '@/lib/api'
import { createAuthorizationHeader } from '@/lib/auth'
import { config } from '@/lib/config'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = await createAuthorizationHeader()
  const { id } = await params

  const body = await req.json()

  try {
    const data = await put(
      `${config.api.endpoint}/cart/items/${id}`,
      body,
      headers,
    )
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const headers = await createAuthorizationHeader()

  try {
    const data = await del(`${config.api.endpoint}/cart/items/${id}`, headers)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 },
    )
  }
}
