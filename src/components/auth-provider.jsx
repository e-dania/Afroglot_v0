"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth, signInWithGoogle, signOut as firebaseSignOut } from "../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

const AuthContext = createContext({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Add this function to check authentication status
  useEffect(() => {
    console.log("Auth state changed:", auth.currentUser)
  }, [user])

  const signIn = async () => {
    try {
      setLoading(true)
      const userCredential = await signInWithGoogle()
      console.log("Sign in successful:", userCredential)
      console.log("User ID after sign in:", userCredential.uid)
      return userCredential
    } catch (error) {
      console.error("Error signing in", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await firebaseSignOut()
    } catch (error) {
      console.error("Error signing out", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, signIn, signOut, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

