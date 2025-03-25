import { Link } from "react-router-dom"
import { Mic, Github, Twitter, Facebook, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Mic className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-xl">Afroglot</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Bridging the digital accessibility gap for African languages with voice transcription services.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/speech-to-text" className="text-muted-foreground hover:text-foreground">
                  Speech to Text
                </Link>
              </li>
              <li>
                <Link to="/text-to-speech" className="text-muted-foreground hover:text-foreground">
                  Text to Speech
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-muted-foreground hover:text-foreground">
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Afroglot. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

