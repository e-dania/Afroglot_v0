import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import { AuthProvider } from "./components/auth-provider.jsx"
import { ThemeProvider } from "./components/theme-provider.jsx"
import { Toaster } from "./components/ui/toaster.jsx"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="afroglot-theme">
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

