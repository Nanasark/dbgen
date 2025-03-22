"use client"

import type React from "react"

import { useState, useEffect, useRef ,use} from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Database, ArrowLeft, Save } from "lucide-react"
import SchemaVisualizer from "@/components/schema-visualizer"
import Link from "next/link"
import type { Schema } from "@/lib/types"
import ReactMarkdown from "react-markdown"

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)

  const projectId = resolvedParams.id as string
  const [projectName, setProjectName] = useState("Loading...")
  const [schema, setSchema] = useState<Schema | null>(null)
  const [messages, setMessages] = useState<Array<{ content: string; role: "user" | "assistant" }>>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }
        const data = await response.json()
        setProjectName(data.name)
        setSchema(data.schema || null)
        setMessages(data.messages || [])

        // If no messages, start the conversation
        if (!data.messages || data.messages.length === 0) {
          const initialMessage = {
            role: "assistant" as const,
            content: "What kind of database do you need?",
          }
          setMessages([initialMessage])
          await saveMessages([initialMessage])
        }
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setInitializing(false)
      }
    }

    fetchProject()
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const saveMessages = async (newMessages: Array<{ content: string; role: "user" | "assistant" }>) => {
    try {
      await fetch(`/api/projects/${projectId}/messages`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      })
    } catch (error) {
      console.error("Error saving messages:", error)
    }
  }

  const saveSchema = async (newSchema: Schema) => {
    try {
      await fetch(`/api/projects/${projectId}/schema`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schema: newSchema }),
      })
    } catch (error) {
      console.error("Error saving schema:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return

    const userMessage = { role: "user" as const, content: inputValue }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setLoading(true)

    try {
      await saveMessages(newMessages)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          projectId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      // Only add AI message if there's content
      if (data.message && data.message.trim()) {
        const aiMessage = { role: "assistant" as const, content: data.message }
        const updatedMessages = [...newMessages, aiMessage]
        setMessages(updatedMessages)
        await saveMessages(updatedMessages)
      }

      // If schema was updated
      if (data.schema) {
        setSchema(data.schema)
        await saveSchema(data.schema)
      }
    } catch (error) {
      console.error("Error in chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b p-4 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span className="font-semibold">KeyMap</span>
          </div>
        </div>

        <div className="text-center font-medium">{projectName}</div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            if (schema) {
              saveSchema(schema)
            }
          }}
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
      </header>

      <div className="flex-1 flex flex-col">
        {schema && Object.keys(schema).length > 0 && (
          <div className="p-4 overflow-x-auto">
            <SchemaVisualizer schema={schema} />
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end">
          <div className="space-y-4 max-w-3xl mx-auto w-full">
            {messages.slice(-2).map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gray-100 text-gray-900"
                      : "border border-gray-200 bg-white text-gray-800"
                  } max-w-[80%]`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-md font-bold mb-2">{children}</h3>,
                        a: ({ href, children }) => (
                          <a href={href} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">{children}</blockquote>
                        ),
                        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded">{children}</code>,
                        pre: ({ children }) => (
                          <pre className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">{children}</pre>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="relative flex items-center max-w-3xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              disabled={loading}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2"
              onClick={handleSendMessage}
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

