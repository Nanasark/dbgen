export interface Column {
    name: string
    type: string
  }
  
  export interface Table {
    name: string
    columns: Column[]
  }
  
  export interface Schema {
    name: string
    tables: Table[]
  }
  
  export const initialSchema: Schema = {
    name: "New Schema",
    tables: [],
  }
  
  