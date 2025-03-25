// Spitch API integration for speech-to-text, text-to-speech and other language services

const SPITCH_API_BASE_URL = "https://api.spi-tch.com/v1"
const API_KEY = import.meta.env.VITE_SPITCH_API_KEY

/**
 * Check if the Spitch API key is configured
 * @returns {boolean} - Whether the API key is available
 */
export const isApiKeyConfigured = () => {
  return !!API_KEY
}

// Update the transcribeAudio function to use the correct endpoint and parameters
export const transcribeAudio = async (audioBlob, language) => {
  if (!API_KEY) {
    throw new Error("Spitch API key not configured. Please check your environment variables.")
  }

  // Convert language names to Spitch language codes if needed
  const languageMap = {
    yoruba: "yo",
    igbo: "ig",
    hausa: "ha",
  }

  const languageCode = languageMap[language.toLowerCase()] || language

  // Log the audio blob details for debugging
  console.log("Audio blob type:", audioBlob.type)
  console.log("Audio blob size:", audioBlob.size)

  // Create form data with the audio file
  const formData = new FormData()

  // Ensure we're using the correct field name 'content' as per the API docs
  formData.append("content", audioBlob, "recording.wav")
  formData.append("language", languageCode)
  formData.append("timestamp", "true")
  formData.append("multispeaker", "true")

  try {
    console.log("Sending request to Spitch API...")

    const response = await fetch(`${SPITCH_API_BASE_URL}/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        // Note: Do NOT set Content-Type header when using FormData
        // The browser will set it automatically with the correct boundary
      },
      body: formData,
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      let errorMessage = "Transcription failed"
      try {
        const errorData = await response.json()
        console.error("API error response:", errorData)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        console.error("Could not parse error response:", e)
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("Transcription response:", data)

    // Return the full response object with text and segments
    return {
      text: data.text || "Transcription failed to return text.",
      segments: data.segments || [],
      request_id: data.request_id,
    }
  } catch (error) {
    console.error("Spitch API error:", error)
    throw error
  }
}

/**
 * Convert text to speech using Spitch's text-to-speech API
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice to use (e.g., "sade")
 * @param {string} language - The language code (e.g., "yo", "ig", "ha")
 * @param {boolean} stream - Whether to stream the audio (default: false)
 * @returns {Promise<Blob>} - The audio blob
 */
export const textToSpeech = async (text, voice, language, stream = false) => {
  if (!API_KEY) {
    throw new Error("Spitch API key not configured. Please check your environment variables.")
  }

  // Convert language names to Spitch language codes if needed
  const languageMap = {
    yoruba: "yo",
    igbo: "ig",
    hausa: "ha",
  }

  const languageCode = languageMap[language.toLowerCase()] || language

  try {
    // Prepare the request body
    const requestBody = {
      text: text,
      voice: voice,
      language: languageCode,
    }

    // Add stream parameter to query string if true
    const queryParams = stream ? "?stream=true" : ""

    const response = await fetch(`${SPITCH_API_BASE_URL}/speech${queryParams}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("TTS API error details:", errorData)
      throw new Error(errorData.message || "Text-to-speech conversion failed")
    }

    // If streaming, return the response directly
    if (stream) {
      return response
    }

    // Otherwise, get the audio blob
    const audioBlob = await response.blob()
    return audioBlob
  } catch (error) {
    console.error("Spitch API error:", error)
    throw error
  }
}

/**
 * Get available voices from Spitch API
 * @param {string} language - Optional language code to filter voices
 * @returns {Promise<Array>} - List of available voices
 */
export const getAvailableVoices = async (language = null) => {
  if (!API_KEY) {
    throw new Error("Spitch API key not configured. Please check your environment variables.")
  }

  try {
    // Add language filter if provided
    const queryParams = language ? `?language=${language}` : ""

    const response = await fetch(`${SPITCH_API_BASE_URL}/voices${queryParams}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch voices")
    }

    const data = await response.json()
    return data.voices
  } catch (error) {
    console.error("Spitch API error:", error)
    throw error
  }
}

/**
 * Get available languages from Spitch API
 * @returns {Promise<Array>} - List of supported languages
 */
export const getAvailableLanguages = async () => {
  if (!API_KEY) {
    throw new Error("Spitch API key not configured. Please check your environment variables.")
  }

  try {
    const response = await fetch(`${SPITCH_API_BASE_URL}/languages`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to fetch languages")
    }

    const data = await response.json()
    return data.languages
  } catch (error) {
    console.error("Spitch API error:", error)
    throw error
  }
}

