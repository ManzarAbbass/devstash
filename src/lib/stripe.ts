import Stripe from "stripe"

let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
    _stripe = new Stripe(key, {
      typescript: true,
    })
  }
  return _stripe
}

export function getStripePriceId(monthly: boolean): string {
  const id = monthly
    ? process.env.STRIPE_PRICE_ID_MONTHLY
    : process.env.STRIPE_PRICE_ID_YEARLY
  if (!id) throw new Error(`STRIPE_PRICE_ID_${monthly ? "MONTHLY" : "YEARLY"} is not set`)
  return id
}
