import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getStripe, getStripePriceId } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId } = await request.json()
    const stripe = getStripe()
    const validPriceIds = [getStripePriceId(true), getStripePriceId(false)]

    if (!priceId || !validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, stripeCustomerId: true },
    })

    let stripeCustomerId = user?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        name: user?.name ?? undefined,
        metadata: { userId: session.user.id },
      })

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      })

      stripeCustomerId = customer.id
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?checkout=success`,
      cancel_url: `${request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?checkout=cancelled`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
