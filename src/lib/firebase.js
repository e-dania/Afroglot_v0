import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth"
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
let analytics = null

// Initialize analytics only in browser environment
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

const googleProvider = new GoogleAuthProvider()

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Modify the saveTranscription function to use Cloudinary instead of Firebase Storage
export const saveTranscription = async (userId, data) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to save transcription")
    }

    // Create the document first without the audio URL
    const newTranscription = {
      userId,
      text: data.text || "",
      language: data.language || "yoruba",
      type: data.type || "speech-to-text",
      voiceGender: data.voiceGender || null,
      voice: data.voice || null,
      timestamp: new Date().toISOString(),
      segments: data.segments || null,
      isProcessing: true, // Flag to indicate processing state
      processingStartTime: Date.now(), // Add timestamp for processing start
    }

    // Add the document to Firestore first to give immediate feedback
    const transcriptionsRef = collection(db, "transcriptions")
    const docRef = await addDoc(transcriptionsRef, newTranscription)
    const docId = docRef.id

    // If audio blob is provided, upload it to Cloudinary instead of Firebase Storage
    if (data.audioBlob) {
      try {
        console.log("Starting audio upload to Cloudinary for document:", docId)
        console.log("Audio blob size:", data.audioBlob.size, "bytes")
        console.log("Audio blob type:", data.audioBlob.type)

        // Import the Cloudinary upload function
        const { uploadAudioToCloudinary } = await import("./cloudinary")

        // Set a timeout to mark as failed if it takes too long (2 minutes)
        const timeoutId = setTimeout(async () => {
          console.error("Audio upload timeout reached for document:", docId)
          await updateDoc(doc(db, "transcriptions", docId), {
            isProcessing: false,
            audioError: true,
            errorMessage: "Upload timed out after 2 minutes",
          })
        }, 120000)

        // Upload to Cloudinary instead of Firebase Storage
        const uploadResult = await uploadAudioToCloudinary(data.audioBlob, userId, data.type)

        // Clear the timeout since upload succeeded
        clearTimeout(timeoutId)

        console.log("Audio upload to Cloudinary successful:", uploadResult)

        // Update the document with audio information from Cloudinary
        await updateDoc(doc(db, "transcriptions", docId), {
          audioURL: uploadResult.url,
          audioPublicId: uploadResult.publicId, // Store Cloudinary public ID instead of Firebase path
          audioDuration: uploadResult.duration,
          audioFormat: uploadResult.format,
          isProcessing: false,
        })

        return {
          id: docId,
          ...newTranscription,
          audioURL: uploadResult.url,
          audioPublicId: uploadResult.publicId,
          isProcessing: false,
        }
      } catch (audioError) {
        console.error("Error uploading audio to Cloudinary:", audioError)

        // Update the document to indicate error but keep the text
        await updateDoc(doc(db, "transcriptions", docId), {
          isProcessing: false,
          audioError: true,
          errorMessage: audioError.message || "Unknown error during audio upload",
        })

        return {
          id: docId,
          ...newTranscription,
          isProcessing: false,
          audioError: true,
          errorMessage: audioError.message,
        }
      }
    } else {
      // No audio to upload, mark as not processing
      await updateDoc(doc(db, "transcriptions", docId), {
        isProcessing: false,
      })

      return {
        id: docId,
        ...newTranscription,
        isProcessing: false,
      }
    }
  } catch (error) {
    console.error("Error saving transcription:", error)
    throw error
  }
}

// Replace the deleteTranscription function to use Cloudinary
export const deleteTranscription = async (transcriptionId, audioPublicId) => {
  try {
    // Delete the document from Firestore
    const transcriptionRef = doc(db, "transcriptions", transcriptionId)
    await deleteDoc(transcriptionRef)

    // If there's an associated audio file, delete it from Cloudinary
    if (audioPublicId) {
      try {
        // Import the Cloudinary delete function
        const { deleteAudioFromCloudinary } = await import("./cloudinary")
        await deleteAudioFromCloudinary(audioPublicId)
      } catch (cloudinaryError) {
        console.error("Error deleting audio from Cloudinary:", cloudinaryError)
        // Continue even if Cloudinary deletion fails
      }
    }
  } catch (error) {
    console.error("Error deleting transcription:", error)
    throw error
  }
}

// Remove the uploadAudio function since we're now using Cloudinary
// export const uploadAudio = async (userId, audioBlob, type) => { ... }

export const getUserTranscriptions = async (userId) => {
  try {
    if (!userId) {
      console.error("User ID is required to get transcriptions")
      return []
    }

    const transcriptionsRef = collection(db, "transcriptions")
    const q = query(transcriptionsRef, where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    const transcriptions = []

    querySnapshot.forEach((doc) => {
      transcriptions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return transcriptions
  } catch (error) {
    console.error("Error getting transcriptions:", error)
    return []
  }
}

export { auth, db, storage }

