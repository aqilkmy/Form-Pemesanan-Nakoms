import { NextResponse } from "next/server";
import { getOrders } from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getOrders();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
}
