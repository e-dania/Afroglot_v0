"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Menu, X, Mic, FileText, User, Sun, Moon } from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "./auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme } from "./theme-provider"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, signIn, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: location.pathname === "/",
    },
    {
      href: "/speech-to-text",
      label: "Speech to Text",
      active: location.pathname === "/speech-to-text",
      icon: <Mic className="mr-2 h-4 w-4" />,
    },
    {
      href: "/text-to-speech",
      label: "Text to Speech",
      active: location.pathname === "/text-to-speech",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/faq",
      label: "FAQ",
      active: location.pathname === "/faq",
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      active: location.pathname === "/dashboard",
      icon: <User className="mr-2 h-4 w-4" />,
      auth: true,
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Mic className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-xl">Afroglot</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 ml-10">
          {routes.map((route) => {
            if (route.auth && !user) return null

            return (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.icon}
                {route.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center ml-auto space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Mic className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-bold">Afroglot</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="mt-8 flex flex-col space-y-4">
                {routes.map((route) => {
                  if (route.auth && !user) return null

                  return (
                    <Link
                      key={route.href}
                      to={route.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary flex items-center",
                        route.active ? "text-primary" : "text-muted-foreground",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  )
                })}
                {!user && (
                  <div className="flex flex-col space-y-2 mt-4 pt-4 border-t">
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link to="/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

