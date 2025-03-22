import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, {
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {

    const {id} = await params
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching project:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/projects/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request,{
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const body = await request.json()
    const {id} = await params

    const { data, error } = await supabase.from("projects").update(body).eq("id", id).select().single()

    if (error) {
      console.error("Error updating project:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/projects/[id]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

