import { post } from "@/lib/api";
import { CLERK_TOKEN_TEMPLATE } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken({
    template: CLERK_TOKEN_TEMPLATE,
    expiresInSeconds: 3,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const data = await post("/checkout/orders/prepare", body, {
      Authorization: `Bearer ${token}`,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 },
    );
  }
}
