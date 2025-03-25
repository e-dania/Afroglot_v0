import { HeroSection } from "../components/hero-section"
import { FeatureSection } from "../components/feature-section"
import { TestimonialSection } from "../components/testimonial-section"
import { CtaSection } from "../components/cta-section"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <TestimonialSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

