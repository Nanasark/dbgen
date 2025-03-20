import type React from "react"
import type { Schema } from "@/lib/types"

interface SchemaVisualizerProps {
  schema: Schema
}

const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ schema }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(schema).map(([tableName, table]) => (
          <div key={tableName} className="min-w-[250px] border rounded-md bg-white shadow-sm">
            <div className="p-2 border-b font-medium bg-gray-50">{tableName}</div>
            <div>
              {Object.entries(table.columns).map(([columnName, column]) => (
                <div key={columnName} className="p-2 border-b last:border-b-0 flex justify-between">
                  <span className={column.primaryKey ? "font-medium" : ""}>
                    {columnName}
                    {column.foreignKey && <span className="ml-1 text-xs text-blue-600">FK</span>}
                    {column.primaryKey && <span className="ml-1 text-xs text-orange-600">PK</span>}
                  </span>
                  <span className="text-gray-500">{column.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(schema).length > 1 && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium mb-2">Table Relationships</h3>
          <ul className="space-y-2">
            {Object.entries(schema).map(([tableName, table]) => {
              const relationships = Object.entries(table.columns)
                .filter(([_, column]) => column.foreignKey)
                .map(([columnName, column]) => ({
                  from: tableName,
                  to: column.foreignKey?.table || "",
                  fromColumn: columnName,
                  toColumn: column.foreignKey?.column || "id",
                }))

              return relationships.map((rel, index) => (
                <li key={`${tableName}-${index}`} className="flex items-center gap-2">
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
              ))
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SchemaVisualizer

