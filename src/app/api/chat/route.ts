import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Schema } from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { messages, projectId } = await request.json();

    // Get current project schema from Supabase
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    console.log(project);

    const userMessage = messages[messages.length - 1].content.toLowerCase();

    // ✅ List of casual messages that should NOT trigger schema generation
    const casualMessages = [
      "thank you", "thanks", "great job", "well done", "awesome", "good work",
      "tell me a joke", "hi", "hello", "hey"
    ];

    // ✅ If user sends a casual message, return a polite response WITHOUT schema
    if (casualMessages.includes(userMessage)) {
      return NextResponse.json({
        message: "You're welcome! Let me know if you need help with database design.",
        schema: null,
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    // System prompt to ensure clean JSON response or short answers
    const systemPrompt = `You are an expert database designer.

**Rules for Responses:**
- If the user provides **clear** requirements, generate a **JSON schema only** (no extra text).  
- If the request is **unclear**, ask **one or two** short follow-up questions to gather more details.  
- If they say "thank you" or a similar phrase, simply respond politely and do nothing else.  
- If asked a **general question**, reply in **1-2 sentences** with a clear answer.  
- Keep responses concise and relevant.  
- NEVER assume details—always confirm when necessary.

**Example Questions to Ask Before Generating a Schema:**
- What type of project is this for? (e.g., E-commerce, School Management, Social Media)
- What entities (tables) should be included?
- What key relationships should exist between the tables?
- Do you need authentication or user roles?

**Schema Format (Only return this if the requirements are clear):**
{
  "TableName": {
    "columns": {
      "columnName": {
        "type": "dataType",
        "primaryKey": boolean,
        "foreignKey": { "table": "ReferencedTable", "column": "ReferencedColumn" },
        "nullable": boolean,
        "unique": boolean
      }
    }
  }
}`;

    // Format messages for Gemini
    const formattedMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...messages.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ];

    // Get response from the model
    const result = await model.generateContent({
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    const text = result.response.text();

    // Improved JSON extraction logic
    let schema: Schema | null = null;
    let responseMessage = "";

    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/); // Extracts first JSON-like structure
      if (jsonMatch) {
        schema = JSON.parse(jsonMatch[0]);
      } else {
        responseMessage = text.trim(); // If no JSON, treat it as a short answer
      }
    } catch (error) {
      console.error("Error extracting schema:", error);
      responseMessage = "I couldn't extract a valid schema. Can you rephrase?";
    }

    // Store schema in Supabase if it's valid
    if (schema) {
      await supabase.from("projects").update({ schema }).eq("id", projectId);
      responseMessage = "Schema generated successfully.";
    }

    return NextResponse.json({
      message: responseMessage,
      schema: schema,
    });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
