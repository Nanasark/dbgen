import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: Request, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    const { messages } = await request.json()

    const { data, error } = await supabase.from("projects").update({ messages }).eq("id", id).select().single()

    if (error) {
      console.error("Error updating messages:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/projects/[id]/messages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

