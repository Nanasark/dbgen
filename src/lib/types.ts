export interface Column {
    type: string
    primaryKey?: boolean
    foreignKey?: {
      table: string
      column: string
    }
    nullable?: boolean
    unique?: boolean
    default?: string
  }
  
  export interface Table {
    columns: Record<string, Column>
  }
  
  export interface Schema {
    [tableName: string]: Table
  }
  
  export interface Project {
    id: string
    name: string
    schema: Schema | null
    messages: Array<{ content: string; role: "user" | "assistant" }>
    created_at: string
    updated_at: string
  }
  
  