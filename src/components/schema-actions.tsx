"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Share2 } from "lucide-react"
import type { Schema } from "@/lib/schema"
import { generateSQLScript } from "@/lib/sql-generator"

interface SchemaActionsProps {
  schema: Schema
}

const SchemaActions: React.FC<SchemaActionsProps> = ({ schema }) => {
  const handleGenerateSQL = () => {
    const sqlScript = generateSQLScript(schema)

    // Create a blob and download it
    const blob = new Blob([sqlScript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${schema.name.replace(/\s+/g, "_").toLowerCase()}.sql`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopySQL = () => {
    const sqlScript = generateSQLScript(schema)
    navigator.clipboard
      .writeText(sqlScript)
      .then(() => {
        alert("SQL script copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy SQL script:", err)
      })
  }

  return (
    <div className="flex gap-2 mt-4">
      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleGenerateSQL}>
        <Download className="h-4 w-4" />
        <span>Export SQL</span>
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleCopySQL}>
        <Copy className="h-4 w-4" />
        <span>Copy SQL</span>
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1">
        <Share2 className="h-4 w-4" />
        <span>Share Schema</span>
      </Button>
    </div>
  )
}

export default SchemaActions

