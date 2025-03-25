import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Experience Afroglot?</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of users who are already benefiting from our voice transcription services for African
              languages.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 min-[400px]:gap-4">
            <Button asChild size="lg" className="group">
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/faq">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

