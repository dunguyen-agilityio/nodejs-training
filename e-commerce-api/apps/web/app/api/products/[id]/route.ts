import { auth } from '@clerk/nextjs/server'

import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { del, put } from '@/lib/api'
import { config } from '@/lib/config'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { getToken } = await auth()
  const token = await getToken({
    template: config.clerk.tokenTemplate,
    expiresInSeconds: 3,
  })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const data = await put(`${config.api.endpoint}/products/${id}`, body, {
      Authorization: `Bearer ${token}`,
    })
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
  const { getToken } = await auth()
  const token = await getToken({
    template: config.clerk.tokenTemplate,
    expiresInSeconds: 3,
  })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await del(`${config.api.endpoint}/products/${id}`, {
      Authorization: `Bearer ${token}`,
    })

    revalidatePath('/admin/products')
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 },
    )
  }
}
