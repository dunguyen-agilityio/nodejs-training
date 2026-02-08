import { NextResponse } from 'next/server'

import { API_ROUTES, post } from '@/lib/api'
import { createAuthorizationHeader } from '@/lib/auth'
import { config } from '@/lib/config'
import { PaymentIntent } from '@/lib/types'

export const POST = async (req: Request) => {
  const body = await req.json()
  const headers = await createAuthorizationHeader()

  const { clientSecret } = await post<PaymentIntent>(
    `${config.api.endpoint}${API_ROUTES.CHECKOUT.CREATE}`,
    body,
    headers,
  )

  return NextResponse.json({ clientSecret })
}
