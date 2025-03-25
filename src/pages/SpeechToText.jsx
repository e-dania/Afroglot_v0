"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Download, AlertCircle, Clock, User } from "lucide-react"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../components/auth-provider"
import { saveTranscription } from "../lib/firebase"
import { transcribeAudio, getAvailableLanguages, isApiKeyConfigured } from "../lib/spitch-api"
import AudioRecorder from "../components/audio-recorder"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

export default function SpeechToText() {
  const [transcription, setTranscription] = useState("")
  const [segments, setSegments] = useState([])
  const [language, setLanguage] = useState("yoruba")
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: "yoruba", name: "Yoruba" },
    { code: "igbo", name: "Igbo" },
    { code: "hausa", name: "Hausa" },
  ])
  const [apiKeyConfigured, setApiKeyConfigured] = useState(isApiKeyConfigured())
  const [activeTab, setActiveTab] = useState("text")
  const { toast } = useToast()
  const { user } = useAuth()

  // Check if API key is configured and fetch available languages
  useEffect(() => {
    setApiKeyConfigured(isApiKeyConfigured())

    // If API key is configured, try to fetch available languages
    if (apiKeyConfigured) {
      fetchAvailableLanguages()
    }
  }, [apiKeyConfigured])

  // Fetch available languages from Spitch API
  const fetchAvailableLanguages = async () => {
    try {
      const languages = await getAvailableLanguages()
      if (languages && languages.length > 0) {
        setAvailableLanguages(languages)
      }
    } catch (error) {
      console.error("Error fetching languages:", error)
      // Keep using default languages if API call fails
    }
  }

  const handleSaveAudio = (blob, source) => {
    setAudioBlob(blob)
    processAudio(blob, source)
  }

  const processAudio = async (blob, source) => {
    setIsProcessing(true)
    setTranscription("")
    setSegments([])

    try {
      // Check if API key is configured
      if (!apiKeyConfigured) {
        // Use demo transcription if API key is not configured
        setTimeout(() => {
          const demoTranscriptions = {
            yoruba: "Báwo ni o ṣe wà lónìí? Mo dúpẹ́ fún ìbẹ̀wò rẹ sí Afroglot.",
            igbo: "Kedu ka ị mere taa? Daalụ maka ịbịa na Afroglot.",
            hausa: "Yaya kake yau? Na gode da ziyartar Afroglot.",
          }

          setTranscription(demoTranscriptions[language] || "Demo transcription text")

          // Create demo segments
          const demoSegments = [
            { start: 0, end: 2.5, text: "Báwo ni o ṣe wà lónìí?", speaker: 1 },
            { start: 2.8, end: 5.2, text: "Mo dúpẹ́ fún ìbẹ̀wò rẹ sí Afroglot.", speaker: 1 },
          ]
          setSegments(demoSegments)
          setIsProcessing(false)

          toast({
            title: "Demo Mode",
            description: `Using demo transcription. Configure Spitch API key in .env for real transcription.`,
          })
        }, 2000)
        return
      }

      // Use real Spitch API for transcription
      const response = await transcribeAudio(blob, language)

      if (typeof response === "object") {
        // Handle structured response with segments
        setTranscription(response.text || "")
        if (response.segments && Array.isArray(response.segments)) {
          setSegments(response.segments)
        }
      } else {
        // Handle simple text response
        setTranscription(response)
      }

      toast({
        title: "Transcription complete",
        description: `Your ${source} audio has been transcribed`,
      })
    } catch (error) {
      console.error("Transcription error:", error)
      toast({
        title: "Transcription failed",
        description: error.message || "There was an error transcribing your audio",
        variant: "destructive",
      })

      // Set empty transcription to prevent UI errors
      setTranscription("")
      setSegments([])
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTranscription = () => {
    if (!transcription) {
      toast({
        title: "Nothing to download",
        description: "Please record or upload audio first",
        variant: "destructive",
      })
      return
    }

    let content = transcription

    // If we have segments, add them to the download
    if (segments.length > 0) {
      content += "\n\n--- Detailed Transcription with Timestamps ---\n\n"
      segments.forEach((segment, index) => {
        const startTime = formatTime(segment.start)
        const endTime = formatTime(segment.end)
        const speakerInfo = segment.speaker ? `Speaker ${segment.speaker}: ` : ""
        content += `[${startTime} - ${endTime}] ${speakerInfo}${segment.text}\n`
      })
    }

    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `afroglot-transcription-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download started",
      description: "Your transcription is being downloaded",
    })
  }

  // Update the saveToAccount function to work with Cloudinary
  const saveToAccount = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save transcriptions",
        variant: "destructive",
      })
      return
    }

    if (!transcription) {
      toast({
        title: "Nothing to save",
        description: "Please record or upload audio first",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Show immediate feedback
      toast({
        title: "Saving...",
        description: "Your transcription is being saved",
      })

      // Create the data object including the audio blob
      const transcriptionData = {
        text: transcription,
        language: language,
        type: "speech-to-text",
        timestamp: new Date().toISOString(),
        segments: segments.length > 0 ? segments : null,
        audioBlob: audioBlob, // Include the audio blob for Cloudinary upload
      }

      // Save to Firestore and Cloudinary
      const savedData = await saveTranscription(user.uid, transcriptionData)

      // Check if there was an audio error
      if (savedData.audioError) {
        toast({
          title: "Partially saved",
          description: "Your transcription was saved, but there was an error saving the audio",
          variant: "warning",
        })
      } else {
        toast({
          title: "Saved successfully",
          description: "Your transcription and audio have been saved to your account",
        })
      }
    } catch (error) {
      console.error("Error saving transcription:", error)
      toast({
        title: "Save failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format time in seconds to MM:SS.MS format
  const formatTime = (seconds) => {
    if (typeof seconds !== "number") return "00:00.0"

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Speech to Text</h1>

        {!apiKeyConfigured && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Spitch API Key Not Configured</AlertTitle>
            <AlertDescription>
              For real transcription, you need to add VITE_SPITCH_API_KEY to your .env file. Currently running in demo
              mode with simulated responses.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column: Audio recorder */}
          <div>
            <div className="mb-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AudioRecorder onSaveAudio={handleSaveAudio} language={language} />
          </div>

          {/* Right column: Transcription */}
          <Card>
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
              {segments.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Full Text</TabsTrigger>
                    <TabsTrigger value="segments">Segments</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>
            <CardContent>
              {activeTab === "text" ? (
                <Textarea
                  placeholder="Your transcription will appear here..."
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="min-h-[200px] font-medium"
                  readOnly={isProcessing}
                />
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {segments.map((segment, index) => (
                    <div key={index} className="p-3 border rounded-md bg-muted/30">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </div>
                        {segment.speaker && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            Speaker {segment.speaker}
                          </div>
                        )}
                      </div>
                      <p className="text-sm">{segment.text}</p>
                    </div>
                  ))}
                  {segments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No segments available for this transcription
                    </p>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="flex justify-center mt-4">
                  <div className="animate-pulse text-center">
                    <p>Processing your audio...</p>
                    <div className="mt-2 flex justify-center">
                      <div className="h-2 w-24 bg-primary rounded"></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveToAccount} disabled={!transcription || isProcessing || !audioBlob}>
                Save to Account
              </Button>
              <Button onClick={downloadTranscription} disabled={!transcription || isProcessing}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

