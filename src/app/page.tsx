import { Nav } from "@/components/homepage/Nav"
import { HeroSection } from "@/components/homepage/HeroSection"
import { FeaturesSection } from "@/components/homepage/FeaturesSection"
import { AiSection } from "@/components/homepage/AiSection"
import { PricingCards } from "@/components/homepage/PricingCards"
import { Footer } from "@/components/homepage/Footer"
import { STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID } from "@/lib/stripe"

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0f0f11] text-[#f4f4f5]">
      <Nav />
      <HeroSection />
      <FeaturesSection />
      <AiSection />
      <PricingCards
        monthlyPriceId={STRIPE_MONTHLY_PRICE_ID}
        yearlyPriceId={STRIPE_YEARLY_PRICE_ID}
      />
      <Footer />
    </div>
  )
}
