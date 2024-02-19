import { getCurrentUser } from "@/app/lib/server/auth";
import { sql } from "@/app/lib/server/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parent_id = searchParams.get("parent_id");
  const user = await getCurrentUser();
  let notesRes = null;
  if (parent_id) {
    notesRes = await sql(
      "select * from notes where parent_id = $1 and user_id = $2 order by title asc",
      [parent_id, user.id]
    );
  } else {
    notesRes = await sql(
      "select * from notes where user_id = $1 and parent_id is null order by title asc",
      [user.id]
    );
  }

  const ids = notesRes.rows.map((n) => n.id);

  const childNotesRes = await sql(
    "select parent_id, count(*)::int from notes where parent_id = any($1) group by parent_id",
    [ids]
  );
  const childNoteCountMap = childNotesRes.rows.reduce((map, row) => {
    map[row.parent_id] = row.count;
    return map;
  }, {});

  notesRes.rows.forEach((row) => {
    if (childNoteCountMap.hasOwnProperty(row.id)) {
      row.childCount = childNoteCountMap[row.id];
    } else {
      row.childCount = 0;
    }
  });

  return NextResponse.json(notesRes.rows);
}

export const POST = async (req: Request) => {
  const user = await getCurrentUser();
  const result = await sql(
    "insert into notes (title, user_id) values ('Untitled', $1) returning *",
    [user.id]
  );
  return NextResponse.json(result.rows[0]);
}