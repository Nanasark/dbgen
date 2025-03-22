# AI-Powered Database Schema Generator

## Overview
This project is an AI-powered database schema generator that helps users design database structures based on natural language prompts. It utilizes Google Generative AI to understand user input, ask clarifying questions, and generate appropriate database schemas.

## Features
- **Conversational Schema Design**: The AI interacts with users to gather project requirements.
- **Automated Schema Generation**: Produces JSON-based database schemas.
- **Schema Storage**: Saves generated schemas in Supabase for persistence.
- **Customizable Responses**: Ensures short and relevant AI responses.
- **Many-to-Many Relationship Handling**: Supports complex relationships in schema design.

## Technology Stack
- **Next.js**: Framework for building server-side rendered React applications.
- **Google Generative AI (Gemini 2.0)**: Powers the AI-driven schema generation.
- **Supabase**: Database and storage for saving schemas.
- **TypeScript**: Ensures type safety and code maintainability.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/ai-database-schema-generator.git
   cd ai-database-schema-generator
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file and add the following:
     ```sh
     GEMINI_API_KEY=your_google_gemini_api_key
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_anon_key
     ```

## Running the Project
To start the development server, run:
```sh
npm run dev
```
The application will be available at `http://localhost:3000`.

## API Endpoints
### **POST /api/chat**
Handles user queries and generates database schemas.
#### Request Body:
```json
{
  "messages": [
    { "role": "user", "content": "Create a database for my club members" }
  ],
  "projectId": "12345"
}
```
#### Response:
```json
{
  "message": "Schema generated successfully.",
  "schema": {
    "Members": {
      "columns": {
        "id": { "type": "int", "primaryKey": true },
        "name": { "type": "varchar" },
        "email": { "type": "varchar", "unique": true },
        "join_date": { "type": "date" }
      }
    }
  }
}
```

## Usage
1. Start a conversation by describing your database needs.
2. The AI may ask follow-up questions to refine the schema.
3. The generated schema is returned as structured JSON.
4. You can save, modify, or use the schema as needed.

## Testing
- **Unit Testing**: Validate API responses and schema generation.
- **Integration Testing**: Ensure proper interaction with Supabase.
- **Manual Testing**: Check AI responses for accuracy.

## Future Improvements
- Support for more AI models.
- Enhanced UI for schema visualization.
- Export schema as SQL or other formats.

## License
This project is licensed under the MIT License.

