import { put, del } from "@/lib/api";
import { CLERK_TOKEN_TEMPLATE } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { getToken } = await auth();
  const { id } = await params;
  const token = await getToken({
    template: CLERK_TOKEN_TEMPLATE,
    expiresInSeconds: 3,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const data = await put(`/cart/items/${id}`, body, {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = await getToken({
    template: CLERK_TOKEN_TEMPLATE,
    expiresInSeconds: 3,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await del(`/cart/items/${id}`, {
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
