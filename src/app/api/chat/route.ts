import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Schema } from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { messages, projectId } = await request.json();

    // Get the current project schema from Supabase
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    const currentSchema = project.schema || {};
    const userMessage = messages[messages.length - 1].content.toLowerCase();

    // Predefined Employee Schema if requested and no schema exists
    if (userMessage.includes("employee") && Object.keys(currentSchema).length === 0) {
      const employeeSchema: Schema = {
        Users: {
          columns: {
            id: { type: "int", primaryKey: true },
            name: { type: "varchar" },
            email: { type: "varchar" },
            password: { type: "varchar" },
            phone: { type: "varchar" },
          },
        },
        Roles: {
          columns: {
            id: { type: "int", primaryKey: true },
            role_name: { type: "varchar" },
          },
        },
        Login_History: {
          columns: {
            id: { type: "int", primaryKey: true },
            user_id: { type: "int", foreignKey: { table: "Users", column: "id" } },
            login_time: { type: "Timestamp" },
            ip_address: { type: "varchar" },
          },
        },
        Permissions: {
          columns: {
            id: { type: "int", primaryKey: true },
            role_id: { type: "int", foreignKey: { table: "Roles", column: "id" } },
            permission_name: { type: "varchar" },
            permission_id: { type: "int" },
          },
        },
      };

      return NextResponse.json({
        message:
          "I've created an employee database schema with Users, Roles, Login History, and Permissions tables. Would you like any modifications?",
        schema: employeeSchema,
      });
    }

    // Check for Gemini API key
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

    // System prompt to ensure clean JSON response
    const systemPrompt = `You are an expert database designer. 
Return only a JSON schema, without additional text.
if what they say does not make sense ask a simple one line follow up question to understand them
Format it like this:
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

    // Improved JSON extraction from response
    let schema: Schema | null = null;
    try {
      const jsonStartIndex = text.indexOf("{");
      const jsonEndIndex = text.lastIndexOf("}");

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonText = text.substring(jsonStartIndex, jsonEndIndex + 1);
        schema = JSON.parse(jsonText);
      }
    } catch (error) {
      console.error("Error extracting schema:", error);
    }

    // Store schema in Supabase
    if (schema) {
      await supabase.from("projects").update({ schema }).eq("id", projectId);
    }

    return NextResponse.json({
      message: schema ? "Schema generated successfully." : "Failed to generate schema.",
      schema: schema,
    });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
