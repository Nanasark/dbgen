import type React from "react"
import type { Schema } from "@/lib/schema"

interface TableRelationshipVisualizerProps {
  schema: Schema
}

const TableRelationshipVisualizer: React.FC<TableRelationshipVisualizerProps> = ({ schema }) => {
  // Identify potential relationships between tables
  const findRelationships = () => {
    const relationships: Array<{ from: string; to: string; fromColumn: string; toColumn: string }> = []

    schema.tables.forEach((table) => {
      table.columns.forEach((column) => {
        // Look for columns that might be foreign keys (ending with _id)
        if (column.name.endsWith("_id") && column.name !== "id") {
          const targetTableName = column.name.replace("_id", "")
          const targetTable = schema.tables.find(
            (t) =>
              t.name.toLowerCase() === targetTableName ||
              t.name.toLowerCase() === targetTableName + "s" ||
              t.name.toLowerCase() === targetTableName.replace("_", " "),
          )

          if (targetTable) {
            relationships.push({
              from: table.name,
              to: targetTable.name,
              fromColumn: column.name,
              toColumn: "id",
            })
          }
        }
      })
    })

    return relationships
  }

  const relationships = findRelationships()

  return (
    <div className="mt-4 p-4 border rounded-md bg-gray-50">
      <h3 className="font-medium mb-2">Table Relationships</h3>
      {relationships.length > 0 ? (
        <ul className="space-y-2">
          {relationships.map((rel, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="font-medium">{rel.from}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
              <span className="font-medium">{rel.to}</span>
              <span className="text-sm text-gray-500">
                ({rel.fromColumn} references {rel.to}.{rel.toColumn})
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No relationships detected yet</p>
      )}
    </div>
  )
}

export default TableRelationshipVisualizer

