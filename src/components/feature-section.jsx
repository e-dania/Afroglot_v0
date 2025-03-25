import { Mic, FileText, Upload, Download, Users, Globe, Sparkles, Shield } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Speech to Text",
      description:
        "Convert spoken African languages into accurate, written text with proper diacritical marks and tonal inflections.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Text to Speech",
      description:
        "Transform written content into natural-sounding speech with authentic accents and proper pronunciation.",
    },
    {
      icon: <Upload className="h-10 w-10 text-primary" />,
      title: "File Upload",
      description: "Upload audio files in MP3 or WAV format for batch transcription of longer content.",
    },
    {
      icon: <Download className="h-10 w-10 text-primary" />,
      title: "Downloadable Results",
      description: "Save your transcriptions and generated audio for offline use and sharing.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Accessibility",
      description:
        "Empower visually impaired users with text-to-speech and support content creators with accurate subtitles.",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "Language Support",
      description: "Currently supporting Yoruba, Igbo, and Hausa with plans to expand to more African languages.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      title: "High Accuracy",
      description:
        "Our models are specifically trained on African phonetics and linguistic structures for superior results.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Data Privacy",
      description:
        "Your data is encrypted and protected in compliance with Nigerian Data Protection Regulation (NDPR).",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-4">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Powerful Tools for African Languages
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Afroglot provides comprehensive voice transcription services tailored for African languages.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-3 rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

