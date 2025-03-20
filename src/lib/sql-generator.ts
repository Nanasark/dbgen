import type { Schema } from "./schema"

export const generateSQLScript = (schema: Schema): string => {
  let sqlScript = `-- ${schema.name} SQL Schema\n\n`

  // Generate CREATE TABLE statements
  schema.tables.forEach((table) => {
    sqlScript += `CREATE TABLE ${table.name} (\n`

    // Add columns
    const columnDefinitions = table.columns.map((column) => {
      let definition = `  ${column.name} ${getSQLType(column.type)}`

      // Add primary key constraint for id columns
      if (column.name === "id") {
        definition += " PRIMARY KEY"
      }

      return definition
    })

    sqlScript += columnDefinitions.join(",\n")

    // Add foreign key constraints
    const foreignKeys = table.columns.filter((column) => column.name.endsWith("_id") && column.name !== "id")

    if (foreignKeys.length > 0) {
      sqlScript += ",\n"

      const foreignKeyConstraints = foreignKeys.map((column) => {
        const targetTable = column.name.replace("_id", "")
        return `  FOREIGN KEY (${column.name}) REFERENCES ${targetTable}s(id)`
      })

      sqlScript += foreignKeyConstraints.join(",\n")
    }

    sqlScript += "\n);\n\n"
  })

  return sqlScript
}

// Helper function to map schema types to SQL types
const getSQLType = (type: string): string => {
  switch (type.toLowerCase()) {
    case "int":
      return "INTEGER"
    case "varchar":
      return "VARCHAR(255)"
    case "text":
      return "TEXT"
    case "timestamp":
      return "TIMESTAMP"
    default:
      return type.toUpperCase()
  }
}

