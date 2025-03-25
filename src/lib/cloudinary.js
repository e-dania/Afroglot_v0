// Cloudinary integration for audio file uploads

/**
 * Uploads an audio blob to Cloudinary
 * @param {Blob} audioBlob - The audio blob to upload
 * @param {string} userId - User ID for organizing uploads
 * @param {string} type - Type of audio (speech-to-text or text-to-speech)
 * @returns {Promise<Object>} - Object containing the URL and public ID
 */
export const uploadAudioToCloudinary = async (audioBlob, userId, type) => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData()

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${type}_${timestamp}`

    // Add the file to the FormData
    formData.append("file", audioBlob, `${filename}.wav`)

    // Add upload parameters
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    formData.append("folder", `afroglot/${userId}`)
    formData.append("resource_type", "auto")
    formData.append("public_id", filename)

    // Add tags for better organization
    formData.append("tags", `user_${userId},${type}`)

    // Make the upload request to Cloudinary
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Failed to upload to Cloudinary")
    }

    const data = await response.json()

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      duration: data.duration || null,
      resourceType: data.resource_type,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

/**
 * Deletes an audio file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - Response from Cloudinary
 */
export const deleteAudioFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("Public ID is required to delete from Cloudinary")
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

    // For client-side deletion, you would typically use a server endpoint
    // This is a simplified example that would require your API key and secret
    // In production, you should handle deletion through a secure backend

    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = generateSignature(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("api_key", apiKey)
    formData.append("timestamp", timestamp)
    formData.append("signature", signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    })

    return await response.json()
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw error
  }
}

// Helper function to generate signature (in production, do this server-side)
function generateSignature(string) {
  // This is a placeholder - in a real app, you would use a crypto library
  // or preferably handle this on the server side
  console.warn("Signature generation should be done server-side in production")
  return "signature_placeholder"
}

