"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Mic, StopCircle, Play, Pause, Upload, Save, Trash } from "lucide-react"
import { useToast } from "../hooks/use-toast"

export default function AudioRecorder({ onSaveAudio, language }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [uploadedAudio, setUploadedAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [audioSource, setAudioSource] = useState(null) // "recorded" or "uploaded"
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioReady, setAudioReady] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingStartTime, setRecordingStartTime] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(null)
  const recordingTimerRef = useRef(null)
  const { toast } = useToast()

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()

    const handleCanPlayThrough = () => {
      setAudioReady(true)
      if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
        setDuration(audioRef.current.duration)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const audio = audioRef.current
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.pause()
      audio.src = ""
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  // Optimize the audio recording to create smaller files
  const startRecording = async () => {
    try {
      // Reset any previous recordings
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio)
        setRecordedAudio(null)
      }

      setAudioReady(false)
      setDuration(0)
      setCurrentTime(0)
      setRecordingDuration(0)
      setRecordingStartTime(Date.now())

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono recording for better compatibility and smaller file size
          sampleRate: 22050, // Lower sample rate for smaller file size (still good quality)
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // Use specific MIME type that's compatible with Spitch API
      // Try to use audio/webm which is more compressed than wav
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/wav")
          ? "audio/wav"
          : ""

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 64000, // Lower bitrate for smaller file size (64 kbps is still good quality)
      })

      audioChunksRef.current = []

      // Start a timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTime) / 1000
        setRecordingDuration(elapsed)
      }, 100)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        // Clear the recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
        }

        // Get the final recording duration
        const finalDuration = recordingDuration

        // Create the audio blob with the correct MIME type
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        setCurrentAudio(audioUrl)
        setAudioSource("recorded")

        // Set duration immediately for recorded audio
        setDuration(finalDuration)
        setAudioReady(true)

        // Load the audio for playback
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.load()
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())

        toast({
          title: "Recording complete",
          description: `Audio recorded (${(audioBlob.size / 1024).toFixed(1)} KB)`,
        })
      }

      // Request data every 1 second to ensure we get chunks
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      })
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use this feature",
        variant: "destructive",
      })
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check if it's an audio file
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      })
      return
    }

    // Revoke previous URL if exists
    if (uploadedAudio) {
      URL.revokeObjectURL(uploadedAudio)
    }

    setAudioReady(false)
    setDuration(0)
    setCurrentTime(0)

    const audioUrl = URL.createObjectURL(file)
    setUploadedAudio(audioUrl)
    setCurrentAudio(audioUrl)
    setAudioSource("uploaded")

    // Load the audio for playback
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.load()
    }

    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully`,
    })
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentAudio || !audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      // For recorded audio, we'll use our manually tracked duration
      if (audioSource === "recorded" && !audioRef.current.duration && duration > 0) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          toast({
            title: "Playback error",
            description: "There was an error playing the audio",
            variant: "destructive",
          })
        })
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
  }

  // Save audio to parent component
  const saveAudio = () => {
    if (!currentAudio) {
      toast({
        title: "No audio to save",
        description: "Please record or upload audio first",
        variant: "destructive",
      })
      return
    }

    // Get the blob from the current audio URL
    fetch(currentAudio)
      .then((response) => response.blob())
      .then((blob) => {
        // For recorded audio, we need to ensure it's in a format Spitch can process
        if (audioSource === "recorded") {
          // We'll pass the blob directly, but log its type for debugging
          console.log("Recorded audio blob type:", blob.type)
          console.log("Recorded audio blob size:", blob.size)

          // Pass the blob to the parent component
          onSaveAudio(blob, audioSource)
        } else {
          // For uploaded audio, pass it directly
          onSaveAudio(blob, audioSource)
        }

        toast({
          title: "Audio saved",
          description: "Your audio has been saved successfully",
        })
      })
      .catch((error) => {
        console.error("Error saving audio:", error)
        toast({
          title: "Save failed",
          description: "There was an error saving your audio",
          variant: "destructive",
        })
      })
  }

  // Clear current audio
  const clearAudio = () => {
    if (currentAudio && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      URL.revokeObjectURL(currentAudio)

      if (audioSource === "recorded") {
        setRecordedAudio(null)
      } else {
        setUploadedAudio(null)
      }

      setCurrentAudio(null)
      setAudioSource(null)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      setAudioReady(false)

      toast({
        title: "Audio cleared",
        description: "Your audio has been cleared",
      })
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audio Recorder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording/Upload Controls */}
        <div className="flex flex-wrap gap-2 justify-between">
          <div>
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isRecording || isPlaying}
                className="bg-red-500 hover:bg-red-600"
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Recording {formatTime(recordingDuration)}
              </Button>
            )}
          </div>

          <div className="relative">
            <input
              type="file"
              id="audio-upload"
              className="sr-only"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isRecording}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("audio-upload").click()}
              disabled={isRecording}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Audio
            </Button>
          </div>
        </div>

        {/* Audio Player */}
        {currentAudio && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">
              {audioSource === "recorded" ? "Recorded Audio" : "Uploaded Audio"}
              {!audioReady && audioSource === "uploaded" && " (Loading...)"}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="outline"
                onClick={togglePlayPause}
                disabled={isRecording || (audioSource === "uploaded" && !audioReady)}
              >
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

              <Button size="icon" variant="outline" onClick={clearAudio} disabled={isRecording}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={saveAudio}
          disabled={!currentAudio || isRecording || (audioSource === "uploaded" && !audioReady)}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          Use This Audio
        </Button>
      </CardFooter>
    </Card>
  )
}

