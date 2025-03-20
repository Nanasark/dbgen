"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Database } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const createNewProject = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Project",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const data = await response.json()
      router.push(`/projects/${data.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <Database className="h-8 w-8" />
          <h1 className="text-3xl font-bold">KeyMap</h1>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-4">Database Schema Designer</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Create database schemas through an interactive AI-powered experience. Answer a few questions and get a
            complete database schema for your project.
          </p>
        </div>

        <Button
          onClick={createNewProject}
          className="rounded-full px-8 py-6 bg-black hover:bg-gray-800 text-white flex items-center gap-2 h-auto"
          disabled={loading}
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Project</span>
        </Button>

        <div className="mt-12 w-full">
          <h3 className="text-lg font-medium mb-4">Recent Projects</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-8 text-center text-gray-500">
              No projects yet. Create your first project to get started.
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

