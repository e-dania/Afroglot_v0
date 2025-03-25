import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import FAQ from "./pages/FAQ"
import Dashboard from "./pages/Dashboard"
import SpeechToText from "./pages/SpeechToText"
import TextToSpeech from "./pages/TextToSpeech"
import ProtectedRoute from "./components/protected-route"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/speech-to-text" element={<SpeechToText />} />
      <Route path="/text-to-speech" element={<TextToSpeech />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

