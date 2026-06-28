import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
})

export const STRIPE_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY!
export const STRIPE_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_ID_YEARLY!
