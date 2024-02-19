import { getCurrentUser } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";
import Note from "@/app/ui/Note";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { z } from "zod";

const NoteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  is_published: z.boolean().optional()
});

const UpdateNoteSchema = NoteSchema.omit({ id: true, user_id: true });

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser();
  const { id } = params;
  const body = await req.json();
  const result = UpdateNoteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        errors: result.error.flatten().fieldErrors,
        message: "update note bad request",
      }
    );
  }
  const { data } = result;

  const userNote = await sql("select * from notes where user_id = $1 and id = $2", [user.id, id]);
  if (userNote.rowCount === 0) {
    return NextResponse.json({ message: "Unauthorized access to note" }, { status: 403 });
  }

  const { title, content, is_published } = data;
  const note = await sql(
    "update notes set title = $1, content = $2, is_published = $3, updated_at = $4 where id = $5 returning *",
    [title, content, is_published, DateTime.now().toJSDate(), id]
  );

  return NextResponse.json(note.rows[0]);
}

export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  const user = await getCurrentUser();
  const { id } = params;
  const note = await sql("select * from notes where user_id = $1 and id = $2", [user.id, id]);
  if (note.rowCount === 0) {
    return NextResponse.json({ message: "note not found" }, { status: 404 });
  }
  return NextResponse.json(note.rows[0]);
}
