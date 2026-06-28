import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as { customer: string; subscription: string }
        const customerId = checkoutSession.customer as string
        const subscriptionId = checkoutSession.subscription as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPro: true,
              stripeSubscriptionId: subscriptionId,
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as { id: string; status: string }
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPro: subscription.status === "active" || subscription.status === "trialing",
            },
          })
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as unknown as { subscription: string }
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: invoice.subscription },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isPro: true },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as unknown as { subscription: string }
        const failedUser = await prisma.user.findFirst({
          where: { stripeSubscriptionId: failedInvoice.subscription },
        })

        if (failedUser) {
          await prisma.user.update({
            where: { id: failedUser.id },
            data: { isPro: false },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as { id: string }
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPro: false,
              stripeSubscriptionId: null,
            },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    )
  }
}
