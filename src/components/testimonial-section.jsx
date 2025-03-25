import { Quote } from "lucide-react"

export function TestimonialSection() {
  const testimonials = [
    {
      quote:
        "Afroglot has revolutionized how I create content in Yoruba. The accuracy of the transcriptions is impressive!",
      author: "Adebayo Ogunlesi",
      role: "Content Creator",
      avatar: "./yor man.jpeg",
    },
    {
      quote:
        "As a language researcher, Afroglot has been invaluable for my work with Igbo dialects. It captures nuances that other tools miss.",
      author: "Dr. Chioma Eze",
      role: "Linguistics Professor",
      avatar: "./igbo man.jpeg",
    },
    {
      quote:
        "The text-to-speech feature has made my educational materials accessible to visually impaired students who speak Hausa.",
      author: "Ibrahim Musa",
      role: "Educational Consultant",
      avatar: "./hausa man.jpeg",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Trusted by Users Across Africa</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what our users are saying about Afroglot's voice transcription services.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col justify-between rounded-xl border bg-background p-6 shadow-sm">
              <div>
                <Quote className="h-8 w-8 text-primary/40 mb-4" />
                <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

