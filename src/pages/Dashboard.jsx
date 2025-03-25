"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../components/auth-provider"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Play, Pause, Download, FileText, AlertCircle } from "lucide-react"
import { getUserTranscriptions, deleteTranscription, db } from "../lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export default function Dashboard() {
  const [transcriptions, setTranscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const audioRef = useRef(new Audio())

  // Add a function to handle stalled uploads
  const handleStalledUploads = async () => {
    // Find items that have been processing for more than 5 minutes
    const stalledItems = transcriptions.filter((item) => {
      if (!item.isProcessing || !item.processingStartTime) return false

      // Convert processingStartTime to a number if it's a string
      const startTime =
        typeof item.processingStartTime === "number"
          ? item.processingStartTime
          : Number.parseInt(item.processingStartTime)

      if (isNaN(startTime)) return false

      // Check if it's been processing for more than 5 minutes (300000 ms)
      const processingTime = Date.now() - startTime
      return processingTime > 300000 // 5 minutes
    })

    if (stalledItems.length === 0) return

    // Ask user if they want to cancel stalled uploads
    const shouldCancel = window.confirm(
      `Found ${stalledItems.length} item(s) stuck in processing for over 5 minutes. Would you like to cancel them?`,
    )

    if (!shouldCancel) return

    // Update each stalled item
    for (const item of stalledItems) {
      try {
        const docRef = doc(db, "transcriptions", item.id)
        await updateDoc(docRef, {
          isProcessing: false,
          audioError: true,
          errorMessage: "Processing timed out and was manually cancelled",
        })

        // Update local state
        setTranscriptions((prev) =>
          prev.map((t) =>
            t.id === item.id
              ? { ...t, isProcessing: false, audioError: true, errorMessage: "Processing timed out" }
              : t,
          ),
        )

        toast({
          title: "Processing cancelled",
          description: `Cancelled stalled processing for item created ${formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}`,
        })
      } catch (error) {
        console.error("Error cancelling stalled item:", error)
      }
    }
  }

  useEffect(() => {
    const fetchTranscriptions = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log("Fetching transcriptions for user:", user.uid)
        const data = await getUserTranscriptions(user.uid)
        console.log("Fetched data:", data)
        setTranscriptions(data)

        // Check for stalled uploads after loading data
        setTimeout(() => {
          handleStalledUploads()
        }, 2000)
      } catch (error) {
        console.error("Error fetching transcriptions:", error)
        toast({
          title: "Error",
          description: "Failed to load your saved items. Please try again.",
          variant: "destructive",
        })
        // Set empty array to prevent UI errors
        setTranscriptions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTranscriptions()

    // Set up audio event listeners
    const audio = audioRef.current

    const handleEnded = () => {
      setCurrentlyPlaying(null)
    }

    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("ended", handleEnded)
    }
  }, [user, toast])

  // Update the Dashboard component to work with Cloudinary URLs
  // Find the handleDelete function and update it to use audioPublicId instead of audioPath
  const handleDelete = async (id, audioPublicId) => {
    try {
      // If this item is currently playing, stop it
      if (currentlyPlaying === id) {
        audioRef.current.pause()
        setCurrentlyPlaying(null)
      }

      await deleteTranscription(id, audioPublicId)
      setTranscriptions(transcriptions.filter((item) => item.id !== id))
      toast({
        title: "Deleted",
        description: "Item has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting transcription:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const playAudio = (id, audioURL) => {
    // If something is already playing, pause it
    if (currentlyPlaying) {
      audioRef.current.pause()

      // If clicking the same item that's playing, just pause it
      if (currentlyPlaying === id) {
        setCurrentlyPlaying(null)
        return
      }
    }

    // Play the new audio
    audioRef.current.src = audioURL
    audioRef.current.play().catch((error) => {
      console.error("Error playing audio:", error)
      toast({
        title: "Playback error",
        description: "There was an error playing the audio",
        variant: "destructive",
      })
    })

    setCurrentlyPlaying(id)
  }

  const downloadText = (text, type) => {
    const element = document.createElement("a")
    const file = new Blob([text], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `afroglot-${type}-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download started",
      description: "Your file is being downloaded",
    })
  }

  const downloadAudio = (audioURL, type, language) => {
    const link = document.createElement("a")
    link.href = audioURL
    link.download = `afroglot-${type}-${language}-${new Date().toISOString().slice(0, 10)}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your audio is being downloaded",
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container max-w-4xl py-8">
        {user && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              Welcome, <span className="text-primary">{user.displayName.split(" ")[0]}</span> !
            </h1>
            <p className="text-muted-foreground mt-2">Here's your personalized dashboard</p>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="speech-to-text">Speech to Text</TabsTrigger>
            <TabsTrigger value="text-to-speech">Text to Speech</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-4">
              {loading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-center">
                      <div className="animate-pulse text-center">
                        <p>Loading your saved items...</p>
                        <div className="mt-2 flex justify-center">
                          <div className="h-2 w-24 bg-primary rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : transcriptions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You don't have any saved items yet.</p>
                    <div className="mt-4 flex justify-center space-x-4">
                      <Button onClick={() => navigate("/speech-to-text")}>Try Speech to Text</Button>
                      <Button onClick={() => navigate("/text-to-speech")} variant="outline">
                        Try Text to Speech
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                transcriptions.map((item) => (
                  <Card key={item.id} className={item.isProcessing ? "opacity-70" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {item.type === "speech-to-text" ? "Speech to Text" : "Text to Speech"}
                            {item.isProcessing && (
                              <span className="ml-2 text-xs text-muted-foreground">(Processing...)</span>
                            )}
                            {item.audioError && (
                              <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Error
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {item.timestamp
                              ? typeof item.timestamp === "string"
                                ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                                : item.timestamp.toDate
                                  ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })
                                  : "Just now"
                              : "Just now"}{" "}
                            •{" " + item.language}
                            {item.voiceGender && ` • ${item.voiceGender} voice`}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.audioPublicId)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          disabled={item.isProcessing}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm">{item.text}</p>

                      {/* Show error message if there was an audio error */}
                      {item.audioError && (
                        <div className="mt-2 flex items-center text-sm text-destructive">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {item.errorMessage || "There was an error processing the audio"}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="flex space-x-2">
                        {item.audioURL && !item.isProcessing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              currentlyPlaying === item.id
                                ? playAudio(item.id, item.audioURL) // This will pause it
                                : playAudio(item.id, item.audioURL)
                            }
                          >
                            {currentlyPlaying === item.id ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Play
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => downloadText(item.text, item.type)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Download Text
                        </Button>
                        {item.audioURL && !item.isProcessing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAudio(item.audioURL, item.type, item.language)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Audio
                          </Button>
                        )}
                        {item.isProcessing && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="animate-spin mr-2 h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                            Audio processing...
                          </div>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="speech-to-text">
            <div className="grid gap-4">
              {loading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-center">
                      <div className="animate-pulse text-center">
                        <p>Loading your transcriptions...</p>
                        <div className="mt-2 flex justify-center">
                          <div className="h-2 w-24 bg-primary rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : transcriptions.filter((item) => item.type === "speech-to-text").length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You don't have any saved transcriptions yet.</p>
                    <div className="mt-4">
                      <Button onClick={() => navigate("/speech-to-text")}>Try Speech to Text</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                transcriptions
                  .filter((item) => item.type === "speech-to-text")
                  .map((item) => (
                    <Card key={item.id} className={item.isProcessing ? "opacity-70" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Transcription
                              {item.isProcessing && (
                                <span className="ml-2 text-xs text-muted-foreground">(Processing...)</span>
                              )}
                              {item.audioError && (
                                <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Error
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>
                              {item.timestamp
                                ? typeof item.timestamp === "string"
                                  ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                                  : item.timestamp.toDate
                                    ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })
                                    : "Just now"
                                : "Just now"}{" "}
                              •{" " + item.language}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id, item.audioPublicId)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            disabled={item.isProcessing}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm">{item.text}</p>
                        {item.errorMessage && (
                          <div className="mt-2 text-xs text-red-500">Error: {item.errorMessage}</div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="flex space-x-2">
                          {item.audioURL && !item.isProcessing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                currentlyPlaying === item.id
                                  ? playAudio(item.id, item.audioURL) // This will pause it
                                  : playAudio(item.id, item.audioURL)
                              }
                            >
                              {currentlyPlaying === item.id ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Play
                                </>
                              )}
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => downloadText(item.text, "transcription")}>
                            <FileText className="mr-2 h-4 w-4" />
                            Download Text
                          </Button>
                          {item.audioURL && !item.isProcessing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadAudio(item.audioURL, "transcription", item.language)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Audio
                            </Button>
                          )}
                          {item.isProcessing && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <div className="animate-spin mr-2 h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                              Audio processing...
                            </div>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="text-to-speech">
            <div className="grid gap-4">
              {loading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-center">
                      <div className="animate-pulse text-center">
                        <p>Loading your speech items...</p>
                        <div className="mt-2 flex justify-center">
                          <div className="h-2 w-24 bg-primary rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : transcriptions.filter((item) => item.type === "text-to-speech").length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">You don't have any saved speech items yet.</p>
                    <div className="mt-4">
                      <Button onClick={() => navigate("/text-to-speech")}>Try Text to Speech</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                transcriptions
                  .filter((item) => item.type === "text-to-speech")
                  .map((item) => (
                    <Card key={item.id} className={item.isProcessing ? "opacity-70" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Speech
                              {item.isProcessing && (
                                <span className="ml-2 text-xs text-muted-foreground">(Processing...)</span>
                              )}
                              {item.audioError && (
                                <span className="ml-2 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Error
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription>
                              {item.timestamp
                                ? typeof item.timestamp === "string"
                                  ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                                  : item.timestamp.toDate
                                    ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })
                                    : "Just now"
                                : "Just now"}{" "}
                              •{" " + item.language} •
                              {" " + item.voiceGender.charAt(0).toUpperCase() + item.voiceGender.slice(1)} voice
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id, item.audioPublicId)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            disabled={item.isProcessing}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm">{item.text}</p>
                        {item.errorMessage && (
                          <div className="mt-2 text-xs text-red-500">Error: {item.errorMessage}</div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="flex space-x-2">
                          {item.audioURL && !item.isProcessing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                currentlyPlaying === item.id
                                  ? playAudio(item.id, item.audioURL) // This will pause it
                                  : playAudio(item.id, item.audioURL)
                              }
                            >
                              {currentlyPlaying === item.id ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Play
                                </>
                              )}
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => downloadText(item.text, "speech")}>
                            <FileText className="mr-2 h-4 w-4" />
                            Download Text
                          </Button>
                          {item.audioURL && !item.isProcessing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadAudio(item.audioURL, "speech", item.language)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Audio
                            </Button>
                          )}
                          {item.isProcessing && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <div className="animate-spin mr-2 h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                              Audio processing...
                            </div>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

