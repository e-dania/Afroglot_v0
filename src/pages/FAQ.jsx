"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      question: "What languages does Afroglot currently support?",
      answer:
        "Afroglot currently supports three major Nigerian languages: Yoruba, Igbo, and Hausa. We are actively working to expand our language offerings to include more African languages in the future.",
    },
    {
      question: "How accurate is the speech-to-text transcription?",
      answer:
        "Our speech-to-text technology has been specifically trained on African languages and accents, providing higher accuracy than general-purpose transcription services. The accuracy depends on factors like audio quality, background noise, and speaker clarity. For best results, we recommend using a good quality microphone and speaking clearly.",
    },
    {
      question: "What file formats are supported for audio uploads?",
      answer:
        "Afroglot supports MP3 and WAV audio file formats for transcription. The maximum file size is 50MB. For longer recordings, we recommend splitting the audio into smaller segments for better processing.",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Yes, we take data security and privacy seriously. All audio and text data is encrypted during transmission and storage. We comply with Nigerian Data Protection Regulation (NDPR) standards. Your data is only used to provide the requested services and improve our language models. You can delete your data at any time from your dashboard.",
    },
    {
      question: "Do I need to create an account to use Afroglot?",
      answer:
        "You can use basic speech-to-text and text-to-speech features without an account. However, creating a free account allows you to save your transcriptions and audio files, access your history, and manage your preferences.",
    },
    {
      question: "How can I improve the quality of my transcriptions?",
      answer:
        "For best results: 1) Use a good quality microphone, 2) Reduce background noise, 3) Speak clearly and at a moderate pace, 4) Select the correct language before recording, and 5) For file uploads, ensure the audio is clear and properly recorded.",
    },
    {
      question: "Can I use Afroglot for commercial purposes?",
      answer:
        "Yes, Afroglot can be used for commercial purposes. Our service is designed to support content creators, businesses, and organizations that work with African languages. For high-volume commercial use, please contact us to discuss enterprise options.",
    },
    {
      question: "How do I report issues or provide feedback?",
      answer:
        "We welcome your feedback and reports of any issues you encounter. You can contact our support team at support@afroglot.com or use the feedback form in your dashboard. Your input helps us improve our services and expand our language offerings.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Currently, Afroglot is available as a web application optimized for both desktop and mobile browsers. We are developing native mobile applications for Android and iOS, which will be released in the near future.",
    },
    {
      question: "Can I integrate Afroglot with other applications?",
      answer:
        "Yes, we offer API access for developers who want to integrate Afroglot's speech-to-text and text-to-speech capabilities into their own applications. Please contact our developer support team for API documentation and integration assistance.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Afroglot and our voice transcription services for African languages.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for questions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        )}

        <div className="mt-12 text-center p-8 bg-muted rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            If you couldn't find the answer to your question, feel free to contact our support team.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

