"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Play, Pause, Download, Volume2, AlertCircle } from "lucide-react"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../components/auth-provider"
import { saveTranscription } from "../lib/firebase"
import { textToSpeech, isApiKeyConfigured } from "../lib/spitch-api"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

export default function TextToSpeech() {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("yo")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [voice, setVoice] = useState("sade")
  const [apiKeyConfigured, setApiKeyConfigured] = useState(isApiKeyConfigured())
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Define available voices for each language
  const voicesByLanguage = {
    yo: [
      { id: "sade", name: "Sade (Female)", gender: "female" },
      { id: "femi", name: "Femi (Male)", gender: "male" },
    ],
    ig: [
      { id: "amara", name: "Amara (Female)", gender: "female" },
      { id: "ebuka", name: "Ebuka (Male)", gender: "male" },
    ],
    ha: [
      { id: "zainab", name: "Zainab (Female)", gender: "female" },
      { id: "hasan", name: "Hasan (Male)", gender: "male" },
    ],
  }

  // Get available voices for the current language
  const availableVoices = voicesByLanguage[language] || []

  // Check if API key is configured
  useEffect(() => {
    setApiKeyConfigured(isApiKeyConfigured())

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [])

  // Update voice when language changes
  useEffect(() => {
    // Set default voice to the first one for the selected language
    const voices = voicesByLanguage[language] || []
    if (voices.length > 0) {
      setVoice(voices[0].id)
    }
  }, [language])

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const handleLoadedMetadata = () => {
      if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
        setDuration(audioRef.current.duration)
      }
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime)
    }

    const audio = audioRef.current
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      audio.pause()
      audio.src = ""
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [])

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Check if API key is configured
      if (!apiKeyConfigured) {
        // Use demo audio if API key is not configured
        setTimeout(() => {
          // This is a placeholder. In a real app, we would get an audio URL from the API
          const demoAudio = "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav"

          if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
          }

          // Fetch the demo audio and create a blob
          fetch(demoAudio)
            .then((response) => response.blob())
            .then((blob) => {
              setAudioBlob(blob)
              setAudioUrl(demoAudio)

              // Load the audio
              if (audioRef.current) {
                audioRef.current.src = demoAudio
                audioRef.current.load()
              }
            })

          setIsProcessing(false)

          toast({
            title: "Demo Mode",
            description: "Using demo audio. Configure Spitch API key in .env for real text-to-speech.",
          })
        }, 2000)
        return
      }

      // Use real Spitch API for text-to-speech
      const audioBlob = await textToSpeech(text, voice, language)
      setAudioBlob(audioBlob)

      // Create URL for the audio blob
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Load the audio
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.load()
      }

      toast({
        title: "Speech generated",
        description: "Your text has been converted to speech",
      })
    } catch (error) {
      console.error("Text-to-speech error:", error)
      toast({
        title: "Speech generation failed",
        description: error.message || "There was an error generating speech",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const togglePlayPause = () => {
    if (!audioUrl || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error)
        toast({
          title: "Playback error",
          description: "There was an error playing the audio",
          variant: "destructive",
        })
      })
    }
  }

  const downloadAudio = () => {
    if (!audioUrl) {
      toast({
        title: "Nothing to download",
        description: "Please generate speech first",
        variant: "destructive",
      })
      return
    }

    const link = document.createElement("a")
    link.href = audioUrl
    link.download = `afroglot-speech-${language}-${voice}-${new Date().toISOString().slice(0, 10)}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your audio is being downloaded",
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

    if (!text.trim() || !audioBlob) {
      toast({
        title: "Nothing to save",
        description: "Please generate speech first",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Show immediate feedback
      toast({
        title: "Saving...",
        description: "Your text and audio are being saved",
      })

      // Get voice details
      const selectedVoice = availableVoices.find((v) => v.id === voice) || { gender: "female" }

      const savedData = await saveTranscription(user.uid, {
        text: text,
        language: language,
        type: "text-to-speech",
        voiceGender: selectedVoice.gender,
        voice: voice,
        timestamp: new Date().toISOString(),
        audioBlob: audioBlob, // Include the audio blob for Cloudinary upload
      })

      // Check if there was an audio error
      if (savedData.audioError) {
        toast({
          title: "Partially saved",
          description: "Your text was saved, but there was an error saving the audio",
          variant: "warning",
        })
      } else {
        toast({
          title: "Saved successfully",
          description: "Your text and audio have been saved to your account",
        })
      }
    } catch (error) {
      console.error("Error saving text:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving your text: " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage safely
  const calculateProgress = () => {
    if (!duration || duration <= 0 || !isFinite(duration)) return 0
    const progress = (currentTime / duration) * 100
    return isNaN(progress) || !isFinite(progress) ? 0 : Math.min(progress, 100)
  }

  // Get language name for display
  const getLanguageName = (code) => {
    const languageMap = {
      yo: "Yoruba",
      ig: "Igbo",
      ha: "Hausa",
    }
    return languageMap[code] || code
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Text to Speech</h1>

        {!apiKeyConfigured && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Spitch API Key Not Configured</AlertTitle>
            <AlertDescription>
              For real text-to-speech, you need to add VITE_SPITCH_API_KEY to your .env file. Currently running in demo
              mode with simulated responses.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Convert Text to Speech</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yo">{getLanguageName("yo")}</SelectItem>
                  <SelectItem value="ig">{getLanguageName("ig")}</SelectItem>
                  <SelectItem value="ha">{getLanguageName("ha")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={voice} onValueChange={setVoice} className="flex-1">
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Enter text to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
              disabled={isProcessing}
            />

            {audioUrl && (
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-md">
                <Button size="icon" variant="outline" onClick={togglePlayPause} disabled={isProcessing}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1">
                  <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {isProcessing && (
              <div className="flex justify-center">
                <div className="animate-pulse text-center">
                  <p>Generating speech...</p>
                  <div className="mt-2 flex justify-center">
                    <div className="h-2 w-24 bg-primary rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={saveToAccount} disabled={!text.trim() || !audioBlob || isProcessing}>
                Save to Account
              </Button>
              <Button variant="outline" onClick={downloadAudio} disabled={!audioUrl || isProcessing}>
                <Download className="mr-2 h-4 w-4" />
                Download Audio
              </Button>
            </div>
            <Button onClick={generateSpeech} disabled={!text.trim() || isProcessing}>
              Generate Speech
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

