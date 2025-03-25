import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { ArrowRight, Mic, FileText } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background to-muted/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[10%] w-[50%] h-[80%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
              <span className="mr-2 rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">New</span>
              <span className="text-muted-foreground">Now supporting Yoruba, Igbo, and Hausa</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Voice Transcription for <span className="text-primary">African Languages</span>
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Bridging the digital accessibility gap with accurate speech-to-text and text-to-speech for African
              languages.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="group">
                <Link to="/speech-to-text">
                  <Mic className="mr-2 h-4 w-4" />
                  Try Speech to Text
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/text-to-speech">
                  <FileText className="mr-2 h-4 w-4" />
                  Try Text to Speech
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex -space-x-2">
                {["./download.jpeg", "./hausa man.jpeg", "./igbo man.jpeg", "./yor man.jpeg"].map((i) => (
                  <div
                    key={i}
                
                  >
                     <img
                  src={i || "/placeholder.svg"}
                  alt={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center "
                />
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground">
                Trusted by <span className="font-medium text-foreground">2,000+</span> users
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-primary/40 opacity-75 blur-xl group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative rounded-xl border bg-background p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Speech to Text</h3>
                    <p className="text-sm text-muted-foreground">Accurate transcription for African languages</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Text to Speech</h3>
                    <p className="text-sm text-muted-foreground">Natural voice synthesis with native accents</p>
                  </div>
                </div>
                <div className="relative mt-6">
                  <div className="bg-muted p-4 rounded-lg text-sm">
                    <p className="font-medium">Try saying:</p>
                    <p className="text-muted-foreground mt-2 italic">
                      "Báwo ni o ṣe wà lónìí? Mo dúpẹ́ fún ìbẹ̀wò rẹ sí Afroglot."
                    </p>
                  </div>
                  <div className="mt-4 bg-primary/10 p-4 rounded-lg text-sm">
                    <p className="font-medium">Transcription:</p>
                    <p className="text-muted-foreground mt-2">How are you today? Thank you for visiting Afroglot.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

